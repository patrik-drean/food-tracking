import { builder } from '../builder';
import { requireAuth } from '../../lib/auth';
import { prisma } from '../../lib/prisma';

builder.queryField('unreliableDays', (t) =>
  t.field({
    type: ['String'],
    args: {
      dates: t.arg.stringList({ required: true }),
    },
    resolve: async (_parent, args, context) => {
      const userId = requireAuth(context);
      const rows = await prisma.unreliableDay.findMany({
        where: { userId, date: { in: args.dates } },
        select: { date: true },
      });
      return rows.map((r) => r.date);
    },
  })
);

builder.mutationField('toggleUnreliableDay', (t) =>
  t.field({
    type: 'Boolean',
    args: {
      date: t.arg.string({ required: true }),
      unreliable: t.arg.boolean({ required: true }),
    },
    resolve: async (_parent, args, context) => {
      const userId = requireAuth(context);
      if (!/^\d{4}-\d{2}-\d{2}$/.test(args.date)) {
        throw new Error('Date must be in YYYY-MM-DD format');
      }
      if (args.unreliable) {
        await prisma.unreliableDay.upsert({
          where: { userId_date: { userId, date: args.date } },
          create: { userId, date: args.date },
          update: {},
        });
        return true;
      } else {
        await prisma.unreliableDay.deleteMany({
          where: { userId, date: args.date },
        });
        return false;
      }
    },
  })
);
