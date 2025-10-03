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
          {children}
        </GraphQLProvider>
      </body>
    </html>
  )
}