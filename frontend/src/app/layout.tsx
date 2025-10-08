'use client';

import { Inter } from 'next/font/google'
import './globals.css'
import { GraphQLProvider } from '../lib/graphql-client'
import { SessionProvider } from 'next-auth/react'

const inter = Inter({ subsets: ['latin'] })

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-gray-50 text-gray-900 antialiased`}>
        <SessionProvider>
          <GraphQLProvider>
            {children}
          </GraphQLProvider>
        </SessionProvider>
      </body>
    </html>
  )
}