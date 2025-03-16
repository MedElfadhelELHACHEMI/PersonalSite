import type { Metadata } from 'next'
import { Montserrat } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from './theme-provider'
import NavBar from '@/components/NavBar'
import Background from '@/components/Background'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { ExternalLink } from 'lucide-react'
import React from 'react'
import { Analytics } from '@vercel/analytics/react'

const montserrat = Montserrat({
  subsets: ['latin'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    template: '%s | Mohamed Hachemi',
    default: 'Mohamed Hachemi | Senior Frontend Developer',
  },
  description:
    'Senior frontend developer with 6+ years of expertise in React, Next.js, and modern UI/UX practices. Specializing in design systems, performance optimization, and leading cross-functional projects.',
  keywords: [
    'frontend developer',
    'React developer',
    'Next.js developer',
    'Paris developer',
    'UI/UX',
    'design systems',
  ],
  authors: [{ name: 'Mohamed Hachemi' }],
  creator: 'Mohamed Hachemi',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://mohamed-hachemi.com',
    title: 'Mohamed Hachemi | Senior Frontend Developer',
    description:
      'Senior frontend developer with 6+ years of expertise in React, Next.js, and modern UI/UX practices.',
    siteName: 'Mohamed Hachemi Portfolio',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Mohamed Hachemi | Senior Frontend Developer',
    description:
      'Senior frontend developer with 6+ years of expertise in React, Next.js, and modern UI/UX practices.',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn(montserrat.className, 'cursor-[--cursor]')}>
        <Analytics />
        <ThemeProvider defaultTheme="dark" attribute="class">
          <Background />
          {/* Navbar container */}
          <header className="relative z-20">
            <div className="flex flex-row justify-end">
              <NavBar />
            </div>
          </header>

          {/* Main content */}
          <main className="relative z-10">{children}</main>
        </ThemeProvider>
        <div className="noise-gradient"></div>
        <footer className="pointer-events-all fixed bottom-0 left-0 flex flex-row items-center gap-1 rounded bg-black bg-opacity-70 p-2 text-xs text-white opacity-30 transition-opacity hover:opacity-100">
          <p>Coded using Webstorm and Claude, inspired by</p>
          <Link
            href="https://www.neobrutalism.dev"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1"
          >
            Neobrutalism.dev
            <ExternalLink size={16} />
          </Link>
        </footer>
      </body>
    </html>
  )
}
