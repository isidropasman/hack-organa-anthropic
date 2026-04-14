import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Sidebar from '@/components/Sidebar'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'ORGANA — Organizational Memory',
  description: 'AI-powered organizational memory. Train agents. Preserve knowledge.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-organa-bg text-organa-text min-h-screen flex`}>
        <Sidebar />
        <div className="flex-1 min-w-0 overflow-x-hidden">
          {children}
        </div>
      </body>
    </html>
  )
}
