import { builder } from '../builder';
import { prisma } from '../../lib/prisma';
import { requireAuth } from '../../lib/auth';

// MacroTargets GraphQL type
export const MacroTargetsType = builder.objectRef<{
  id: string;
  userId: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  createdAt: Date;
  updatedAt: Date;
}>('MacroTargets').implement({
  fields: (t) => ({
    id: t.exposeID('id'),
    calories: t.exposeFloat('calories'),
    protein: t.exposeFloat('protein'),
    carbs: t.exposeFloat('carbs'),
    fat: t.exposeFloat('fat'),
    createdAt: t.string({
      resolve: (targets) => targets.createdAt.toISOString(),
    }),
    updatedAt: t.string({
      resolve: (targets) => targets.updatedAt.toISOString(),
    }),
  }),
});

// Input type for updating macro targets
const UpdateMacroTargetsInput = builder.inputType('UpdateMacroTargetsInput', {
  fields: (t) => ({
    calories: t.float({ required: true }),
    protein: t.float({ required: true }),
    carbs: t.float({ required: true }),
    fat: t.float({ required: true }),
  }),
});

// Query to get user's macro targets (with defaults if not set)
builder.queryField('getMacroTargets', (t) =>
  t.field({
    type: MacroTargetsType,
    nullable: false,
    resolve: async (_parent, _args, context) => {
      const userId = requireAuth(context);

      // Check if user has custom targets
      const targets = await prisma.macroTargets.findUnique({
        where: { userId },
      });

      // If no custom targets, return defaults
      if (!targets) {
        // Return default values without creating DB record
        return {
          id: 'default',
          userId,
          calories: 2600,
          protein: 170,
          carbs: 310,
          fat: 75,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
      }

      return targets;
    },
  })
);

// Mutation to update macro targets
builder.mutationField('updateMacroTargets', (t) =>
  t.field({
    type: MacroTargetsType,
    args: {
      input: t.arg({ type: UpdateMacroTargetsInput, required: true }),
    },
    resolve: async (_parent, args, context) => {
      const userId = requireAuth(context);

      // Validate input values are positive
      if (
        args.input.calories <= 0 ||
        args.input.protein <= 0 ||
        args.input.carbs <= 0 ||
        args.input.fat <= 0
      ) {
        throw new Error('All macro targets must be positive values');
      }

      // Upsert macro targets (create if not exists, update if exists)
      const targets = await prisma.macroTargets.upsert({
        where: { userId },
        create: {
          userId,
          calories: args.input.calories,
          protein: args.input.protein,
          carbs: args.input.carbs,
          fat: args.input.fat,
        },
        update: {
          calories: args.input.calories,
          protein: args.input.protein,
          carbs: args.input.carbs,
          fat: args.input.fat,
        },
      });

      return targets;
    },
  })
);
