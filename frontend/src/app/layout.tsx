import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { GraphQLProvider } from '../lib/graphql-client'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Food Tracking App',
  description: 'Personal food tracking application with AI-powered nutrition analysis',
  keywords: ['food tracking', 'nutrition', 'calories', 'health'],
  authors: [{ name: 'Patrik Drean' }],
  viewport: 'width=device-width, initial-scale=1',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-gray-50 text-gray-900 antialiased`}>
        <GraphQLProvider>
          <div className="min-h-screen">
            <header className="bg-white shadow-sm border-b">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                  <h1 className="text-xl font-semibold text-gray-900">
                    Food Tracker
                  </h1>
                  <div className="text-sm text-gray-500">
                    Personal Nutrition Tracking
                  </div>
                </div>
              </div>
            </header>
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              {children}
            </main>
          </div>
        </GraphQLProvider>
      </body>
    </html>
  )
}