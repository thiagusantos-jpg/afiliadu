import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { generateSlug } from '@/lib/utils'

const BROWSER_HEADERS = {
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
}

function makeUrlsAbsolute(html: string, origin: string): string {
  let result = html.replace(
    /(href|src|action)=["'](?!https?:\/\/|data:|#|\/\/|mailto:|tel:)(\.\.\/|\.\/)?([^"']*?)["']/gi,
    (match, attr, _prefix, path) => {
      try {
        return `${attr}="${new URL(path || '/', origin).href}"`
      } catch {
        return match
      }
    }
  )
  result = result.replace(
    /url\(['"]?(?!https?:\/\/|data:)([^'")]+)['"]?\)/gi,
    (match, path) => {
      try {
        return `url("${new URL(path, origin).href}")`
      } catch {
        return match
      }
    }
  )
  return result
}

function isContentEmpty(html: string): boolean {
  const text = html.replace(/<[^>]+>/g, '').trim()
  return html.length < 500 || text.length < 100
}

async function fetchViaBrowserless(url: string): Promise<string | null> {
  const token = process.env.BROWSERLESS_TOKEN
  if (!token) return null

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 45000)

  try {
    const res = await fetch(`https://chrome.browserless.io/content?token=${token}`, {
      method: 'POST',
      signal: controller.signal,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        url,
        waitFor: 4000,
        gotoOptions: { waitUntil: 'networkidle2', timeout: 30000 },
      }),
    })
    if (!res.ok) {
      console.error('[BROWSERLESS_ERROR]', res.status, await res.text())
      return null
    }
    return res.text()
  } finally {
    clearTimeout(timeout)
  }
}

async function fetchWithFallback(url: string, origin: string, signal: AbortSignal): Promise<string> {
  // 1. Try direct fetch first
  const directRes = await fetch(url, { signal, headers: { ...BROWSER_HEADERS, Referer: `${origin}/` } }).catch(() => null)

  let html: string | null = null

  if (directRes?.ok) {
    const text = await directRes.text()
    if (!isContentEmpty(text)) {
      html = text
    }
  }

  // 2. Fallback to Browserless if direct fetch failed or returned empty content
  if (!html) {
    console.log('[CLONE] Direct fetch failed or empty, trying Browserless...')
    const browserHtml = await fetchViaBrowserless(url).catch((e) => {
      console.error('[BROWSERLESS_FETCH_ERROR]', e)
      return null
    })
    if (browserHtml && !isContentEmpty(browserHtml)) {
      html = browserHtml
    }
  }

  if (!html) {
    if (!process.env.BROWSERLESS_TOKEN) {
      throw new Error(
        directRes.ok
          ? 'O conteúdo da página parece estar vazio. Este site usa JavaScript para renderizar. Configure BROWSERLESS_TOKEN nas variáveis de ambiente para clonar este tipo de site.'
          : `Este site bloqueou o acesso (status: ${directRes.status}). Configure BROWSERLESS_TOKEN nas variáveis de ambiente para clonar este tipo de site.`
      )
    }
    throw new Error(
      'Não foi possível capturar o conteúdo desta página. O site pode ter proteções avançadas contra clonagem.'
    )
  }

  return makeUrlsAbsolute(html, origin)
}

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
    const timeoutId = setTimeout(() => controller.abort(), 60000)

    let htmlContent = ''
    let title = name

    try {
      const parsedUrl = new URL(url)
      htmlContent = await fetchWithFallback(url, parsedUrl.origin, controller.signal)
      clearTimeout(timeoutId)

      // Extract title from HTML using regex (avoiding cheerio import issues)
      const titleMatch = htmlContent.match(/<title[^>]*>([\s\S]*?)<\/title>/i)
      if (titleMatch) {
        title = titleMatch[1].trim().slice(0, 100) || name
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
        { error: fetchError.message ?? 'Não foi possível acessar a URL. Verifique se ela está correta e acessível.' },
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
