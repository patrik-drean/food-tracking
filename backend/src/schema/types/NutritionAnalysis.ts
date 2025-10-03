import { builder } from '../builder';

// Define the TypeScript interface for NutritionAnalysis
interface NutritionAnalysis {
  calories: number;
  fat: number;
  carbs: number;
  protein: number;
  source: 'AI_GENERATED' | 'CACHED' | 'USER_ENTERED' | 'USER_MODIFIED';
  confidence?: string;
}

// Enum for NutritionSource
export const NutritionSourceEnum = builder.enumType('NutritionSource', {
  values: ['AI_GENERATED', 'CACHED', 'USER_ENTERED', 'USER_MODIFIED'] as const,
});

// NutritionAnalysis type definition
const NutritionAnalysisRef = builder.objectRef<NutritionAnalysis>('NutritionAnalysis');

export const NutritionAnalysisType = builder.objectType(NutritionAnalysisRef, {
  fields: (t) => ({
    calories: t.exposeFloat('calories'),
    fat: t.exposeFloat('fat'),
    carbs: t.exposeFloat('carbs'),
    protein: t.exposeFloat('protein'),
    source: t.field({
      type: NutritionSourceEnum,
      resolve: (parent) => parent.source,
    }),
    confidence: t.exposeString('confidence', { nullable: true }),
  }),
});
