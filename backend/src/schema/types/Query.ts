import { builder } from '../builder';
import { foodService } from '../../services/foodService';
import { FoodType } from './Food';

builder.queryType({
  fields: (t) => ({
    todaysFoods: t.field({
      type: [FoodType],
      resolve: async () => {
        return foodService.getTodaysFoods();
      },
    }),
    recentFoods: t.field({
      type: [FoodType],
      args: {
        limit: t.arg.int({ required: false, defaultValue: 10 }),
        search: t.arg.string({ required: false }),
      },
      resolve: async (_parent, args) => {
        return foodService.getRecentFoods(args.limit || 10, args.search);
      },
    }),
    foodsByDate: t.field({
      type: [FoodType],
      args: {
        date: t.arg.string({ required: true }),
      },
      resolve: async (_parent, args) => {
        return foodService.getFoodsByDate(args.date);
      },
    }),
  }),
});