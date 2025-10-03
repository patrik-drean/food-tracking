import { builder } from './builder';

// Import all type definitions
import './types/Food';
import './types/NutritionAnalysis';
import './types/Query';
import './types/Mutation';

export const schema = builder.toSchema();
export { builder };