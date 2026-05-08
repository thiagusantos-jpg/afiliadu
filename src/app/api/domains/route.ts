import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const createDomainSchema = z.object({
  domain: z
    .string()
    .min(1, 'Domínio é obrigatório')
    .regex(
      /^([a-z0-9]+(-[a-z0-9]+)*\.)+[a-z]{2,}$/i,
      'Domínio inválido. Ex: meusite.com.br'
    ),
})

export async function GET(_request: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const domains = await prisma.domain.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ data: domains })
  } catch (error) {
    console.error('[DOMAINS_GET_ERROR]', error)
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
    const parsed = createDomainSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 }
      )
    }

    const { domain } = parsed.data

    const existing = await prisma.domain.findUnique({ where: { domain } })
    if (existing) {
      return NextResponse.json(
        { error: 'Este domínio já está cadastrado.' },
        { status: 409 }
      )
    }

    const created = await prisma.domain.create({
      data: {
        domain,
        status: 'PENDING',
        userId: session.user.id,
      },
    })

    return NextResponse.json({ data: created }, { status: 201 })
  } catch (error) {
    console.error('[DOMAINS_POST_ERROR]', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'ID é obrigatório' }, { status: 400 })
    }

    const existing = await prisma.domain.findFirst({
      where: { id, userId: session.user.id },
    })

    if (!existing) {
      return NextResponse.json({ error: 'Domínio não encontrado' }, { status: 404 })
    }

    await prisma.domain.delete({ where: { id } })

    return NextResponse.json({ message: 'Domínio removido com sucesso' })
  } catch (error) {
    console.error('[DOMAINS_DELETE_ERROR]', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
