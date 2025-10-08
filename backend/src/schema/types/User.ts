import { builder } from '../builder';
import { userService } from '../../services/userService';

interface User {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
  createdAt: Date;
}

// User GraphQL type
export const UserType = builder.objectRef<User>('User').implement({
  fields: (t) => ({
    id: t.exposeID('id'),
    email: t.exposeString('email'),
    name: t.exposeString('name', { nullable: true }),
    image: t.exposeString('image', { nullable: true }),
    createdAt: t.string({
      resolve: (user) => user.createdAt.toISOString(),
    }),
  }),
});

// Input type for creating/updating user
const CreateOrUpdateUserInput = builder.inputType('CreateOrUpdateUserInput', {
  fields: (t) => ({
    email: t.string({ required: true }),
    name: t.string({ required: false }),
    image: t.string({ required: false }),
    provider: t.string({ required: true }),
    providerId: t.string({ required: true }),
  }),
});

// Query to get current user
builder.queryField('getCurrentUser', (t) =>
  t.field({
    type: UserType,
    nullable: true,
    resolve: async (_parent, _args, context) => {
      if (!context.userId) {
        return null;
      }

      return context.prisma.user.findUnique({
        where: { id: context.userId },
      });
    },
  })
);

// Mutation to create or update user (called by NextAuth)
builder.mutationField('createOrUpdateUser', (t) =>
  t.field({
    type: UserType,
    args: {
      input: t.arg({ type: CreateOrUpdateUserInput, required: true }),
    },
    resolve: async (_parent, args) => {
      const user = await userService.createOrUpdateUser({
        email: args.input.email,
        name: args.input.name ?? undefined,
        image: args.input.image ?? undefined,
        provider: args.input.provider,
        providerId: args.input.providerId,
      });

      return user;
    },
  })
);
