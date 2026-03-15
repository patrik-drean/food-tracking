import { foodService } from '../../services/foodService';
import { prisma } from '../../lib/prisma';

// Mock Prisma client
jest.mock('../../lib/prisma', () => ({
  prisma: {
    food: {
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      findUnique: jest.fn(),
      delete: jest.fn(),
    },
  },
}));

// Mock auth
jest.mock('../../lib/auth', () => ({
  requireAuth: jest.fn().mockReturnValue('test-user-id'),
}));

const mockPrisma = prisma as jest.Mocked<typeof prisma>;

const mockContext = { userId: 'test-user-id' } as any;

describe('FoodService - getWeeklySummary', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return 7 daily summaries', async () => {
    mockPrisma.food.findMany.mockResolvedValue([]);

    const result = await foodService.getWeeklySummary(mockContext);

    expect(result).toHaveLength(7);
  });

  it('should not include today in the results', async () => {
    mockPrisma.food.findMany.mockResolvedValue([]);

    const result = await foodService.getWeeklySummary(mockContext);

    // Get today's date in Mountain Time
    const todayMT = new Date().toLocaleString('en-US', {
      timeZone: 'America/Denver',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
    const [month, day, year] = todayMT.split('/');
    const todayStr = `${year}-${month}-${day}`;

    const dates = result.map((s) => s.date);
    expect(dates).not.toContain(todayStr);
  });

  it('should start from yesterday', async () => {
    mockPrisma.food.findMany.mockResolvedValue([]);

    const result = await foodService.getWeeklySummary(mockContext);

    // Get yesterday's date in Mountain Time
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayMT = yesterday.toLocaleString('en-US', {
      timeZone: 'America/Denver',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
    const [month, day, year] = yesterdayMT.split('/');
    const yesterdayStr = `${year}-${month}-${day}`;

    expect(result[0].date).toBe(yesterdayStr);
  });

  it('should return zeros for days with no food entries', async () => {
    mockPrisma.food.findMany.mockResolvedValue([]);

    const result = await foodService.getWeeklySummary(mockContext);

    for (const day of result) {
      expect(day.calories).toBe(0);
      expect(day.protein).toBe(0);
      expect(day.carbs).toBe(0);
      expect(day.fat).toBe(0);
    }
  });

  it('should sum nutrition values for foods on the same day', async () => {
    // Create foods that fall on yesterday in Mountain Time
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    // Set to noon MT to ensure it falls within yesterday
    const yesterdayMT = yesterday.toLocaleString('en-US', {
      timeZone: 'America/Denver',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
    const [month, day, year] = yesterdayMT.split('/');
    const noonMT = new Date(`${year}-${month}-${day}T12:00:00-07:00`);

    const mockFoods = [
      {
        id: '1',
        description: 'Apple',
        userId: 'test-user-id',
        calories: 95,
        fat: 0.3,
        carbs: 25,
        protein: 0.5,
        isManual: false,
        aiModel: null,
        createdAt: noonMT,
        updatedAt: noonMT,
      },
      {
        id: '2',
        description: 'Banana',
        userId: 'test-user-id',
        calories: 105,
        fat: 0.4,
        carbs: 27,
        protein: 1.3,
        isManual: false,
        aiModel: null,
        createdAt: new Date(noonMT.getTime() + 3600000), // 1 hour later
        updatedAt: new Date(noonMT.getTime() + 3600000),
      },
    ];

    mockPrisma.food.findMany.mockResolvedValue(mockFoods);

    const result = await foodService.getWeeklySummary(mockContext);

    // Find yesterday's summary
    const yesterdayStr = `${year}-${month}-${day}`;
    const yesterdaySummary = result.find((s) => s.date === yesterdayStr);

    expect(yesterdaySummary).toBeDefined();
    expect(yesterdaySummary!.calories).toBe(200);
    expect(yesterdaySummary!.protein).toBe(1.8);
    expect(yesterdaySummary!.carbs).toBe(52);
    expect(yesterdaySummary!.fat).toBe(0.7);
  });

  it('should handle null nutrition values', async () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayMT = yesterday.toLocaleString('en-US', {
      timeZone: 'America/Denver',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
    const [month, day, year] = yesterdayMT.split('/');
    const noonMT = new Date(`${year}-${month}-${day}T12:00:00-07:00`);

    const mockFoods = [
      {
        id: '1',
        description: 'Unknown food',
        userId: 'test-user-id',
        calories: null,
        fat: null,
        carbs: null,
        protein: null,
        isManual: false,
        aiModel: null,
        createdAt: noonMT,
        updatedAt: noonMT,
      },
    ];

    mockPrisma.food.findMany.mockResolvedValue(mockFoods);

    const result = await foodService.getWeeklySummary(mockContext);
    const yesterdayStr = `${year}-${month}-${day}`;
    const yesterdaySummary = result.find((s) => s.date === yesterdayStr);

    expect(yesterdaySummary!.calories).toBe(0);
    expect(yesterdaySummary!.protein).toBe(0);
    expect(yesterdaySummary!.carbs).toBe(0);
    expect(yesterdaySummary!.fat).toBe(0);
  });

  it('should query with correct date range', async () => {
    mockPrisma.food.findMany.mockResolvedValue([]);

    await foodService.getWeeklySummary(mockContext);

    expect(mockPrisma.food.findMany).toHaveBeenCalledWith({
      where: {
        userId: 'test-user-id',
        createdAt: {
          gte: expect.any(Date),
          lt: expect.any(Date),
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    // Verify the range spans 7 days
    const call = mockPrisma.food.findMany.mock.calls[0][0] as any;
    const rangeStart = call.where.createdAt.gte as Date;
    const rangeEnd = call.where.createdAt.lt as Date;
    const diffDays = (rangeEnd.getTime() - rangeStart.getTime()) / (1000 * 60 * 60 * 24);
    expect(diffDays).toBeCloseTo(7, 0);
  });

  it('should return dates in reverse chronological order', async () => {
    mockPrisma.food.findMany.mockResolvedValue([]);

    const result = await foodService.getWeeklySummary(mockContext);

    for (let i = 0; i < result.length - 1; i++) {
      expect(result[i].date > result[i + 1].date).toBe(true);
    }
  });
});
