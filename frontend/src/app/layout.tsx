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
      <head>
        <title>Food Tracker</title>
        <meta name="description" content="Track meals and nutrition" />
        <meta name="theme-color" content="#10b981" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Food Tracker" />
        <link rel="apple-touch-icon" href="/apple-icon" />
      </head>
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
