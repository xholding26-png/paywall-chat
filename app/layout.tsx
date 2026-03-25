import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Deadpool — Bet on Narratives',
  description: 'The prediction market for crypto narratives. Stake on which narrative will dominate CT this week. Early callers earn more.',
  openGraph: {
    title: 'Deadpool — Bet on Narratives',
    description: 'The prediction market for crypto narratives. Stake on which narrative will dominate CT this week.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Deadpool — Bet on Narratives',
    description: 'The prediction market for crypto narratives. Stake on which narrative will dominate CT this week.',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased">
        <div className="noise-overlay" />
        <div className="grid-pattern min-h-screen">
          {children}
        </div>
      </body>
    </html>
  )
}
