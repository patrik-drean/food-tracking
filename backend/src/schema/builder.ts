import SchemaBuilder from '@pothos/core'

// Create a basic GraphQL schema builder for TASK-001 verification
export const builder = new SchemaBuilder({})

// Add basic Query and Mutation types
builder.queryType({
  description: 'Root query type for food tracking API',
  fields: (t) => ({
    hello: t.string({
      description: 'A simple hello world query',
      resolve: () => 'Hello from Food Tracking API! Database connected.',
    }),
    dbStatus: t.string({
      description: 'Database connection status',
      resolve: async () => {
        try {
          // Basic connection test
          const { prisma } = await import('../lib/prisma')
          await prisma.$queryRaw`SELECT 1`
          return 'Database connected successfully to Railway PostgreSQL'
        } catch (error) {
          return `Database connection error: ${error instanceof Error ? error.message : 'Unknown error'}`
        }
      },
    }),
  }),
})

builder.mutationType({
  description: 'Root mutation type for food tracking API',
  fields: (t) => ({
    ping: t.string({
      description: 'A simple ping mutation',
      resolve: () => 'pong - API is working!',
    }),
  }),
})