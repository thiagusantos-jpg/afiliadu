import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const createLeadSchema = z.object({
  name: z.string().optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  source: z.string().optional(),
  pageId: z.string().optional(),
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
    const format = searchParams.get('format')
    const skip = (page - 1) * limit

    const where = { userId: session.user.id }

    const [leads, total] = await Promise.all([
      prisma.lead.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: format === 'csv' ? 0 : skip,
        take: format === 'csv' ? undefined : limit,
        include: {
          page: {
            select: { name: true },
          },
        },
      }),
      prisma.lead.count({ where }),
    ])

    if (format === 'csv') {
      const headers = 'Nome,Email,Telefone,Origem,Data\n'
      const rows = leads
        .map((lead) => {
          const date = new Intl.DateTimeFormat('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          }).format(lead.createdAt)
          return [
            lead.name ?? '',
            lead.email ?? '',
            lead.phone ?? '',
            lead.page?.name ?? lead.source ?? '',
            date,
          ]
            .map((v) => `"${v}"`)
            .join(',')
        })
        .join('\n')

      return new NextResponse(headers + rows, {
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="leads-${Date.now()}.csv"`,
        },
      })
    }

    return NextResponse.json({
      data: leads,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('[LEADS_GET_ERROR]', error)
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
    const parsed = createLeadSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 }
      )
    }

    const lead = await prisma.lead.create({
      data: {
        ...parsed.data,
        userId: session.user.id,
      },
    })

    return NextResponse.json({ data: lead }, { status: 201 })
  } catch (error) {
    console.error('[LEADS_POST_ERROR]', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const ids = z.array(z.string()).parse(body.ids)

    await prisma.lead.deleteMany({
      where: {
        id: { in: ids },
        userId: session.user.id,
      },
    })

    return NextResponse.json({ message: 'Leads excluídos com sucesso' })
  } catch (error) {
    console.error('[LEADS_DELETE_ERROR]', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
