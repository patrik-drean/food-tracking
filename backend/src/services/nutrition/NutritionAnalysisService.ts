import { createHash } from 'crypto';
import { openai, OPENAI_MODEL, OPENAI_MAX_TOKENS, OPENAI_TEMPERATURE } from '@/lib/openai';
import { NutritionCache } from './NutritionCache';
import { validateFoodDescription } from '@/utils/validation';
import { prisma } from '@/lib/prisma';

interface NutritionData {
  calories: number;
  fat: number;
  carbs: number;
  protein: number;
}

interface NutritionAnalysis extends NutritionData {
  source: 'AI_GENERATED' | 'CACHED';
  confidence?: string;
}

export class NutritionAnalysisService {
  private cache: NutritionCache;

  constructor() {
    this.cache = new NutritionCache();
  }

  async analyzeFoodNutrition(description: string): Promise<NutritionAnalysis> {
    validateFoodDescription(description);

    const cacheKey = this.normalizeDescription(description);
    const descriptionHash = this.hashDescription(cacheKey);

    // L1: in-memory cache
    const memCached = this.cache.get(cacheKey);
    if (memCached) {
      return { ...memCached, source: 'CACHED', confidence: 'high' };
    }

    // L2: database cache
    const dbCached = await this.getFromDb(descriptionHash, description);
    if (dbCached) {
      this.cache.set(cacheKey, dbCached);
      return { ...dbCached, source: 'CACHED', confidence: 'high' };
    }

    // Cache miss — call OpenAI
    try {
      const nutrition = await this.callOpenAI(description);
      this.validateNutritionData(nutrition);

      this.cache.set(cacheKey, nutrition);
      await this.saveToDb(descriptionHash, description, nutrition);

      return { ...nutrition, source: 'AI_GENERATED', confidence: 'medium' };
    } catch (error) {
      console.error('OpenAI API error:', error);
      throw new Error(`Failed to analyze nutrition for "${description}". Please try manual entry.`);
    }
  }

  private async getFromDb(descriptionHash: string, description: string): Promise<NutritionData | null> {
    try {
      const entry = await prisma.foodCache.findUnique({
        where: { userId_descriptionHash: { userId: null as unknown as string, descriptionHash } },
      });
      if (!entry) return null;

      // Update usage stats in background (don't await)
      prisma.foodCache.update({
        where: { id: entry.id },
        data: { lastUsed: new Date(), useCount: { increment: 1 } },
      }).catch(() => {});

      const data = entry.nutritionData as unknown as NutritionData;
      if (typeof data.calories !== 'number') return null;
      return data;
    } catch {
      return null;
    }
  }

  private async saveToDb(descriptionHash: string, originalDesc: string, nutrition: NutritionData): Promise<void> {
    try {
      await prisma.foodCache.upsert({
        where: { userId_descriptionHash: { userId: null as unknown as string, descriptionHash } },
        create: {
          userId: null,
          descriptionHash,
          originalDesc,
          nutritionData: nutrition as object,
          aiModel: OPENAI_MODEL,
        },
        update: {
          nutritionData: nutrition as object,
          lastUsed: new Date(),
          useCount: { increment: 1 },
        },
      });
    } catch (error) {
      // Non-fatal: in-memory cache already has the result
      console.error('Failed to persist nutrition cache to DB:', error);
    }
  }

  private hashDescription(normalizedDescription: string): string {
    return createHash('sha256').update(normalizedDescription).digest('hex');
  }

  private async callOpenAI(description: string): Promise<NutritionData> {
    const prompt = this.buildPrompt(description);

    const response = await openai.chat.completions.create({
      model: OPENAI_MODEL,
      messages: [
        {
          role: 'system',
          content: 'You are a nutrition analysis assistant. Provide accurate nutritional estimates in JSON format only.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: OPENAI_TEMPERATURE,
      max_tokens: OPENAI_MAX_TOKENS,
      response_format: { type: 'json_object' },
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No response from OpenAI API');
    }

    try {
      const parsed = JSON.parse(content);

      const calories = parsed.calories ?? parsed.Calories;
      const fat = parsed.fat ?? parsed.Fat;
      const carbs = parsed.carbs ?? parsed.carbohydrates ?? parsed.Carbs ?? parsed.Carbohydrates;
      const protein = parsed.protein ?? parsed.Protein;

      if (calories === undefined || fat === undefined || carbs === undefined || protein === undefined) {
        console.error('OpenAI response missing fields:', { rawResponse: content, parsed, extracted: { calories, fat, carbs, protein } });
      }

      return {
        calories: Number(calories) || 0,
        fat: Number(fat) || 0,
        carbs: Number(carbs) || 0,
        protein: Number(protein) || 0,
      };
    } catch {
      console.error('Failed to parse OpenAI response:', content);
      throw new Error('Invalid response format from OpenAI API');
    }
  }

  private buildPrompt(description: string): string {
    return `Analyze the nutritional content of this food item: "${description}"

The description may include quantity (e.g., "2 slices pizza", "1 cup rice", "3 oz chicken").
If no quantity is specified, assume a typical serving size.

Provide nutrition estimates in this exact JSON format:
{
  "calories": <number>,
  "fat": <number in grams>,
  "carbs": <number in grams>,
  "protein": <number in grams>
}

Return ONLY valid JSON with these four numeric fields. Do not include explanations.`;
  }

  private normalizeDescription(description: string): string {
    return description.toLowerCase().trim().replace(/\s+/g, ' ');
  }

  private validateNutritionData(data: NutritionData): void {
    if (!Number.isFinite(data.calories)) throw new Error('Invalid calories value: must be a number');
    if (!Number.isFinite(data.fat)) throw new Error('Invalid fat value: must be a number');
    if (!Number.isFinite(data.carbs)) throw new Error('Invalid carbs value: must be a number');
    if (!Number.isFinite(data.protein)) throw new Error('Invalid protein value: must be a number');
    if (data.calories < 0 || data.calories > 10000) throw new Error('Invalid calories value: must be between 0 and 10000');
    if (data.fat < 0 || data.fat > 1000) throw new Error('Invalid fat value: must be between 0 and 1000');
    if (data.carbs < 0 || data.carbs > 1000) throw new Error('Invalid carbs value: must be between 0 and 1000');
    if (data.protein < 0 || data.protein > 1000) throw new Error('Invalid protein value: must be between 0 and 1000');
  }

  clearCache(): void {
    this.cache.clear();
  }

  getCacheStats() {
    return this.cache.getStats();
  }
}

export const nutritionAnalysisService = new NutritionAnalysisService();
