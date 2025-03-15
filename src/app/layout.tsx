import type { Metadata } from 'next'
import { Montserrat } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from './theme-provider'
import NavBar from '@/components/NavBar'
import Background from '@/components/Background'

const montserrat = Montserrat({
  subsets: ['latin'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    template: '%s | Mohamed Hachemi',
    default: 'Mohamed Hachemi | Senior Frontend Developer',
  },
  description: 'Senior frontend developer with 6+ years of expertise in React, Next.js, and modern UI/UX practices. Specializing in design systems, performance optimization, and leading cross-functional projects.',
  keywords: ['frontend developer', 'React developer', 'Next.js developer', 'Paris developer', 'UI/UX', 'design systems'],
  authors: [{ name: 'Mohamed Hachemi' }],
  creator: 'Mohamed Hachemi',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://mohamed-hachemi.com',
    title: 'Mohamed Hachemi | Senior Frontend Developer',
    description: 'Senior frontend developer with 6+ years of expertise in React, Next.js, and modern UI/UX practices.',
    siteName: 'Mohamed Hachemi Portfolio',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Mohamed Hachemi | Senior Frontend Developer',
    description: 'Senior frontend developer with 6+ years of expertise in React, Next.js, and modern UI/UX practices.',
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
      <body className={montserrat.className}>
        <Background />
        <ThemeProvider defaultTheme="dark" attribute="class">
          {/* Navbar container */}
          <header className="relative z-20">
            <div className="flex flex-row justify-end">
              <NavBar />
            </div>
          </header>

          {/* Main content */}
          <main className="relative z-10">
            {children}
          </main>
        </ThemeProvider>
        <div className="noise-gradient"></div>
      </body>
    </html>
  )
}
