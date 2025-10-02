import { createYoga } from 'graphql-yoga'
import { createServer } from 'node:http'
import { schema } from './schema'
import { prisma } from './lib/prisma'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config()

// Create GraphQL Yoga server
const yoga = createYoga({
  schema,
  context: async () => ({
    prisma,
  }),
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  },
  graphiql: {
    title: 'Food Tracking API',
    defaultQuery: `
query GetTodaysFoods {
  foodsByDate(date: "${new Date().toISOString().split('T')[0]}") {
    id
    description
    calories
    protein
    carbs
    fat
    isManual
    createdAt
  }
}

mutation AddFood {
  addFood(input: {
    description: "1 medium apple"
    calories: 95
    protein: 0.5
    carbs: 25
    fat: 0.3
    isManual: true
  }) {
    id
    description
    calories
    protein
    carbs
    fat
    createdAt
  }
}`,
  },
})

// Create HTTP server
const server = createServer(yoga)

// Get port from environment or use default
const port = process.env.PORT || 4000

// Start server
server.listen(port, () => {
  console.log(`🚀 GraphQL Yoga server is running on http://localhost:${port}/graphql`)
  console.log(`📊 GraphiQL playground available at http://localhost:${port}/graphql`)
  console.log(`🔗 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`)
})

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🔄 Shutting down server...')
  await prisma.$disconnect()
  server.close(() => {
    console.log('✅ Server shut down successfully')
    process.exit(0)
  })
})

process.on('SIGTERM', async () => {
  console.log('\n🔄 Shutting down server...')
  await prisma.$disconnect()
  server.close(() => {
    console.log('✅ Server shut down successfully')
    process.exit(0)
  })
})