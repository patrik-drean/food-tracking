import { z } from 'zod';

/**
 * Validation schema for food entry form
 * Uses Zod for TypeScript-first validation
 */
export const FoodEntrySchema = z.object({
  description: z.string()
    .min(1, 'Food description is required')
    .max(200, 'Description must be less than 200 characters')
    .trim(),
  nutrition: z.object({
    calories: z.number()
      .min(0, 'Calories must be positive')
      .max(10000, 'Calories seems too high')
      .optional()
      .or(z.literal(NaN).transform(() => undefined)),
    protein: z.number()
      .min(0, 'Protein must be positive')
      .max(1000, 'Protein content seems too high')
      .optional()
      .or(z.literal(NaN).transform(() => undefined)),
    carbohydrates: z.number()
      .min(0, 'Carbs must be positive')
      .max(1000, 'Carb content seems too high')
      .optional()
      .or(z.literal(NaN).transform(() => undefined)),
    fat: z.number()
      .min(0, 'Fat must be positive')
      .max(1000, 'Fat content seems too high')
      .optional()
      .or(z.literal(NaN).transform(() => undefined)),
  }).optional(),
});

export type FoodEntryFormData = z.infer<typeof FoodEntrySchema>;
