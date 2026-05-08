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
      const parsedUrl = new URL(url)
      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
          Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
          'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7',
          'Accept-Encoding': 'gzip, deflate, br',
          'Cache-Control': 'no-cache',
          Pragma: 'no-cache',
          'Sec-Ch-Ua': '"Chromium";v="124", "Google Chrome";v="124", "Not-A.Brand";v="99"',
          'Sec-Ch-Ua-Mobile': '?0',
          'Sec-Ch-Ua-Platform': '"Windows"',
          'Sec-Fetch-Dest': 'document',
          'Sec-Fetch-Mode': 'navigate',
          'Sec-Fetch-Site': 'none',
          'Sec-Fetch-User': '?1',
          'Upgrade-Insecure-Requests': '1',
          Referer: `${parsedUrl.origin}/`,
        },
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        const errorMsg =
          response.status === 403
            ? `Este site bloqueou o acesso automático (status: 403). Tente outro URL ou use a opção "Avançada com IA".`
            : `Não foi possível acessar a URL (status: ${response.status})`
        return NextResponse.json({ error: errorMsg }, { status: 422 })
      }

      htmlContent = await response.text()

      // Detect empty/JS-only pages
      const bodyText = htmlContent.replace(/<[^>]+>/g, '').trim()
      if (htmlContent.length < 500 || bodyText.length < 100) {
        return NextResponse.json(
          {
            error:
              'O conteúdo da página parece estar vazio. Este site provavelmente usa JavaScript para renderizar o conteúdo e não pode ser clonado com a opção rápida. Tente a opção "Avançada com IA".',
          },
          { status: 422 }
        )
      }

      // Extract title from HTML using regex (avoiding cheerio import issues)
      const titleMatch = htmlContent.match(/<title[^>]*>([\s\S]*?)<\/title>/i)
      if (titleMatch) {
        title = titleMatch[1].trim().slice(0, 100) || name
      }

      // Always convert relative URLs to absolute so assets load from the original domain
      const baseUrl = new URL(url)
      htmlContent = htmlContent.replace(
        /(href|src|action)=["'](?!https?:\/\/|data:|#|\/\/|mailto:|tel:)(\.\.\/|\.\/)?([^"']*?)["']/gi,
        (match, attr, _prefix, path) => {
          try {
            const absoluteUrl = new URL(path || '/', baseUrl.origin).href
            return `${attr}="${absoluteUrl}"`
          } catch {
            return match
          }
        }
      )

      // Also fix url() in inline styles
      htmlContent = htmlContent.replace(
        /url\(['"]?(?!https?:\/\/|data:)([^'")]+)['"]?\)/gi,
        (match, path) => {
          try {
            return `url("${new URL(path, baseUrl.origin).href}")`
          } catch {
            return match
          }
        }
      )
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
  } catch (error: any) {
    console.error('[CLONE_ERROR]', error)
    // Surface DB connection issues clearly
    if (error?.message?.includes('DATABASE_URL') || error?.message?.includes('connect ECONNREFUSED') || error?.code === 'P1001') {
      return NextResponse.json({ error: 'Banco de dados não configurado. Adicione DATABASE_URL nas variáveis de ambiente.' }, { status: 503 })
    }
    if (error?.code === 'P2002') {
      return NextResponse.json({ error: 'Já existe uma página com esse nome. Tente outro nome.' }, { status: 409 })
    }
    return NextResponse.json({ error: `Erro interno: ${error?.message ?? 'desconhecido'}` }, { status: 500 })
  }
}
