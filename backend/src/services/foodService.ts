import { prisma } from '../lib/prisma';
import { getTodayRangeMT, getStartOfDayMT, getEndOfDayMT } from '../lib/timezone';
import { requireAuth } from '../lib/auth';
import type { GraphQLContext } from '../schema/context';

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
  async getTodaysFoods(context: GraphQLContext) {
    const userId = requireAuth(context);
    const { start, end } = getTodayRangeMT();

    return prisma.food.findMany({
      where: {
        userId,
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

  async getRecentFoods(context: GraphQLContext, limit: number = 10, search?: string | null) {
    const userId = requireAuth(context);

    return prisma.food.findMany({
      where: {
        userId,
        ...(search
          ? {
              description: {
                contains: search,
                mode: 'insensitive',
              },
            }
          : {}),
      },
      take: limit,
      orderBy: {
        createdAt: 'desc',
      },
      distinct: ['description'],
    });
  },

  async addFood(context: GraphQLContext, input: AddFoodInput) {
    const userId = requireAuth(context);
    const { description, nutrition } = input;

    return prisma.food.create({
      data: {
        description,
        userId,
        calories: nutrition?.calories,
        fat: nutrition?.fat,
        carbs: nutrition?.carbs,
        protein: nutrition?.protein,
        isManual: !!nutrition, // True if nutrition provided manually
      },
    });
  },

  async updateFoodNutrition(context: GraphQLContext, input: UpdateFoodNutritionInput) {
    const userId = requireAuth(context);
    const { id, nutrition } = input;

    // Verify ownership
    const food = await prisma.food.findUnique({
      where: { id: String(id) },
      select: { userId: true },
    });

    if (!food || food.userId !== userId) {
      throw new Error('Food not found or access denied');
    }

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

  async getFoodsByDate(context: GraphQLContext, date: string) {
    const userId = requireAuth(context);
    const start = getStartOfDayMT(date);
    const end = getEndOfDayMT(date);

    return prisma.food.findMany({
      where: {
        userId,
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

  async deleteFood(context: GraphQLContext, id: string) {
    const userId = requireAuth(context);

    // Verify ownership
    const food = await prisma.food.findUnique({
      where: { id },
      select: { userId: true },
    });

    if (!food || food.userId !== userId) {
      throw new Error('Food not found or access denied');
    }

    return prisma.food.delete({
      where: { id },
    });
  },
};