import { NutritionAnalysisService } from '../../../services/nutrition/NutritionAnalysisService';
import { openai } from '../../../lib/openai';

// Mock OpenAI client
jest.mock('../../../lib/openai', () => ({
  openai: {
    chat: {
      completions: {
        create: jest.fn(),
      },
    },
  },
  OPENAI_MODEL: 'gpt-4o-mini',
  OPENAI_MAX_TOKENS: 150,
  OPENAI_TEMPERATURE: 0.1,
}));

const mockOpenAI = openai.chat.completions.create as jest.MockedFunction<
  typeof openai.chat.completions.create
>;

describe('NutritionAnalysisService', () => {
  let service: NutritionAnalysisService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new NutritionAnalysisService();
  });

  describe('analyzeFoodNutrition', () => {
    it('should analyze food and return nutrition data', async () => {
      const mockResponse = {
        choices: [
          {
            message: {
              content: JSON.stringify({
                calories: 200,
                fat: 5,
                carbs: 30,
                protein: 8,
              }),
            },
          },
        ],
      };

      mockOpenAI.mockResolvedValue(mockResponse as any);

      const result = await service.analyzeFoodNutrition('2 slices whole wheat toast');

      expect(result.calories).toBe(200);
      expect(result.fat).toBe(5);
      expect(result.carbs).toBe(30);
      expect(result.protein).toBe(8);
      expect(result.source).toBe('AI_GENERATED');
      expect(result.confidence).toBe('medium');
    });

    it('should return cached results for identical descriptions', async () => {
      const mockResponse = {
        choices: [
          {
            message: {
              content: JSON.stringify({
                calories: 105,
                fat: 0.4,
                carbs: 27,
                protein: 1.3,
              }),
            },
          },
        ],
      };

      mockOpenAI.mockResolvedValue(mockResponse as any);

      const result1 = await service.analyzeFoodNutrition('banana');
      const result2 = await service.analyzeFoodNutrition('banana');

      expect(result1.source).toBe('AI_GENERATED');
      expect(result2.source).toBe('CACHED');
      expect(result2.confidence).toBe('high');
      expect(result2.calories).toBe(result1.calories);
      expect(mockOpenAI).toHaveBeenCalledTimes(1); // Only called once
    });

    it('should normalize descriptions for caching', async () => {
      const mockResponse = {
        choices: [
          {
            message: {
              content: JSON.stringify({
                calories: 95,
                fat: 0.3,
                carbs: 25,
                protein: 0.5,
              }),
            },
          },
        ],
      };

      mockOpenAI.mockResolvedValue(mockResponse as any);

      await service.analyzeFoodNutrition('Apple');
      const result2 = await service.analyzeFoodNutrition('  apple  ');

      expect(result2.source).toBe('CACHED'); // Should match normalized
      expect(mockOpenAI).toHaveBeenCalledTimes(1); // Only called once
    });

    it('should throw error for empty descriptions', async () => {
      await expect(service.analyzeFoodNutrition('')).rejects.toThrow(
        'Food description is required'
      );
    });

    it('should throw error for descriptions that are too long', async () => {
      const longDescription = 'a'.repeat(201);

      await expect(service.analyzeFoodNutrition(longDescription)).rejects.toThrow(
        'Food description must be 200 characters or less'
      );
    });

    it('should throw error for descriptions with HTML content', async () => {
      await expect(service.analyzeFoodNutrition('<script>alert("xss")</script>')).rejects.toThrow(
        'Food description contains invalid characters'
      );
    });

    it('should handle carbohydrates field name variation', async () => {
      const mockResponse = {
        choices: [
          {
            message: {
              content: JSON.stringify({
                calories: 200,
                fat: 5,
                carbohydrates: 30, // Using "carbohydrates" instead of "carbs"
                protein: 8,
              }),
            },
          },
        ],
      };

      mockOpenAI.mockResolvedValue(mockResponse as any);

      const result = await service.analyzeFoodNutrition('test food');

      expect(result.carbs).toBe(30);
    });

    it('should validate nutrition data ranges - invalid calories', async () => {
      const mockResponse = {
        choices: [
          {
            message: {
              content: JSON.stringify({
                calories: 99999, // Invalid
                fat: 10,
                carbs: 20,
                protein: 15,
              }),
            },
          },
        ],
      };

      mockOpenAI.mockResolvedValue(mockResponse as any);

      await expect(service.analyzeFoodNutrition('test food')).rejects.toThrow(
        'Failed to analyze nutrition'
      );
    });

    it('should validate nutrition data ranges - invalid fat', async () => {
      const mockResponse = {
        choices: [
          {
            message: {
              content: JSON.stringify({
                calories: 200,
                fat: 5000, // Invalid
                carbs: 20,
                protein: 15,
              }),
            },
          },
        ],
      };

      mockOpenAI.mockResolvedValue(mockResponse as any);

      await expect(service.analyzeFoodNutrition('test food')).rejects.toThrow(
        'Failed to analyze nutrition'
      );
    });

    it('should handle OpenAI API errors', async () => {
      mockOpenAI.mockRejectedValue(new Error('API Error'));

      await expect(service.analyzeFoodNutrition('test food')).rejects.toThrow(
        'Failed to analyze nutrition for "test food"'
      );
    });

    it('should handle empty OpenAI response', async () => {
      const mockResponse = {
        choices: [
          {
            message: {
              content: null,
            },
          },
        ],
      };

      mockOpenAI.mockResolvedValue(mockResponse as any);

      await expect(service.analyzeFoodNutrition('test food')).rejects.toThrow(
        'Failed to analyze nutrition'
      );
    });

    it('should handle invalid JSON response', async () => {
      const mockResponse = {
        choices: [
          {
            message: {
              content: 'not valid json',
            },
          },
        ],
      };

      mockOpenAI.mockResolvedValue(mockResponse as any);

      await expect(service.analyzeFoodNutrition('test food')).rejects.toThrow(
        'Failed to analyze nutrition'
      );
    });
  });

  describe('cache operations', () => {
    it('should clear cache', async () => {
      const mockResponse = {
        choices: [
          {
            message: {
              content: JSON.stringify({
                calories: 100,
                fat: 5,
                carbs: 20,
                protein: 8,
              }),
            },
          },
        ],
      };

      mockOpenAI.mockResolvedValue(mockResponse as any);

      await service.analyzeFoodNutrition('banana');
      const result1 = await service.analyzeFoodNutrition('banana');
      expect(result1.source).toBe('CACHED');

      service.clearCache();

      const result2 = await service.analyzeFoodNutrition('banana');
      expect(result2.source).toBe('AI_GENERATED');
      expect(mockOpenAI).toHaveBeenCalledTimes(2); // Called twice after cache clear
    });

    it('should return cache statistics', async () => {
      const mockResponse = {
        choices: [
          {
            message: {
              content: JSON.stringify({
                calories: 100,
                fat: 5,
                carbs: 20,
                protein: 8,
              }),
            },
          },
        ],
      };

      mockOpenAI.mockResolvedValue(mockResponse as any);

      await service.analyzeFoodNutrition('banana');
      await service.analyzeFoodNutrition('apple');

      const stats = service.getCacheStats();

      expect(stats.size).toBe(2);
      expect(stats.maxSize).toBe(1000);
      expect(typeof stats.hitRate).toBe('number');
    });
  });
});
