import { builder } from '../builder';
import { foodService } from '../../services/foodService';
import { FoodType } from './Food';

builder.queryType({
  fields: (t) => ({
    todaysFoods: t.field({
      type: [FoodType],
      resolve: async (_parent, _args, context) => {
        return foodService.getTodaysFoods(context);
      },
    }),
    recentFoods: t.field({
      type: [FoodType],
      args: {
        limit: t.arg.int({ required: false, defaultValue: 10 }),
        search: t.arg.string({ required: false }),
      },
      resolve: async (_parent, args, context) => {
        return foodService.getRecentFoods(context, args.limit || 10, args.search);
      },
    }),
    foodsByDate: t.field({
      type: [FoodType],
      args: {
        date: t.arg.string({ required: true }),
      },
      resolve: async (_parent, args, context) => {
        return foodService.getFoodsByDate(context, args.date);
      },
    }),
  }),
});