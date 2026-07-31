import { builder } from '../builder';
import { foodService } from '../../services/foodService';
import { requireAuth } from '../../lib/auth';
import { prisma } from '../../lib/prisma';

interface DailySummaryShape {
  date: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  unreliable: boolean;
}

export const DailySummaryType = builder.objectRef<DailySummaryShape>('DailySummary').implement({
  fields: (t) => ({
    date: t.exposeString('date'),
    calories: t.exposeFloat('calories'),
    protein: t.exposeFloat('protein'),
    carbs: t.exposeFloat('carbs'),
    fat: t.exposeFloat('fat'),
    unreliable: t.exposeBoolean('unreliable'),
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
      const summaries = await foodService.getWeeklySummary(context, {
        days: args.days,
        startDate: args.startDate,
        endDate: args.endDate,
      });

      const userId = requireAuth(context);
      const dates = summaries.map((s) => s.date);
      const unreliableRows = await prisma.unreliableDay.findMany({
        where: { userId, date: { in: dates } },
        select: { date: true },
      });
      const unreliableSet = new Set(unreliableRows.map((r) => r.date));

      return summaries.map((s) => ({
        ...s,
        unreliable: unreliableSet.has(s.date),
      }));
    },
  })
);
