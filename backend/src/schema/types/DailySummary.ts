import { builder } from '../builder';
import { foodService } from '../../services/foodService';

interface DailySummaryShape {
  date: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export const DailySummaryType = builder.objectRef<DailySummaryShape>('DailySummary').implement({
  fields: (t) => ({
    date: t.exposeString('date'),
    calories: t.exposeFloat('calories'),
    protein: t.exposeFloat('protein'),
    carbs: t.exposeFloat('carbs'),
    fat: t.exposeFloat('fat'),
  }),
});

builder.queryField('weeklySummary', (t) =>
  t.field({
    type: [DailySummaryType],
    args: {
      days: t.arg.int({ required: false }),
      startDate: t.arg.string({ required: false }),
      endDate: t.arg.string({ required: false }),
    },
    resolve: async (_parent, args, context) => {
      return foodService.getWeeklySummary(context, {
        days: args.days,
        startDate: args.startDate,
        endDate: args.endDate,
      });
    },
  })
);
