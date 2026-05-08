import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { LayoutGrid, Users, Globe, Copy, Plus, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatDate, getPageTypeLabel, getPageTypeColor } from '@/lib/utils'

async function getDashboardData(userId: string) {
  const [pagesCount, leadsCount, domainsCount, clonesCount, recentPages] = await Promise.all([
    prisma.page.count({ where: { userId } }),
    prisma.lead.count({ where: { userId } }),
    prisma.domain.count({ where: { userId } }),
    prisma.page.count({ where: { userId, type: 'CLONE' } }),
    prisma.page.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 5,
    }),
  ])
  return { pagesCount, leadsCount, domainsCount, clonesCount, recentPages }
}

export default async function DashboardPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  const { pagesCount, leadsCount, domainsCount, clonesCount, recentPages } =
    await getDashboardData(session.user.id)

  const stats = [
    { label: 'Total de Páginas', value: pagesCount, icon: LayoutGrid, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { label: 'Total de Leads', value: leadsCount, icon: Users, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Domínios Conectados', value: domainsCount, icon: Globe, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Clones Criados', value: clonesCount, icon: Copy, color: 'text-orange-600', bg: 'bg-orange-50' },
  ]

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Bem-vindo, {session.user.name?.split(' ')[0] ?? 'Afiliado'}! 👋
        </h1>
        <p className="text-gray-500 mt-1">Aqui está um resumo da sua conta.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.label} className="border-0 shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className={`h-12 w-12 rounded-xl ${stat.bg} flex items-center justify-center`}>
                    <Icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                    <p className="text-sm text-gray-500">{stat.label}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Pages */}
        <div className="lg:col-span-2">
          <Card className="border-0 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base font-semibold">Páginas Recentes</CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/dashboard/pages" className="text-indigo-600 flex items-center gap-1">
                  Ver todas <ArrowRight className="h-3 w-3" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              {recentPages.length === 0 ? (
                <div className="text-center py-8">
                  <LayoutGrid className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 text-sm">Nenhuma página criada ainda.</p>
                  <Button className="mt-4" size="sm" asChild>
                    <Link href="/dashboard/pages">
                      <Plus className="h-4 w-4 mr-2" />
                      Criar primeira página
                    </Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentPages.map((page) => (
                    <div
                      key={page.id}
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="h-9 w-9 rounded-lg bg-indigo-100 flex items-center justify-center">
                        <LayoutGrid className="h-4 w-4 text-indigo-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{page.name}</p>
                        <p className="text-xs text-gray-400">/{page.slug}</p>
                      </div>
                      <Badge className={getPageTypeColor(page.type)}>
                        {getPageTypeLabel(page.type)}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div>
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base font-semibold">Ações Rápidas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { label: 'Nova Página', href: '/dashboard/pages', icon: Plus, color: 'bg-indigo-600 text-white hover:bg-indigo-700' },
                { label: 'Adicionar Domínio', href: '/dashboard/domains', icon: Globe, color: 'bg-blue-600 text-white hover:bg-blue-700' },
                { label: 'Ver Leads', href: '/dashboard/leads', icon: Users, color: 'bg-green-600 text-white hover:bg-green-700' },
              ].map((action) => {
                const Icon = action.icon
                return (
                  <Link
                    key={action.href}
                    href={action.href}
                    className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${action.color}`}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="text-sm font-medium">{action.label}</span>
                    <ArrowRight className="h-4 w-4 ml-auto" />
                  </Link>
                )
              })}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
