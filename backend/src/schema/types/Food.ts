import { builder } from '../builder';
import { Food } from '@prisma/client';

const FoodType = builder.objectRef<Food>('Food');

builder.objectType(FoodType, {
  fields: (t) => ({
    id: t.exposeID('id'),
    description: t.exposeString('description'),
    calories: t.exposeFloat('calories', { nullable: true }),
    fat: t.exposeFloat('fat', { nullable: true }),
    carbs: t.exposeFloat('carbs', { nullable: true }),
    protein: t.exposeFloat('protein', { nullable: true }),
    isManual: t.exposeBoolean('isManual'),
    createdAt: t.field({
      type: 'String',
      resolve: (food) => food.createdAt.toISOString(),
    }),
    updatedAt: t.field({
      type: 'String',
      resolve: (food) => food.updatedAt.toISOString(),
    }),
  }),
});

// Input types for mutations
const NutritionInput = builder.inputType('NutritionInput', {
  fields: (t) => ({
    calories: t.float({ required: false }),
    fat: t.float({ required: false }),
    carbs: t.float({ required: false }),
    protein: t.float({ required: false }),
  }),
});

const AddFoodInput = builder.inputType('AddFoodInput', {
  fields: (t) => ({
    description: t.string({ required: true }),
    nutrition: t.field({ type: NutritionInput, required: false }),
  }),
});

const UpdateFoodNutritionInput = builder.inputType('UpdateFoodNutritionInput', {
  fields: (t) => ({
    id: t.id({ required: true }),
    nutrition: t.field({ type: NutritionInput, required: true }),
  }),
});

// Export input types and object type for use in resolvers
export { AddFoodInput, UpdateFoodNutritionInput, NutritionInput };
export { FoodType };