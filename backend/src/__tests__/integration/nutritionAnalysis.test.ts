import { schema } from '../../schema';
import { graphql, GraphQLSchema } from 'graphql';
import { nutritionAnalysisService } from '../../services/nutrition/NutritionAnalysisService';

// Mock the NutritionAnalysisService
jest.mock('../../services/nutrition/NutritionAnalysisService', () => ({
  nutritionAnalysisService: {
    analyzeFoodNutrition: jest.fn(),
  },
}));

const mockService = nutritionAnalysisService as jest.Mocked<typeof nutritionAnalysisService>;

describe('Nutrition Analysis GraphQL Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const executeGraphQL = async (query: string, variableValues?: Record<string, any>) => {
    return graphql({
      schema: schema as GraphQLSchema,
      source: query,
      variableValues,
    });
  };

  describe('analyzeFoodNutrition mutation', () => {
    it('should analyze food via GraphQL mutation', async () => {
      const mockResult = {
        calories: 180,
        fat: 12,
        carbs: 2,
        protein: 16,
        source: 'AI_GENERATED' as const,
        confidence: 'medium',
      };

      mockService.analyzeFoodNutrition.mockResolvedValue(mockResult);

      const query = `
        mutation {
          analyzeFoodNutrition(description: "2 eggs scrambled") {
            calories
            protein
            carbs
            fat
            source
            confidence
          }
        }
      `;

      const response = await executeGraphQL(query);

      expect(response.errors).toBeUndefined();
      expect(response.data?.analyzeFoodNutrition).toEqual({
        calories: 180,
        fat: 12,
        carbs: 2,
        protein: 16,
        source: 'AI_GENERATED',
        confidence: 'medium',
      });
      expect(mockService.analyzeFoodNutrition).toHaveBeenCalledWith('2 eggs scrambled');
    });

    it('should return cached results', async () => {
      const mockResult = {
        calories: 95,
        fat: 0.3,
        carbs: 25,
        protein: 0.5,
        source: 'CACHED' as const,
        confidence: 'high',
      };

      mockService.analyzeFoodNutrition.mockResolvedValue(mockResult);

      const query = `
        mutation {
          analyzeFoodNutrition(description: "apple") {
            calories
            protein
            carbs
            fat
            source
            confidence
          }
        }
      `;

      const response = await executeGraphQL(query);

      expect(response.errors).toBeUndefined();
      expect(response.data?.analyzeFoodNutrition.source).toBe('CACHED');
      expect(response.data?.analyzeFoodNutrition.confidence).toBe('high');
    });

    it('should handle validation errors gracefully', async () => {
      mockService.analyzeFoodNutrition.mockRejectedValue(
        new Error('Food description cannot be empty')
      );

      const query = `
        mutation {
          analyzeFoodNutrition(description: "") {
            calories
          }
        }
      `;

      const response = await executeGraphQL(query);

      expect(response.errors).toBeDefined();
      expect(response.errors?.[0]?.message).toContain('Food description cannot be empty');
    });

    it('should handle API errors gracefully', async () => {
      mockService.analyzeFoodNutrition.mockRejectedValue(
        new Error('Failed to analyze nutrition for "test food". Please try manual entry.')
      );

      const query = `
        mutation {
          analyzeFoodNutrition(description: "test food") {
            calories
          }
        }
      `;

      const response = await executeGraphQL(query);

      expect(response.errors).toBeDefined();
      expect(response.errors?.[0]?.message).toContain('Failed to analyze nutrition');
    });

    it('should handle complex food descriptions', async () => {
      const mockResult = {
        calories: 450,
        fat: 18,
        carbs: 45,
        protein: 28,
        source: 'AI_GENERATED' as const,
        confidence: 'medium',
      };

      mockService.analyzeFoodNutrition.mockResolvedValue(mockResult);

      const query = `
        mutation {
          analyzeFoodNutrition(description: "chicken caesar salad with croutons") {
            calories
            protein
            carbs
            fat
            source
            confidence
          }
        }
      `;

      const response = await executeGraphQL(query);

      expect(response.errors).toBeUndefined();
      expect(response.data?.analyzeFoodNutrition.calories).toBe(450);
      expect(mockService.analyzeFoodNutrition).toHaveBeenCalledWith(
        'chicken caesar salad with croutons'
      );
    });

    it('should handle quantity-based descriptions', async () => {
      const mockResult = {
        calories: 300,
        fat: 2,
        carbs: 60,
        protein: 6,
        source: 'AI_GENERATED' as const,
        confidence: 'medium',
      };

      mockService.analyzeFoodNutrition.mockResolvedValue(mockResult);

      const query = `
        mutation {
          analyzeFoodNutrition(description: "1 cup cooked rice") {
            calories
            protein
            carbs
            fat
            source
          }
        }
      `;

      const response = await executeGraphQL(query);

      expect(response.errors).toBeUndefined();
      expect(response.data?.analyzeFoodNutrition.calories).toBe(300);
      expect(mockService.analyzeFoodNutrition).toHaveBeenCalledWith('1 cup cooked rice');
    });
  });
});
