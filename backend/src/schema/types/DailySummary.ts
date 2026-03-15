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
    resolve: async (_parent, _args, context) => {
      return foodService.getWeeklySummary(context);
    },
  })
);
