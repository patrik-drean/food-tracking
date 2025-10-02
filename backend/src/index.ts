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

// Get port and host from environment
const port = parseInt(process.env.PORT || '4000', 10)
const host = process.env.NODE_ENV === 'production' ? '0.0.0.0' : 'localhost'

// Start server
server.listen(port, host, () => {
  console.log(`🚀 GraphQL Yoga server is running on http://${host}:${port}/graphql`)
  console.log(`📊 GraphiQL playground available at http://${host}:${port}/graphql`)
  console.log(`🔗 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`)
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`)
  console.log(`🔌 Database: ${process.env.DATABASE_URL ? 'Connected' : 'Not configured'}`)
  console.log(`🏥 Health check endpoint ready at http://${host}:${port}/graphql`)

  // Test database connection on startup
  if (process.env.NODE_ENV === 'production') {
    prisma.$connect()
      .then(() => console.log('✅ Database connection verified'))
      .catch((err) => console.error('❌ Database connection failed:', err))
  }
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