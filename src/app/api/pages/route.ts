import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { generateSlug } from '@/lib/utils'

const createPageSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  type: z.enum(['BLANK', 'SALES', 'VSL', 'PRESSEL', 'BACK_REDIRECT', 'QUIZ', 'THANK_YOU', 'TERMS', 'CLONE']),
  templateId: z.string().optional(),
})

export async function GET(request: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') ?? '1')
    const limit = parseInt(searchParams.get('limit') ?? '20')
    const type = searchParams.get('type')
    const skip = (page - 1) * limit

    const where = {
      userId: session.user.id,
      ...(type && type !== 'ALL' ? { type: type as any } : {}),
    }

    const [pages, total] = await Promise.all([
      prisma.page.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.page.count({ where }),
    ])

    return NextResponse.json({
      data: pages,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('[PAGES_GET_ERROR]', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const parsed = createPageSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 }
      )
    }

    const { name, type, templateId } = parsed.data
    const slug = generateSlug(name)

    const page = await prisma.page.create({
      data: {
        name,
        slug,
        type,
        templateId,
        userId: session.user.id,
      },
    })

    return NextResponse.json({ data: page }, { status: 201 })
  } catch (error) {
    console.error('[PAGES_POST_ERROR]', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
