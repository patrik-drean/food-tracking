import { prisma } from '../lib/prisma';
import { getTodayRangeMT, getStartOfDayMT, getEndOfDayMT, TIMEZONE } from '../lib/timezone';
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

  async getWeeklySummary(context: GraphQLContext) {
    const userId = requireAuth(context);

    // Build 7 date strings: yesterday back 7 days, in Mountain Time
    const now = new Date();
    const dates: string[] = [];
    for (let i = 1; i <= 7; i++) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const mtDateString = d.toLocaleString('en-US', {
        timeZone: TIMEZONE,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      });
      const [month, day, year] = mtDateString.split('/');
      dates.push(`${year}-${month}-${day}`);
    }

    // Single query for the full 7-day range
    // Append T12:00:00 so the date parses as noon UTC, not midnight UTC.
    // Midnight UTC falls on the previous day in Mountain Time, shifting the range.
    const rangeStart = getStartOfDayMT(`${dates[dates.length - 1]}T12:00:00`); // oldest
    const rangeEnd = getEndOfDayMT(`${dates[0]}T12:00:00`); // most recent (yesterday)

    const foods = await prisma.food.findMany({
      where: {
        userId,
        createdAt: {
          gte: rangeStart,
          lt: rangeEnd,
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    // Pre-populate all 7 days with zeros
    const summaryMap = new Map<string, { calories: number; protein: number; carbs: number; fat: number }>();
    for (const dateStr of dates) {
      summaryMap.set(dateStr, { calories: 0, protein: 0, carbs: 0, fat: 0 });
    }

    // Group foods by their Mountain Time day and sum
    for (const food of foods) {
      const foodDateMT = food.createdAt.toLocaleString('en-US', {
        timeZone: TIMEZONE,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      });
      const [m, d, y] = foodDateMT.split('/');
      const key = `${y}-${m}-${d}`;
      const bucket = summaryMap.get(key);
      if (bucket) {
        bucket.calories += food.calories || 0;
        bucket.protein += food.protein || 0;
        bucket.carbs += food.carbs || 0;
        bucket.fat += food.fat || 0;
      }
    }

    // Return most-recent-first
    return dates.map((dateStr) => {
      const totals = summaryMap.get(dateStr)!;
      return {
        date: dateStr,
        calories: Math.round(totals.calories * 10) / 10,
        protein: Math.round(totals.protein * 10) / 10,
        carbs: Math.round(totals.carbs * 10) / 10,
        fat: Math.round(totals.fat * 10) / 10,
      };
    });
  },

  async getFrequentFoods(context: GraphQLContext, limit: number = 10, days: number = 14) {
    const userId = requireAuth(context);

    // Calculate cutoff date
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    // Use PostgreSQL ARRAY_AGG to get frequency + most recent nutrition in single query
    const frequentFoods = await prisma.$queryRaw<Array<{
      id: string;
      userId: string | null;
      description: string;
      calories: number | null;
      protein: number | null;
      carbs: number | null;
      fat: number | null;
      isManual: boolean;
      aiModel: string | null;
      createdAt: Date;
      updatedAt: Date;
      frequency: number;
    }>>`
      SELECT
        f.description,
        COUNT(*)::int as frequency,
        (ARRAY_AGG(f.id ORDER BY f."createdAt" DESC))[1] as id,
        (ARRAY_AGG(f."userId" ORDER BY f."createdAt" DESC))[1] as "userId",
        (ARRAY_AGG(f.calories ORDER BY f."createdAt" DESC))[1] as calories,
        (ARRAY_AGG(f.protein ORDER BY f."createdAt" DESC))[1] as protein,
        (ARRAY_AGG(f.carbs ORDER BY f."createdAt" DESC))[1] as carbs,
        (ARRAY_AGG(f.fat ORDER BY f."createdAt" DESC))[1] as fat,
        (ARRAY_AGG(f."isManual" ORDER BY f."createdAt" DESC))[1] as "isManual",
        (ARRAY_AGG(f."aiModel" ORDER BY f."createdAt" DESC))[1] as "aiModel",
        MAX(f."createdAt") as "createdAt",
        MAX(f."updatedAt") as "updatedAt"
      FROM foods f
      WHERE f."userId" = ${userId}
        AND f."createdAt" >= ${cutoffDate}
      GROUP BY f.description
      ORDER BY frequency DESC, MAX(f."createdAt") DESC
      LIMIT ${limit}
    `;

    return frequentFoods;
  },
};