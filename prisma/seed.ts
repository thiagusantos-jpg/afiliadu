import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Create demo user
  const hashedPassword = await bcrypt.hash('demo123456', 12)

  const user = await prisma.user.upsert({
    where: { email: 'demo@afiliadu.com' },
    update: {},
    create: {
      name: 'Demo User',
      email: 'demo@afiliadu.com',
      password: hashedPassword,
    },
  })

  console.log('✅ Created user:', user.email)

  // Create sample pages
  const pages = await Promise.all([
    prisma.page.upsert({
      where: { slug: 'pressel-produto-fisico-demo' },
      update: {},
      create: {
        name: 'Pressel Produto Físico Demo',
        slug: 'pressel-produto-fisico-demo',
        type: 'PRESSEL',
        templateId: 'pressel-fisico',
        userId: user.id,
      },
    }),
    prisma.page.upsert({
      where: { slug: 'pagina-de-vendas-demo' },
      update: {},
      create: {
        name: 'Página de Vendas Demo',
        slug: 'pagina-de-vendas-demo',
        type: 'SALES',
        templateId: 'sales-clean',
        userId: user.id,
      },
    }),
    prisma.page.upsert({
      where: { slug: 'vsl-com-delay-demo' },
      update: {},
      create: {
        name: 'VSL Com Delay Demo',
        slug: 'vsl-com-delay-demo',
        type: 'VSL',
        templateId: 'vsl-delay',
        userId: user.id,
      },
    }),
    prisma.page.upsert({
      where: { slug: 'pagina-clonada-demo' },
      update: {},
      create: {
        name: 'Página Clonada Demo',
        slug: 'pagina-clonada-demo',
        type: 'CLONE',
        sourceUrl: 'https://example.com',
        cloneMode: 'quick',
        userId: user.id,
      },
    }),
  ])

  console.log(`✅ Created ${pages.length} pages`)

  // Create sample leads
  const leadData = [
    { name: 'João Silva', email: 'joao@gmail.com', phone: '11999887766', source: 'Pressel Produto Físico Demo' },
    { name: 'Maria Santos', email: 'maria@hotmail.com', phone: '21988776655', source: 'Página de Vendas Demo' },
    { name: 'Pedro Oliveira', email: 'pedro@outlook.com', phone: '31977665544', source: 'VSL Com Delay Demo' },
    { name: 'Ana Lima', email: 'ana@gmail.com', phone: '41966554433', source: 'Pressel Produto Físico Demo' },
    { name: 'Carlos Mendes', email: 'carlos@email.com', phone: '51955443322', source: 'Página de Vendas Demo' },
    { name: 'Fernanda Costa', email: 'fernanda@gmail.com', phone: null, source: 'Página de Vendas Demo' },
    { name: 'Roberto Alves', email: null, phone: '61944332211', source: 'VSL Com Delay Demo' },
    { name: 'Juliana Pereira', email: 'juliana@gmail.com', phone: '71933221100', source: 'Pressel Produto Físico Demo' },
  ]

  let leadsCreated = 0
  for (const data of leadData) {
    const existingLead = await prisma.lead.findFirst({
      where: { email: data.email ?? undefined, userId: user.id },
    })
    if (!existingLead) {
      await prisma.lead.create({
        data: {
          ...data,
          phone: data.phone ?? undefined,
          email: data.email ?? undefined,
          userId: user.id,
        },
      })
      leadsCreated++
    }
  }

  console.log(`✅ Created ${leadsCreated} leads`)

  // Create sample domains
  const domainData = [
    { domain: 'meusite.com.br', status: 'ACTIVE' as const },
    { domain: 'landing.minhacampanha.com', status: 'PENDING' as const },
  ]

  let domainsCreated = 0
  for (const data of domainData) {
    const existing = await prisma.domain.findUnique({ where: { domain: data.domain } })
    if (!existing) {
      await prisma.domain.create({
        data: { ...data, userId: user.id },
      })
      domainsCreated++
    }
  }

  console.log(`✅ Created ${domainsCreated} domains`)

  console.log('\n✨ Seeding completed!')
  console.log('📧 Demo login: demo@afiliadu.com')
  console.log('🔑 Password: demo123456')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
