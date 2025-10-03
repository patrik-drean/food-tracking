import { prisma } from '../lib/prisma';
import { getTodayRangeMT, getStartOfDayMT, getEndOfDayMT } from '../lib/timezone';

interface NutritionInput {
  calories?: number | null;
  fat?: number | null;
  carbs?: number | null;
  protein?: number | null;
}

interface AddFoodInput {
  description: string;
  nutrition?: NutritionInput | null;
}

interface UpdateFoodNutritionInput {
  id: string | number;
  nutrition: NutritionInput;
}

export const foodService = {
  async getTodaysFoods() {
    const { start, end } = getTodayRangeMT();

    return prisma.food.findMany({
      where: {
        createdAt: {
          gte: start,
          lt: end,
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });
  },

  async getRecentFoods(limit: number = 10) {
    return prisma.food.findMany({
      take: limit,
      orderBy: {
        createdAt: 'desc',
      },
      distinct: ['description'],
    });
  },

  async addFood(input: AddFoodInput) {
    const { description, nutrition } = input;

    return prisma.food.create({
      data: {
        description,
        calories: nutrition?.calories,
        fat: nutrition?.fat,
        carbs: nutrition?.carbs,
        protein: nutrition?.protein,
        isManual: !!nutrition, // True if nutrition provided manually
      },
    });
  },

  async updateFoodNutrition(input: UpdateFoodNutritionInput) {
    const { id, nutrition } = input;

    return prisma.food.update({
      where: { id: String(id) },
      data: {
        calories: nutrition.calories,
        fat: nutrition.fat,
        carbs: nutrition.carbs,
        protein: nutrition.protein,
        isManual: true,
      },
    });
  },

  async getFoodsByDate(date: string) {
    const start = getStartOfDayMT(date);
    const end = getEndOfDayMT(date);

    return prisma.food.findMany({
      where: {
        createdAt: {
          gte: start,
          lt: end,
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });
  },

  async deleteFood(id: string) {
    return prisma.food.delete({
      where: { id },
    });
  },
};