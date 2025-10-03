/**
 * Test script for OpenAI nutrition analysis
 * Run with: tsx src/scripts/test-openai.ts
 *
 * Make sure to set OPENAI_API_KEY in your .env file first
 */

import { config } from 'dotenv';
config();

import { nutritionAnalysisService } from '../services/nutrition/NutritionAnalysisService';

async function testNutritionAnalysis() {
  console.log('Testing OpenAI Nutrition Analysis Service\n');
  console.log('='.repeat(50));

  const testDescriptions = [
    '2 slices whole wheat toast',
    'banana',
    '1 cup cooked rice',
    '3 oz grilled chicken breast',
    'chicken caesar salad',
    'apple',  // This should hit cache if 'Apple' was tested
  ];

  for (const description of testDescriptions) {
    try {
      console.log(`\nAnalyzing: "${description}"`);
      const result = await nutritionAnalysisService.analyzeFoodNutrition(description);

      console.log(`  Calories: ${result.calories}`);
      console.log(`  Protein: ${result.protein}g`);
      console.log(`  Carbs: ${result.carbs}g`);
      console.log(`  Fat: ${result.fat}g`);
      console.log(`  Source: ${result.source}`);
      console.log(`  Confidence: ${result.confidence || 'N/A'}`);
    } catch (error) {
      console.error(`  Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  console.log('\n' + '='.repeat(50));
  console.log('\nCache Statistics:');
  const stats = nutritionAnalysisService.getCacheStats();
  console.log(`  Size: ${stats.size}/${stats.maxSize}`);
  console.log(`  Hit Rate: ${(stats.hitRate * 100).toFixed(2)}%`);
}

// Run the test
testNutritionAnalysis()
  .then(() => {
    console.log('\nTest completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\nTest failed:', error);
    process.exit(1);
  });
