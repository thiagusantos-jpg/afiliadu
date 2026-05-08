import { Search, Eye, TrendingUp, Filter } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function SpyPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Afiliadu SPY</h1>
        <p className="text-sm text-gray-500 mt-0.5">Espionar Anúncios</p>
      </div>

      <div className="bg-gradient-to-br from-slate-50 to-blue-50 border border-slate-100 rounded-2xl p-12 text-center">
        <div className="inline-flex items-center justify-center h-20 w-20 rounded-2xl bg-slate-800 mb-6 shadow-lg shadow-slate-500/20">
          <Eye className="h-10 w-10 text-white" />
        </div>

        <h2 className="text-2xl font-bold text-gray-900 mb-3">Afiliadu SPY</h2>

        <div className="inline-flex items-center gap-2 bg-amber-100 text-amber-800 text-sm font-semibold px-3 py-1.5 rounded-full mb-4">
          <TrendingUp className="h-4 w-4" />
          Em breve
        </div>

        <p className="text-gray-600 max-w-lg mx-auto mb-8">
          Com o Afiliadu SPY você poderá espionar os anúncios dos seus concorrentes no Facebook, Instagram
          e Google, descobrindo o que está funcionando no mercado e replicando as melhores estratégias.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl mx-auto mb-8">
          {[
            {
              icon: '🔍',
              title: 'Espionar Anúncios',
              desc: 'Veja os anúncios dos concorrentes por nicho e período',
              href: '/dashboard/spy',
              badge: null,
            },
            {
              icon: '🌐',
              title: 'Pesquisa Google',
              desc: 'Descubra as páginas que mais aparecem no Google Ads',
              href: '/dashboard/spy/google',
              badge: 'BETA',
            },
          ].map((feature) => (
            <div key={feature.title} className="bg-white rounded-xl p-4 text-left border border-slate-200 shadow-sm">
              <div className="flex items-start gap-3">
                <span className="text-2xl">{feature.icon}</span>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-gray-900 text-sm">{feature.title}</p>
                    {feature.badge && (
                      <span className="text-[10px] font-bold bg-amber-500 text-white px-1.5 py-0.5 rounded">
                        {feature.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">{feature.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <Button className="gap-2">
          <Search className="h-4 w-4" />
          Notificar quando disponível
        </Button>
      </div>
    </div>
  )
}
