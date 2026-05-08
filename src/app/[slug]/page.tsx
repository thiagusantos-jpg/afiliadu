import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params
  const page = await prisma.page.findUnique({ where: { slug } })
  return { title: page?.name ?? 'Página' }
}

export default async function PublicPage({ params }: Props) {
  const { slug } = await params
  const page = await prisma.page.findUnique({ where: { slug } })

  if (!page) notFound()

  if (page.type === 'CLONE' && page.htmlContent) {
    return (
      <html>
        <body dangerouslySetInnerHTML={{ __html: page.htmlContent }} />
      </html>
    )
  }

  // Other page types (SALES, VSL, etc.) — placeholder until editor is implemented
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', fontFamily: 'sans-serif' }}>
      <p>Página em construção.</p>
    </div>
  )
}
