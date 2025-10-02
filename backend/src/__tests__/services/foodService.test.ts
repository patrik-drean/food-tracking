import { foodService } from '../../services/foodService';
import { prisma } from '../../lib/prisma';

// Mock Prisma client
jest.mock('../../lib/prisma', () => ({
  prisma: {
    food: {
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
  },
}));

const mockPrisma = prisma as jest.Mocked<typeof prisma>;

describe('FoodService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getTodaysFoods', () => {
    it('should return foods created today', async () => {
      const mockFoods = [
        {
          id: '1',
          description: 'Apple',
          calories: 95,
          fat: 0.3,
          carbs: 25,
          protein: 0.5,
          isManual: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockPrisma.food.findMany.mockResolvedValue(mockFoods);

      const result = await foodService.getTodaysFoods();

      expect(result).toEqual(mockFoods);
      expect(mockPrisma.food.findMany).toHaveBeenCalledWith({
        where: {
          createdAt: {
            gte: expect.any(Date),
            lt: expect.any(Date),
          },
        },
        orderBy: {
          createdAt: 'asc',
        },
      });
    });
  });

  describe('getRecentFoods', () => {
    it('should return recent foods with default limit', async () => {
      const mockFoods = [
        {
          id: '1',
          description: 'Apple',
          calories: 95,
          fat: 0.3,
          carbs: 25,
          protein: 0.5,
          isManual: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockPrisma.food.findMany.mockResolvedValue(mockFoods);

      const result = await foodService.getRecentFoods();

      expect(result).toEqual(mockFoods);
      expect(mockPrisma.food.findMany).toHaveBeenCalledWith({
        take: 10,
        orderBy: {
          createdAt: 'desc',
        },
        distinct: ['description'],
      });
    });

    it('should return recent foods with custom limit', async () => {
      const mockFoods = [
        {
          id: '1',
          description: 'Apple',
          calories: 95,
          fat: 0.3,
          carbs: 25,
          protein: 0.5,
          isManual: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockPrisma.food.findMany.mockResolvedValue(mockFoods);

      const result = await foodService.getRecentFoods(5);

      expect(result).toEqual(mockFoods);
      expect(mockPrisma.food.findMany).toHaveBeenCalledWith({
        take: 5,
        orderBy: {
          createdAt: 'desc',
        },
        distinct: ['description'],
      });
    });
  });

  describe('addFood', () => {
    it('should create food entry with nutrition data', async () => {
      const input = {
        description: 'Apple',
        nutrition: {
          calories: 95,
          fat: 0.3,
          carbs: 25,
          protein: 0.5,
        },
      };

      const mockFood = {
        id: '1',
        description: 'Apple',
        calories: 95,
        fat: 0.3,
        carbs: 25,
        protein: 0.5,
        isManual: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrisma.food.create.mockResolvedValue(mockFood);

      const result = await foodService.addFood(input);

      expect(result).toEqual(mockFood);
      expect(mockPrisma.food.create).toHaveBeenCalledWith({
        data: {
          description: 'Apple',
          calories: 95,
          fat: 0.3,
          carbs: 25,
          protein: 0.5,
          isManual: true,
        },
      });
    });

    it('should create food entry without nutrition data', async () => {
      const input = {
        description: 'Apple',
        nutrition: null,
      };

      const mockFood = {
        id: '1',
        description: 'Apple',
        calories: null,
        fat: null,
        carbs: null,
        protein: null,
        isManual: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrisma.food.create.mockResolvedValue(mockFood);

      const result = await foodService.addFood(input);

      expect(result).toEqual(mockFood);
      expect(mockPrisma.food.create).toHaveBeenCalledWith({
        data: {
          description: 'Apple',
          calories: undefined,
          fat: undefined,
          carbs: undefined,
          protein: undefined,
          isManual: false,
        },
      });
    });
  });

  describe('updateFoodNutrition', () => {
    it('should update food nutrition data', async () => {
      const input = {
        id: '1',
        nutrition: {
          calories: 100,
          fat: 0.5,
          carbs: 30,
          protein: 1.0,
        },
      };

      const mockFood = {
        id: '1',
        description: 'Apple',
        calories: 100,
        fat: 0.5,
        carbs: 30,
        protein: 1.0,
        isManual: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrisma.food.update.mockResolvedValue(mockFood);

      const result = await foodService.updateFoodNutrition(input);

      expect(result).toEqual(mockFood);
      expect(mockPrisma.food.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: {
          calories: 100,
          fat: 0.5,
          carbs: 30,
          protein: 1.0,
          isManual: true,
        },
      });
    });
  });

  describe('getFoodsByDate', () => {
    it('should return foods for specific date', async () => {
      const date = '2024-01-01';
      const mockFoods = [
        {
          id: '1',
          description: 'Apple',
          calories: 95,
          fat: 0.3,
          carbs: 25,
          protein: 0.5,
          isManual: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockPrisma.food.findMany.mockResolvedValue(mockFoods);

      const result = await foodService.getFoodsByDate(date);

      expect(result).toEqual(mockFoods);
      expect(mockPrisma.food.findMany).toHaveBeenCalledWith({
        where: {
          createdAt: {
            gte: expect.any(Date),
            lt: expect.any(Date),
          },
        },
        orderBy: {
          createdAt: 'asc',
        },
      });
    });
  });
});
