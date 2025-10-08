import { builder } from '../builder';
import { foodService } from '../../services/foodService';
import { AddFoodInput, UpdateFoodNutritionInput, FoodType } from './Food';
import { NutritionAnalysisType } from './NutritionAnalysis';
import { nutritionAnalysisService } from '../../services/nutrition/NutritionAnalysisService';

builder.mutationType({
  fields: (t) => ({
    addFood: t.field({
      type: FoodType,
      args: {
        input: t.arg({ type: AddFoodInput, required: true }),
      },
      resolve: async (_parent, args, context) => {
        return foodService.addFood(context, args.input);
      },
    }),
    updateFoodNutrition: t.field({
      type: FoodType,
      args: {
        input: t.arg({ type: UpdateFoodNutritionInput, required: true }),
      },
      resolve: async (_parent, args, context) => {
        return foodService.updateFoodNutrition(context, args.input);
      },
    }),
    deleteFood: t.field({
      type: FoodType,
      args: {
        id: t.arg.string({ required: true }),
      },
      resolve: async (_parent, args, context) => {
        return foodService.deleteFood(context, args.id);
      },
    }),
    analyzeFoodNutrition: t.field({
      type: NutritionAnalysisType,
      args: {
        description: t.arg.string({ required: true }),
      },
      resolve: async (_parent, args) => {
        try {
          const result = await nutritionAnalysisService.analyzeFoodNutrition(args.description);
          return result;
        } catch (error) {
          throw new Error(
            error instanceof Error
              ? error.message
              : 'Failed to analyze food nutrition'
          );
        }
      },
    }),
  }),
});