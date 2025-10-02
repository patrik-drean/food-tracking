import { prisma } from '../lib/prisma';

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
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return prisma.food.findMany({
      where: {
        createdAt: {
          gte: today,
          lt: tomorrow,
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
    const targetDate = new Date(date);
    targetDate.setHours(0, 0, 0, 0);
    const nextDate = new Date(targetDate);
    nextDate.setDate(nextDate.getDate() + 1);

    return prisma.food.findMany({
      where: {
        createdAt: {
          gte: targetDate,
          lt: nextDate,
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });
  },
};