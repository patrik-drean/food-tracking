import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Verify that all food data has been properly assigned to users
 *
 * Usage: npm run verify:migration
 *
 * This script checks:
 * 1. No food entries with null userId
 * 2. No cache entries with null userId
 * 3. All foods belong to existing users
 * 4. Data distribution per user
 */
async function verifyMigration() {
  console.log('🔍 Verifying Food Data Migration\n');

  try {
    // Check for null userId in Food table
    const nullFoods = await prisma.food.count({ where: { userId: null } });
    console.log(`Food entries with null userId: ${nullFoods}`);
    if (nullFoods > 0) {
      console.error('⚠️  Warning: Found food entries without user assignment');
    } else {
      console.log('✅ All food entries have user assignments');
    }

    // Check for null userId in FoodCache table
    const nullCache = await prisma.foodCache.count({ where: { userId: null } });
    console.log(`Cache entries with null userId: ${nullCache}`);
    if (nullCache > 0) {
      console.error('⚠️  Warning: Found cache entries without user assignment');
    } else {
      console.log('✅ All cache entries have user assignments');
    }

    // Get all users and their food counts
    console.log('\n👥 User Data Distribution:\n');
    const users = await prisma.user.findMany({
      include: {
        _count: {
          select: { foods: true },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    if (users.length === 0) {
      console.error('⚠️  No users found in database');
    } else {
      users.forEach((user) => {
        console.log(`📧 ${user.email}`);
        console.log(`   User ID: ${user.id}`);
        console.log(`   Name: ${user.name || 'N/A'}`);
        console.log(`   Food entries: ${user._count.foods}`);
        console.log(`   Created: ${user.createdAt.toISOString()}\n`);
      });
    }

    // Check for orphaned foods (userId doesn't exist in users table)
    const allFoodUserIds = await prisma.food.findMany({
      select: { userId: true },
      distinct: ['userId'],
      where: { userId: { not: null } },
    });

    const userIds = users.map((u) => u.id);
    const orphanedUserIds = allFoodUserIds
      .map((f) => f.userId)
      .filter((id) => id && !userIds.includes(id));

    if (orphanedUserIds.length > 0) {
      console.error('⚠️  Warning: Found food entries referencing non-existent users:');
      orphanedUserIds.forEach((id) => console.error(`   - ${id}`));
    } else if (allFoodUserIds.length > 0) {
      console.log('✅ All food entries reference valid users');
    }

    // Summary
    console.log('\n📊 Migration Verification Summary:');
    console.log(`   Total users: ${users.length}`);
    console.log(`   Total food entries: ${await prisma.food.count()}`);
    console.log(`   Total cache entries: ${await prisma.foodCache.count()}`);
    console.log(`   Food entries without user: ${nullFoods}`);
    console.log(`   Cache entries without user: ${nullCache}`);
    console.log(`   Orphaned food entries: ${orphanedUserIds.length}`);

    if (nullFoods === 0 && nullCache === 0 && orphanedUserIds.length === 0) {
      console.log('\n✅ Migration verification passed! All data is properly assigned.\n');
      process.exit(0);
    } else {
      console.log('\n⚠️  Migration verification found issues. Please review and fix.\n');
      process.exit(1);
    }
  } catch (error) {
    console.error('\n❌ Verification failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run verification
verifyMigration()
  .then(() => {
    // Exit code set in function
  })
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
