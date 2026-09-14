import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Wedding Invitation',
  description: 'You are invited!',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  )
}
