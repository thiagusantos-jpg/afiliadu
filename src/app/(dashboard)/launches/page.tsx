import { Rocket, Zap, Star } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

const changelog = [
  {
    version: '1.3.0',
    date: '08 de Maio, 2025',
    type: 'feature',
    title: 'Clonagem Avançada com IA',
    description:
      'Lançamos o modo de Clonagem Avançada com IA! Agora ao clonar páginas, nossa IA analisa o conteúdo e otimiza a página automaticamente para maior conversão. As URLs de recursos externos são automaticamente convertidas para absolutas.',
    items: [
      'Novo modo de clonagem com IA (BETA)',
      'Detecção automática de tipo de página',
      'Otimização de URLs de recursos externos',
      'Interface de clonagem completamente redesenhada',
    ],
    icon: '🤖',
  },
  {
    version: '1.2.0',
    date: '01 de Maio, 2025',
    type: 'feature',
    title: 'Módulo de Leads Aprimorado',
    description:
      'O módulo de Leads recebeu uma grande atualização! Agora você pode exportar seus leads em formato CSV, selecionar múltiplos leads para exclusão em massa e visualizar a origem de cada lead.',
    items: [
      'Exportação de leads em CSV',
      'Seleção e exclusão em massa',
      'Nova coluna de origem do lead',
      'Links diretos para WhatsApp e email',
    ],
    icon: '👥',
  },
  {
    version: '1.1.0',
    date: '15 de Abril, 2025',
    type: 'improvement',
    title: 'Dashboard e Performance',
    description:
      'Grandes melhorias de performance e usabilidade no dashboard. O carregamento das páginas ficou até 3x mais rápido graças ao novo sistema de cache e otimizações no banco de dados.',
    items: [
      'Dashboard redesenhado com estatísticas em tempo real',
      'Performance até 3x mais rápida',
      'Novo sistema de navegação lateral',
      'Suporte a domínios personalizados',
      'Templates de página expandidos (26 templates)',
    ],
    icon: '⚡',
  },
]

const badgeConfig = {
  feature: { label: 'Novo Recurso', variant: 'default' as const },
  improvement: { label: 'Melhoria', variant: 'info' as const },
  fix: { label: 'Correção', variant: 'secondary' as const },
}

export default function LaunchesPage() {
  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-indigo-600 flex items-center justify-center">
          <Rocket className="h-5 w-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Novidades</h1>
          <p className="text-sm text-gray-500">Últimas atualizações e lançamentos da plataforma</p>
        </div>
      </div>

      {/* Latest banner */}
      <div className="bg-gradient-to-r from-indigo-600 to-violet-600 rounded-2xl p-6 text-white">
        <div className="flex items-center gap-2 mb-2">
          <Star className="h-4 w-4 text-yellow-300 fill-yellow-300" />
          <span className="text-sm font-semibold text-indigo-200">Última atualização</span>
        </div>
        <h2 className="text-xl font-bold mb-1">v{changelog[0].version} - {changelog[0].title}</h2>
        <p className="text-indigo-200 text-sm">{changelog[0].description.slice(0, 100)}...</p>
      </div>

      {/* Changelog */}
      <div className="space-y-6">
        {changelog.map((entry, idx) => (
          <div key={entry.version} className="relative">
            {/* Timeline line */}
            {idx < changelog.length - 1 && (
              <div className="absolute left-6 top-14 bottom-0 w-0.5 bg-gray-100" />
            )}

            <div className="flex gap-4">
              {/* Icon */}
              <div className="flex-shrink-0 h-12 w-12 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center text-xl shadow-sm">
                {entry.icon}
              </div>

              {/* Content */}
              <div className="flex-1 bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <span className="text-xs font-mono bg-gray-100 text-gray-600 px-2 py-0.5 rounded font-semibold">
                    v{entry.version}
                  </span>
                  <Badge variant={badgeConfig[entry.type as keyof typeof badgeConfig]?.variant ?? 'default'}>
                    {badgeConfig[entry.type as keyof typeof badgeConfig]?.label ?? entry.type}
                  </Badge>
                  <span className="text-xs text-gray-400 ml-auto">{entry.date}</span>
                </div>

                <h3 className="text-base font-semibold text-gray-900 mb-2">{entry.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed mb-4">{entry.description}</p>

                <ul className="space-y-1.5">
                  {entry.items.map((item) => (
                    <li key={item} className="flex items-center gap-2 text-sm text-gray-700">
                      <Zap className="h-3.5 w-3.5 text-indigo-500 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer note */}
      <div className="text-center py-4">
        <p className="text-sm text-gray-400">
          Acompanhe as novidades e atualizações da plataforma por aqui!
        </p>
      </div>
    </div>
  )
}
