import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import dynamic from 'next/dynamic'

const Navbar = dynamic(() => import('./components/Navbar').then(mod => ({ default: mod.Navbar })), {
  ssr: false,
})

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Paywall.chat — Paid DMs',
  description: 'Get paid for your attention. Send paid DMs to anyone.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} min-h-screen bg-[#0a0a0f]`}>
        <Navbar />
        <main className="max-w-2xl mx-auto px-4 pb-24 pt-4">
          {children}
        </main>
      </body>
    </html>
  )
}
