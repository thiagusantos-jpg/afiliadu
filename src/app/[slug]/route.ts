import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  const page = await prisma.page.findUnique({ where: { slug } })

  if (!page) notFound()

  if (page.type === 'CLONE' && page.htmlContent) {
    return new Response(page.htmlContent, {
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    })
  }

  const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="UTF-8"><title>${page.name}</title>
<style>body{margin:0;display:flex;align-items:center;justify-content:center;height:100vh;font-family:sans-serif;color:#666}</style>
</head>
<body><p>Página em construção.</p></body>
</html>`

  return new Response(html, {
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  })
}
