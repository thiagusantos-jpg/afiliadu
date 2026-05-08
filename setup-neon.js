#!/usr/bin/env node
/**
 * setup-neon.js — Cria o banco Neon + configura DATABASE_URL automaticamente
 * Uso: node setup-neon.js
 * Requisito: Node.js 18+ (já instalado se você tem npm)
 */

const NEON_API_KEY = 'napi_9u5048nvtdtvxea6tml630j1i3ojwh0mn8s5qdl02ipkp6tlpmwhfomx65etq4ow'
const ORG_ID = 'org-misty-water-96144149'
const PROJECT_NAME = 'afiliadu'
const REGION = 'aws-sa-east-1'

async function main() {
  console.log('\n🚀 Configurando banco Neon para o Afiliadu...\n')

  // 1. Criar projeto
  console.log('1️⃣  Criando projeto no Neon...')
  const createRes = await fetch('https://console.neon.tech/api/v2/projects', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${NEON_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      project: { name: PROJECT_NAME, region_id: REGION, pg_version: 16, org_id: ORG_ID },
    }),
  })

  if (!createRes.ok) {
    const err = await createRes.text()
    console.error('❌ Erro ao criar projeto:', err)
    process.exit(1)
  }

  const { project, connection_uris } = await createRes.json()
  console.log(`   ✅ Projeto criado: ${project.name} (${project.id})`)

  // 2. Obter connection string
  const dbUrl = connection_uris?.[0]?.connection_uri
  if (!dbUrl) {
    // Buscar connection string separadamente
    console.log('   Buscando connection string...')
    const branchRes = await fetch(
      `https://console.neon.tech/api/v2/projects/${project.id}/connection_uri?database_name=neondb&role_name=neondb_owner&pooled=true`,
      {
        headers: { Authorization: `Bearer ${NEON_API_KEY}` },
      }
    )
    const { uri } = await branchRes.json()
    printResults(project.id, uri)
  } else {
    printResults(project.id, dbUrl)
  }
}

function printResults(projectId, dbUrl) {
  const authSecret = require('crypto').randomBytes(32).toString('base64')

  console.log('\n✅ BANCO CRIADO COM SUCESSO!\n')
  console.log('═'.repeat(60))
  console.log('\n📋 Adicione estas variáveis no Vercel:')
  console.log('   https://vercel.com/thiagos-projects-b1174a0e/afiliadu/settings/environment-variables\n')
  console.log(`DATABASE_URL="${dbUrl}"`)
  console.log(`AUTH_SECRET="${authSecret}"`)
  console.log('\n' + '═'.repeat(60))
  console.log('\n📋 Rode no terminal para criar as tabelas:\n')
  console.log(`DATABASE_URL="${dbUrl}" npx prisma db push`)
  console.log(`DATABASE_URL="${dbUrl}" npx prisma db seed`)
  console.log('\n' + '═'.repeat(60))
  console.log('\n📋 Variável para .env local (opcional):\n')
  console.log(`DATABASE_URL="${dbUrl}"`)
  console.log(`AUTH_SECRET="${authSecret}"`)
  console.log(`NEXTAUTH_URL="http://localhost:3000"`)
  console.log('\n🎉 Após adicionar no Vercel, clique em "Redeploy" e o app estará funcional!')
  console.log('   Login demo: demo@afiliadu.com / demo123456\n')
}

main().catch(err => {
  console.error('Erro inesperado:', err.message)
  process.exit(1)
})
