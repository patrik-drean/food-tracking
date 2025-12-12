import { PrismaClient } from '@prisma/client';
import { startOfDay, endOfDay, eachDayOfInterval, format, subDays } from 'date-fns';
import * as fs from 'fs';

const prisma = new PrismaClient();

interface DailySummary {
  date: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

/**
 * Export daily nutrition summaries to CSV format
 *
 * Usage:
 *   npm run export:daily -- --email user@example.com --days 14
 *   npm run export:daily -- --email user@example.com --start 2025-12-01 --end 2025-12-12
 *   npm run export:daily -- --email user@example.com --days 30 --output report.csv
 *
 * Arguments:
 *   --email: User email address (required)
 *   --days: Number of days to export (default: 14)
 *   --start: Start date in YYYY-MM-DD format (optional, overrides --days)
 *   --end: End date in YYYY-MM-DD format (optional, defaults to today)
 *   --output: Output file path (optional, defaults to stdout)
 */
async function exportDailySummary() {
  const args = process.argv.slice(2);

  // Parse command line arguments
  const getArg = (flag: string): string | undefined => {
    const index = args.indexOf(flag);
    return index !== -1 && index + 1 < args.length ? args[index + 1] : undefined;
  };

  const email = getArg('--email');
  const daysStr = getArg('--days');
  const startDateStr = getArg('--start');
  const endDateStr = getArg('--end');
  const outputPath = getArg('--output');

  // Validate required arguments
  if (!email) {
    console.error('Error: --email is required');
    console.log('\nUsage:');
    console.log('  npm run export:daily -- --email user@example.com --days 14');
    console.log('  npm run export:daily -- --email user@example.com --start 2025-12-01 --end 2025-12-12');
    console.log('  npm run export:daily -- --email user@example.com --days 30 --output report.csv');
    process.exit(1);
  }

  // Find user by email
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    console.error(`Error: User with email "${email}" not found`);
    process.exit(1);
  }

  console.log(`📊 Generating daily nutrition summary for ${user.name || user.email}\n`);

  // Determine date range
  let startDate: Date;
  let endDate: Date;

  if (startDateStr) {
    startDate = new Date(startDateStr);
    if (isNaN(startDate.getTime())) {
      console.error(`Error: Invalid start date "${startDateStr}". Use YYYY-MM-DD format.`);
      process.exit(1);
    }
  } else {
    const days = daysStr ? parseInt(daysStr, 10) : 14;
    if (isNaN(days) || days <= 0) {
      console.error(`Error: Invalid days value "${daysStr}". Must be a positive number.`);
      process.exit(1);
    }
    startDate = subDays(new Date(), days - 1); // -1 to include today
  }

  if (endDateStr) {
    endDate = new Date(endDateStr);
    if (isNaN(endDate.getTime())) {
      console.error(`Error: Invalid end date "${endDateStr}". Use YYYY-MM-DD format.`);
      process.exit(1);
    }
  } else {
    endDate = new Date();
  }

  // Normalize to start/end of day
  startDate = startOfDay(startDate);
  endDate = endOfDay(endDate);

  console.log(`Date range: ${format(startDate, 'yyyy-MM-dd')} to ${format(endDate, 'yyyy-MM-dd')}`);
  console.log(`Total days: ${eachDayOfInterval({ start: startDate, end: endDate }).length}\n`);

  // Query all food entries in the date range
  const foods = await prisma.food.findMany({
    where: {
      userId: user.id,
      createdAt: {
        gte: startDate,
        lte: endDate,
      },
    },
    orderBy: {
      createdAt: 'asc',
    },
  });

  console.log(`Found ${foods.length} food entries\n`);

  // Group foods by day and calculate daily totals
  const dailySummaries: DailySummary[] = [];
  const allDays = eachDayOfInterval({ start: startDate, end: endDate });

  for (const day of allDays) {
    const dayStart = startOfDay(day);
    const dayEnd = endOfDay(day);

    // Filter foods for this specific day
    const dayFoods = foods.filter(
      (food) => food.createdAt >= dayStart && food.createdAt <= dayEnd
    );

    // Calculate totals for the day
    const totals = dayFoods.reduce(
      (acc, food) => ({
        calories: acc.calories + (food.calories || 0),
        protein: acc.protein + (food.protein || 0),
        carbs: acc.carbs + (food.carbs || 0),
        fat: acc.fat + (food.fat || 0),
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0 }
    );

    dailySummaries.push({
      date: format(day, 'yyyy-MM-dd'),
      calories: Math.round(totals.calories * 10) / 10, // Round to 1 decimal
      protein: Math.round(totals.protein * 10) / 10,
      carbs: Math.round(totals.carbs * 10) / 10,
      fat: Math.round(totals.fat * 10) / 10,
    });
  }

  // Generate CSV
  const csvHeader = 'Date,Calories,Protein,Carbs,Fat';
  const csvRows = dailySummaries.map(
    (day) => `${day.date},${day.calories},${day.protein},${day.carbs},${day.fat}`
  );
  const csv = [csvHeader, ...csvRows].join('\n');

  // Output CSV
  if (outputPath) {
    fs.writeFileSync(outputPath, csv, 'utf-8');
    console.log(`✅ CSV exported to: ${outputPath}`);
  } else {
    console.log('CSV Output:\n');
    console.log(csv);
  }

  // Print summary statistics
  console.log('\n📈 Summary Statistics:');
  const totalCalories = dailySummaries.reduce((sum, day) => sum + day.calories, 0);
  const totalProtein = dailySummaries.reduce((sum, day) => sum + day.protein, 0);
  const totalCarbs = dailySummaries.reduce((sum, day) => sum + day.carbs, 0);
  const totalFat = dailySummaries.reduce((sum, day) => sum + day.fat, 0);
  const daysWithData = dailySummaries.filter((day) => day.calories > 0).length;

  console.log(`   Days in range: ${dailySummaries.length}`);
  console.log(`   Days with data: ${daysWithData}`);
  console.log(`   Average daily calories: ${Math.round(totalCalories / dailySummaries.length)}`);
  console.log(`   Average daily protein: ${Math.round(totalProtein / dailySummaries.length)}g`);
  console.log(`   Average daily carbs: ${Math.round(totalCarbs / dailySummaries.length)}g`);
  console.log(`   Average daily fat: ${Math.round(totalFat / dailySummaries.length)}g`);

  await prisma.$disconnect();
}

// Run export
exportDailySummary()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Export failed:', error);
    process.exit(1);
  });
