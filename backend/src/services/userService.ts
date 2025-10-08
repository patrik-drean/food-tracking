import { prisma } from '../lib/prisma';

interface CreateOrUpdateUserInput {
  email: string;
  name?: string | null;
  image?: string | null;
  provider: string;
  providerId: string;
}

export const userService = {
  /**
   * Create or update user from OAuth sign-in
   */
  async createOrUpdateUser(input: CreateOrUpdateUserInput) {
    const { email, name, image, provider, providerId } = input;

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: {
        provider_providerId: {
          provider,
          providerId,
        },
      },
    });

    if (existingUser) {
      // Update existing user
      return prisma.user.update({
        where: { id: existingUser.id },
        data: {
          email,
          name,
          image,
          lastLoginAt: new Date(),
        },
      });
    }

    // Create new user
    return prisma.user.create({
      data: {
        email,
        name,
        image,
        provider,
        providerId,
      },
    });
  },

  /**
   * Get user by ID
   */
  async getUserById(id: string) {
    return prisma.user.findUnique({
      where: { id },
    });
  },

  /**
   * Get user by email
   */
  async getUserByEmail(email: string) {
    return prisma.user.findUnique({
      where: { email },
    });
  },
};
