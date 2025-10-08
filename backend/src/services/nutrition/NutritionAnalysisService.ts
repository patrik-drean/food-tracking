import { openai, OPENAI_MODEL, OPENAI_MAX_TOKENS, OPENAI_TEMPERATURE } from '@/lib/openai';
import { NutritionCache } from './NutritionCache';
import { validateFoodDescription } from '@/utils/validation';

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

  /**
   * Analyze food description and return nutrition estimates
   * Uses caching to reduce API costs
   */
  async analyzeFoodNutrition(description: string): Promise<NutritionAnalysis> {
    // Validate input
    validateFoodDescription(description);

    // Normalize description for cache key
    const cacheKey = this.normalizeDescription(description);

    // Check cache first
    const cached = this.cache.get(cacheKey);
    if (cached) {
      return {
        ...cached,
        source: 'CACHED',
        confidence: 'high',
      };
    }

    // Call OpenAI API
    try {
      const nutrition = await this.callOpenAI(description);

      // Validate AI response
      this.validateNutritionData(nutrition);

      // Cache the result
      this.cache.set(cacheKey, nutrition);

      return {
        ...nutrition,
        source: 'AI_GENERATED',
        confidence: 'medium',
      };
    } catch (error) {
      console.error('OpenAI API error:', error);
      throw new Error(`Failed to analyze nutrition for "${description}". Please try manual entry.`);
    }
  }

  /**
   * Call OpenAI API with structured prompt
   */
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

    // Parse JSON response
    try {
      const parsed = JSON.parse(content);

      // Extract and validate each field exists
      const calories = parsed.calories ?? parsed.Calories;
      const fat = parsed.fat ?? parsed.Fat;
      const carbs = parsed.carbs ?? parsed.carbohydrates ?? parsed.Carbs ?? parsed.Carbohydrates;
      const protein = parsed.protein ?? parsed.Protein;

      // Log if any fields are missing for debugging
      if (calories === undefined || fat === undefined || carbs === undefined || protein === undefined) {
        console.error('OpenAI response missing fields:', {
          rawResponse: content,
          parsed,
          extracted: { calories, fat, carbs, protein }
        });
      }

      return {
        calories: Number(calories) || 0,
        fat: Number(fat) || 0,
        carbs: Number(carbs) || 0,
        protein: Number(protein) || 0,
      };
    } catch (parseError) {
      console.error('Failed to parse OpenAI response:', content);
      throw new Error('Invalid response format from OpenAI API');
    }
  }

  /**
   * Build structured prompt for OpenAI
   */
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

  /**
   * Normalize description for consistent caching
   */
  private normalizeDescription(description: string): string {
    return description.toLowerCase().trim().replace(/\s+/g, ' ');
  }

  /**
   * Validate nutrition data is within reasonable ranges
   */
  private validateNutritionData(data: NutritionData): void {
    // Check for NaN or non-finite values
    if (!Number.isFinite(data.calories)) {
      throw new Error('Invalid calories value: must be a number');
    }
    if (!Number.isFinite(data.fat)) {
      throw new Error('Invalid fat value: must be a number');
    }
    if (!Number.isFinite(data.carbs)) {
      throw new Error('Invalid carbs value: must be a number');
    }
    if (!Number.isFinite(data.protein)) {
      throw new Error('Invalid protein value: must be a number');
    }

    // Check reasonable ranges
    if (data.calories < 0 || data.calories > 10000) {
      throw new Error('Invalid calories value: must be between 0 and 10000');
    }
    if (data.fat < 0 || data.fat > 1000) {
      throw new Error('Invalid fat value: must be between 0 and 1000');
    }
    if (data.carbs < 0 || data.carbs > 1000) {
      throw new Error('Invalid carbs value: must be between 0 and 1000');
    }
    if (data.protein < 0 || data.protein > 1000) {
      throw new Error('Invalid protein value: must be between 0 and 1000');
    }
  }

  /**
   * Clear cache (useful for testing)
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Get cache statistics
   */
  getCacheStats() {
    return this.cache.getStats();
  }
}

// Export singleton instance
export const nutritionAnalysisService = new NutritionAnalysisService();
