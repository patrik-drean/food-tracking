import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface MigrationStats {
  totalFoods: number;
  foodsToMigrate: number;
  foodsUpdated: number;
  totalFoodCache: number;
  cacheToMigrate: number;
  cacheUpdated: number;
}

/**
 * Migration script to assign existing food data to a user
 *
 * Usage: npm run migrate:user-data <userId>
 * Example: npm run migrate:user-data cmghzqbf50000qv7j0y86m5gx
 *
 * This script:
 * 1. Finds all food entries with null userId
 * 2. Assigns all null userId foods to the specified user
 * 3. Updates FoodCache entries to belong to that user
 * 4. Verifies migration success
 */
async function migrateDataToUser(userId: string) {
  console.log('🔄 Food Tracking Data Migration Script\n');
  console.log(`Migrating data to user ID: ${userId}\n`);

  try {
    // Step 1: Verify user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, name: true, createdAt: true },
    });

    if (!user) {
      console.error(`❌ User with ID "${userId}" not found in database!`);
      console.error('Please verify the user ID and try again.');
      process.exit(1);
    }

    console.log('✅ Target user found:');
    console.log(`   Email: ${user.email}`);
    console.log(`   Name: ${user.name || 'N/A'}`);
    console.log(`   Created: ${user.createdAt.toISOString()}\n`);

    // Step 2: Check current data state
    console.log('📊 Analyzing current data...\n');

    const stats: MigrationStats = {
      totalFoods: await prisma.food.count(),
      foodsToMigrate: await prisma.food.count({ where: { userId: null } }),
      foodsUpdated: 0,
      totalFoodCache: await prisma.foodCache.count(),
      cacheToMigrate: await prisma.foodCache.count({ where: { userId: null } }),
      cacheUpdated: 0,
    };

    console.log(`Total food entries: ${stats.totalFoods}`);
    console.log(`Food entries without user: ${stats.foodsToMigrate}`);
    console.log(`Total cache entries: ${stats.totalFoodCache}`);
    console.log(`Cache entries without user: ${stats.cacheToMigrate}\n`);

    if (stats.foodsToMigrate === 0 && stats.cacheToMigrate === 0) {
      console.log('✅ All data is already assigned to users. No migration needed.');
      return;
    }

    // Step 3: Perform migration
    console.log('🚀 Starting migration...\n');

    // Update Food entries
    if (stats.foodsToMigrate > 0) {
      console.log(`Updating ${stats.foodsToMigrate} food entries...`);
      const foodResult = await prisma.food.updateMany({
        where: { userId: null },
        data: { userId: user.id },
      });
      stats.foodsUpdated = foodResult.count;
      console.log(`✅ Updated ${stats.foodsUpdated} food entries`);
    }

    // Update FoodCache entries
    if (stats.cacheToMigrate > 0) {
      console.log(`\nUpdating ${stats.cacheToMigrate} cache entries...`);
      const cacheResult = await prisma.foodCache.updateMany({
        where: { userId: null },
        data: { userId: user.id },
      });
      stats.cacheUpdated = cacheResult.count;
      console.log(`✅ Updated ${stats.cacheUpdated} cache entries`);
    }

    // Step 4: Verify migration
    console.log('\n🔍 Verifying migration...\n');

    const remainingNullFoods = await prisma.food.count({ where: { userId: null } });
    const remainingNullCache = await prisma.foodCache.count({ where: { userId: null } });

    console.log(`Food entries still without user: ${remainingNullFoods}`);
    console.log(`Cache entries still without user: ${remainingNullCache}`);

    if (remainingNullFoods === 0 && remainingNullCache === 0) {
      console.log('\n✅ Migration completed successfully!\n');
      console.log('🎉 Your food tracking data is now associated with your user account.');
    } else {
      console.error('\n⚠️  Warning: Some entries still have null userId.');
      console.error('Please review the data and re-run the script if needed.');
    }

    // Step 5: Print summary
    console.log('\n📊 Migration Summary:');
    console.log(`   User: ${user.email} (${user.id})`);
    console.log(`   Food entries updated: ${stats.foodsUpdated}`);
    console.log(`   Cache entries updated: ${stats.cacheUpdated}`);
    console.log(`   Total records updated: ${stats.foodsUpdated + stats.cacheUpdated}\n`);

  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Parse command line arguments
const userId = process.argv[2];

if (!userId) {
  console.error('❌ Error: User ID is required');
  console.error('\nUsage: npm run migrate:user-data <userId>');
  console.error('Example: npm run migrate:user-data cmghzqbf50000qv7j0y86m5gx\n');
  process.exit(1);
}

// Run migration
migrateDataToUser(userId)
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
