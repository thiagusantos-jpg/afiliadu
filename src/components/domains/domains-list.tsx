'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Globe, Plus, Trash2, CheckCircle, Clock, XCircle, Copy, Info } from 'lucide-react'
import { formatDate, getDomainStatusLabel, getDomainStatusColor } from '@/lib/utils'
import type { Domain } from '@/types'

const APP_DOMAIN = process.env.NEXT_PUBLIC_APP_DOMAIN ?? 'afiliadu.com'

export function DomainsList() {
  const [domains, setDomains] = useState<Domain[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [newDomain, setNewDomain] = useState('')
  const [adding, setAdding] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [copiedText, setCopiedText] = useState('')

  const fetchDomains = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/domains')
      const data = await res.json()
      setDomains(data.data ?? [])
    } catch {
      setDomains([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchDomains()
  }, [fetchDomains])

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setAdding(true)

    try {
      const res = await fetch('/api/domains', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain: newDomain.trim().toLowerCase() }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error ?? 'Erro ao adicionar domínio.')
        return
      }

      setSuccess('Domínio adicionado! Configure o DNS conforme as instruções abaixo.')
      setNewDomain('')
      fetchDomains()
    } catch {
      setError('Erro ao adicionar domínio. Tente novamente.')
    } finally {
      setAdding(false)
    }
  }

  const handleDelete = async (id: string, domain: string) => {
    if (!confirm(`Remover o domínio "${domain}"?`)) return
    try {
      await fetch(`/api/domains?id=${id}`, { method: 'DELETE' })
      fetchDomains()
    } catch (error) {
      console.error('Error deleting domain:', error)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopiedText(text)
    setTimeout(() => setCopiedText(''), 2000)
  }

  const StatusIcon = ({ status }: { status: string }) => {
    if (status === 'ACTIVE') return <CheckCircle className="h-4 w-4 text-green-500" />
    if (status === 'ERROR') return <XCircle className="h-4 w-4 text-red-500" />
    return <Clock className="h-4 w-4 text-yellow-500 animate-pulse" />
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Meus Domínios</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Conecte seus domínios próprios às suas páginas
          </p>
        </div>
        <Button onClick={() => { setShowModal(true); setError(''); setSuccess('') }} className="gap-2">
          <Plus className="h-4 w-4" />
          Adicionar Domínio
        </Button>
      </div>

      {/* DNS Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-semibold text-blue-900">Como conectar seu domínio</p>
            <p className="text-blue-700 mt-1">
              Após adicionar seu domínio, configure um registro CNAME no painel do seu provedor de DNS:
            </p>
            <div className="mt-2 bg-white/60 rounded-lg p-3 font-mono text-xs space-y-1">
              <div className="flex items-center justify-between gap-4">
                <span className="text-gray-500">Tipo:</span>
                <span className="font-semibold">CNAME</span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-gray-500">Nome:</span>
                <span className="font-semibold">@</span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-gray-500">Valor:</span>
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{APP_DOMAIN}</span>
                  <button
                    onClick={() => copyToClipboard(APP_DOMAIN)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Domain List */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="h-20 bg-gray-100 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : domains.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
          <Globe className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-gray-700">Nenhum domínio conectado</h3>
          <p className="text-sm text-gray-500 mt-1 mb-4">
            Adicione seu domínio próprio para usar com suas páginas.
          </p>
          <Button onClick={() => setShowModal(true)} size="sm" className="gap-2">
            <Plus className="h-4 w-4" />
            Adicionar Domínio
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {domains.map((domain) => (
            <Card key={domain.id} className="border-0 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
                    <Globe className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-gray-900 truncate">{domain.domain}</p>
                      <StatusIcon status={domain.status} />
                    </div>
                    <div className="flex items-center gap-3 mt-0.5">
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full font-medium ${getDomainStatusColor(domain.status)}`}
                      >
                        {getDomainStatusLabel(domain.status)}
                      </span>
                      <span className="text-xs text-gray-400">{formatDate(domain.createdAt)}</span>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-red-400 hover:text-red-600 hover:bg-red-50 flex-shrink-0"
                    onClick={() => handleDelete(domain.id, domain.domain)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add Domain Modal */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="bg-white max-w-md">
          <DialogHeader>
            <DialogTitle>Adicionar Domínio</DialogTitle>
            <DialogDescription>
              Insira o domínio que deseja conectar à plataforma.
            </DialogDescription>
          </DialogHeader>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              {error}
            </div>
          )}
          {success && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">
              {success}
            </div>
          )}

          <form onSubmit={handleAdd} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="domain">Domínio</Label>
              <Input
                id="domain"
                type="text"
                placeholder="meusite.com.br"
                value={newDomain}
                onChange={(e) => setNewDomain(e.target.value)}
                required
              />
              <p className="text-xs text-gray-500">
                Digite apenas o domínio sem https:// ou www
              </p>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-800">
              <p className="font-semibold mb-1">Configuração DNS necessária:</p>
              <p>
                Após adicionar, configure um CNAME apontando para{' '}
                <strong>{APP_DOMAIN}</strong> no painel do seu provedor de DNS.
              </p>
            </div>

            <div className="flex gap-3">
              <Button type="submit" disabled={adding} className="flex-1">
                {adding ? 'Adicionando...' : 'Adicionar Domínio'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowModal(false)}
              >
                Cancelar
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
