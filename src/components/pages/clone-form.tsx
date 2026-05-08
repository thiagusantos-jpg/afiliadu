'use client'

import { useState } from 'react'
import { Zap, Sparkles, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { CloneMode } from '@/types'

interface CloneFormProps {
  onSuccess: () => void
}

export function CloneForm({ onSuccess }: CloneFormProps) {
  const [mode, setMode] = useState<CloneMode>('quick')
  const [url, setUrl] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (!url.startsWith('http')) {
      setError('Por favor, insira uma URL válida começando com http:// ou https://')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/clone', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, mode, name: name || new URL(url).hostname }),
      })

      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? 'Erro ao clonar página.')
        return
      }

      onSuccess()
    } catch {
      setError('Erro ao clonar página. Verifique a URL e tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Mode selector */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <button
          type="button"
          onClick={() => setMode('quick')}
          className={`relative p-4 rounded-xl border-2 text-left transition-all ${
            mode === 'quick'
              ? 'border-indigo-500 bg-indigo-50'
              : 'border-gray-200 hover:border-gray-300 bg-white'
          }`}
        >
          {mode === 'quick' && (
            <div className="absolute top-3 right-3 h-4 w-4 rounded-full bg-indigo-600 flex items-center justify-center">
              <span className="text-white text-[10px]">✓</span>
            </div>
          )}
          <div className="flex items-center gap-2 mb-2">
            <Zap className="h-5 w-5 text-yellow-500" />
            <span className="font-semibold text-gray-900">Clonagem Rápida</span>
          </div>
          <ul className="space-y-1">
            {[
              '⚡ Pronta em segundos',
              '🔗 Mantém referências externas',
              '✅ Ideal para afiliados',
            ].map((item) => (
              <li key={item} className="text-xs text-gray-600">{item}</li>
            ))}
          </ul>
        </button>

        <button
          type="button"
          onClick={() => setMode('advanced')}
          className={`relative p-4 rounded-xl border-2 text-left transition-all ${
            mode === 'advanced'
              ? 'border-indigo-500 bg-indigo-50'
              : 'border-gray-200 hover:border-gray-300 bg-white'
          }`}
        >
          {mode === 'advanced' && (
            <div className="absolute top-3 right-3 h-4 w-4 rounded-full bg-indigo-600 flex items-center justify-center">
              <span className="text-white text-[10px]">✓</span>
            </div>
          )}
          <div className="flex items-center gap-3 mb-2">
            <Sparkles className="h-5 w-5 text-indigo-500" />
            <span className="font-semibold text-gray-900">Avançada com IA</span>
            <span className="text-[10px] font-bold bg-amber-500 text-white px-1.5 py-0.5 rounded">
              BETA
            </span>
          </div>
          <ul className="space-y-1">
            {[
              '🤖 Análise profunda com IA',
              '📦 100% independente',
              '⏱️ Pode levar até 15 min',
            ].map((item) => (
              <li key={item} className="text-xs text-gray-600">{item}</li>
            ))}
          </ul>
        </button>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="clone-url">URL da página para clonar</Label>
          <Input
            id="clone-url"
            type="url"
            placeholder="https://exemplo.com/pagina-de-vendas"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            required
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="clone-name">Nome da página (opcional)</Label>
          <Input
            id="clone-name"
            type="text"
            placeholder="Ex: Clone Página Produto X"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        {error && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">
            {error}
          </p>
        )}

        {mode === 'advanced' && (
          <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-3">
            A clonagem avançada com IA pode levar até 15 minutos. Você receberá uma notificação quando estiver pronta.
          </p>
        )}

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              {mode === 'quick' ? 'Clonando...' : 'Iniciando clonagem com IA...'}
            </>
          ) : (
            <>
              {mode === 'quick' ? <Zap className="h-4 w-4 mr-2" /> : <Sparkles className="h-4 w-4 mr-2" />}
              {mode === 'quick' ? 'Clonar Agora' : 'Iniciar Clonagem com IA'}
            </>
          )}
        </Button>
      </form>
    </div>
  )
}
