'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { Gift, Copy, Check, Users, DollarSign, TrendingUp, Share2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://afiliadu.com'

export default function AffiliatePage() {
  const { data: session } = useSession()
  const [copied, setCopied] = useState(false)

  const referralCode = session?.user?.id?.slice(-8).toUpperCase() ?? 'LOADING'
  const referralLink = `${APP_URL}/register?ref=${referralCode}`

  const handleCopy = () => {
    navigator.clipboard.writeText(referralLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const stats = [
    {
      label: 'Indicações',
      value: '0',
      icon: Users,
      color: 'text-indigo-600',
      bg: 'bg-indigo-50',
    },
    {
      label: 'Conversões',
      value: '0',
      icon: TrendingUp,
      color: 'text-green-600',
      bg: 'bg-green-50',
    },
    {
      label: 'Comissão Total',
      value: 'R$ 0,00',
      icon: DollarSign,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
    },
  ]

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center">
          <Gift className="h-5 w-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Promova e Ganhe</h1>
          <p className="text-sm text-gray-500">Programa de Afiliados da Afiliadu</p>
        </div>
      </div>

      {/* Hero Banner */}
      <div className="bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700 rounded-2xl p-8 text-white">
        <div className="text-center">
          <span className="text-4xl mb-4 block">🎁</span>
          <h2 className="text-2xl font-bold mb-2">Ganhe comissão por cada indicação!</h2>
          <p className="text-indigo-200 text-sm max-w-sm mx-auto">
            Indique a Afiliadu para seus amigos e ganhe comissão recorrente por cada assinatura ativa.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-4 mt-8">
          {[
            { emoji: '🔗', label: 'Compartilhe', desc: 'Seu link único' },
            { emoji: '📩', label: 'Converta', desc: 'Amigo assina' },
            { emoji: '💰', label: 'Ganhe', desc: 'Comissão recorrente' },
          ].map((step) => (
            <div key={step.label} className="text-center">
              <span className="text-2xl block mb-1">{step.emoji}</span>
              <p className="font-semibold text-sm">{step.label}</p>
              <p className="text-indigo-300 text-xs">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.label} className="border-0 shadow-sm">
              <CardContent className="p-4 text-center">
                <div
                  className={`h-10 w-10 rounded-xl ${stat.bg} flex items-center justify-center mx-auto mb-2`}
                >
                  <Icon className={`h-5 w-5 ${stat.color}`} />
                </div>
                <p className="text-xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-xs text-gray-500">{stat.label}</p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Referral Link */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-6">
          <h3 className="font-semibold text-gray-900 mb-1">Seu Link de Indicação</h3>
          <p className="text-sm text-gray-500 mb-4">
            Código:{' '}
            <span className="font-mono font-semibold text-indigo-600">{referralCode}</span>
          </p>

          <div className="flex gap-2">
            <Input
              readOnly
              value={referralLink}
              className="bg-gray-50 text-gray-700 text-sm font-mono"
            />
            <Button onClick={handleCopy} className="gap-2 flex-shrink-0">
              {copied ? (
                <>
                  <Check className="h-4 w-4" />
                  Copiado!
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                  Copiar
                </>
              )}
            </Button>
          </div>

          <div className="flex gap-2 mt-3">
            <Button
              variant="outline"
              size="sm"
              className="gap-2 flex-1"
              onClick={() => {
                const text = `Olá! Use meu link para se cadastrar gratuitamente na Afiliadu, a plataforma completa de marketing de afiliados: ${referralLink}`
                window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank')
              }}
            >
              <Share2 className="h-4 w-4 text-green-600" />
              Compartilhar no WhatsApp
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Coming Soon Notice */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <span className="text-xl">⏳</span>
          <div>
            <p className="font-semibold text-amber-900 text-sm">Programa em fase de lançamento</p>
            <p className="text-amber-700 text-sm mt-0.5">
              As comissões e pagamentos serão liberados em breve. Por enquanto, já comece a divulgar e
              acumule suas indicações!
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
