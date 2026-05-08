import { Play, Video, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function PlayerPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Afiliadu Player</h1>
        <p className="text-sm text-gray-500 mt-0.5">Meus Vídeos</p>
      </div>

      <div className="bg-gradient-to-br from-purple-50 to-indigo-50 border border-purple-100 rounded-2xl p-12 text-center">
        <div className="inline-flex items-center justify-center h-20 w-20 rounded-2xl bg-purple-600 mb-6 shadow-lg shadow-purple-500/20">
          <Play className="h-10 w-10 text-white fill-white" />
        </div>

        <h2 className="text-2xl font-bold text-gray-900 mb-3">Afiliadu Player</h2>

        <div className="inline-flex items-center gap-2 bg-amber-100 text-amber-800 text-sm font-semibold px-3 py-1.5 rounded-full mb-4">
          <Zap className="h-4 w-4" />
          Em breve
        </div>

        <p className="text-gray-600 max-w-md mx-auto mb-8">
          O Afiliadu Player é um player de vídeo profissional com recursos exclusivos para afiliados:
          controle de velocidade, elementos de scarcity, calls-to-action dentro do vídeo e muito mais.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl mx-auto mb-8">
          {[
            { icon: '▶️', title: 'Player Profissional', desc: 'Design clean e de alta conversão' },
            { icon: '⏱️', title: 'Controle de Tempo', desc: 'Libere conteúdo por tempo de visualização' },
            { icon: '🎯', title: 'CTA no Vídeo', desc: 'Botões e pop-ups dentro do player' },
          ].map((feature) => (
            <div key={feature.title} className="bg-white rounded-xl p-4 text-left border border-purple-100 shadow-sm">
              <span className="text-2xl">{feature.icon}</span>
              <p className="font-semibold text-gray-900 mt-2 text-sm">{feature.title}</p>
              <p className="text-xs text-gray-500 mt-0.5">{feature.desc}</p>
            </div>
          ))}
        </div>

        <Button className="gap-2 bg-purple-600 hover:bg-purple-700">
          <Video className="h-4 w-4" />
          Notificar quando disponível
        </Button>
      </div>
    </div>
  )
}
