import { builder } from '../builder';
import { foodService } from '../../services/foodService';
import { AddFoodInput, UpdateFoodNutritionInput, FoodType } from './Food';

builder.mutationType({
  fields: (t) => ({
    addFood: t.field({
      type: FoodType,
      args: {
        input: t.arg({ type: AddFoodInput, required: true }),
      },
      resolve: async (_parent, args) => {
        return foodService.addFood(args.input);
      },
    }),
    updateFoodNutrition: t.field({
      type: FoodType,
      args: {
        input: t.arg({ type: UpdateFoodNutritionInput, required: true }),
      },
      resolve: async (_parent, args) => {
        return foodService.updateFoodNutrition(args.input);
      },
    }),
  }),
});