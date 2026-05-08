import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { generateSlug } from '@/lib/utils'

const cloneSchema = z.object({
  url: z.string().url('URL inválida'),
  mode: z.enum(['quick', 'advanced']),
  name: z.string().min(1, 'Nome é obrigatório'),
})

export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const parsed = cloneSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 }
      )
    }

    const { url, mode, name } = parsed.data

    // Fetch the URL with a timeout
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 15000)

    let htmlContent = ''
    let title = name

    try {
      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'pt-BR,pt;q=0.9,en;q=0.8',
        },
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        return NextResponse.json(
          { error: `Não foi possível acessar a URL (status: ${response.status})` },
          { status: 422 }
        )
      }

      htmlContent = await response.text()

      // Extract title from HTML using regex (avoiding cheerio import issues)
      const titleMatch = htmlContent.match(/<title[^>]*>([\s\S]*?)<\/title>/i)
      if (titleMatch) {
        title = titleMatch[1].trim().slice(0, 100) || name
      }

      // In advanced mode, do more processing
      if (mode === 'advanced') {
        // Make URLs absolute
        const baseUrl = new URL(url)
        htmlContent = htmlContent.replace(
          /(href|src)=["'](?!https?:\/\/|data:|#|\/\/)(\.\.\/|\.\/)?([^"']*?)["']/gi,
          (match, attr, _prefix, path) => {
            try {
              const absoluteUrl = new URL(path, baseUrl.origin).href
              return `${attr}="${absoluteUrl}"`
            } catch {
              return match
            }
          }
        )
      }
    } catch (fetchError: any) {
      clearTimeout(timeoutId)
      if (fetchError.name === 'AbortError') {
        return NextResponse.json(
          { error: 'Tempo limite excedido ao buscar a URL. Tente novamente.' },
          { status: 408 }
        )
      }
      return NextResponse.json(
        { error: 'Não foi possível acessar a URL. Verifique se ela está correta e acessível.' },
        { status: 422 }
      )
    }

    const slug = generateSlug(name)

    const page = await prisma.page.create({
      data: {
        name,
        slug,
        type: 'CLONE',
        sourceUrl: url,
        cloneMode: mode,
        htmlContent,
        userId: session.user.id,
      },
    })

    return NextResponse.json(
      {
        data: page,
        message: `Página "${title}" clonada com sucesso!`,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('[CLONE_ERROR]', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
