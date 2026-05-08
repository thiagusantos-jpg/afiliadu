import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Afiliadu - Plataforma de Marketing de Afiliados',
  description: 'Crie páginas de alta conversão, clone páginas, gerencie leads e domine o marketing de afiliados.',
  icons: {
    icon: '/favicon.ico',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body className="antialiased">{children}</body>
    </html>
  )
}
