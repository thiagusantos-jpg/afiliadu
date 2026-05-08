'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Save, Trash2, ExternalLink, Globe } from 'lucide-react'
import { formatDate, getPageTypeLabel, getPageTypeColor } from '@/lib/utils'
import type { Page } from '@/types'

export default function PageSettingsPage() {
  const params = useParams()
  const router = useRouter()
  const pageId = params.id as string

  const [page, setPage] = useState<Page | null>(null)
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    async function fetchPage() {
      try {
        const res = await fetch(`/api/pages/${pageId}`)
        if (!res.ok) {
          router.push('/dashboard/pages')
          return
        }
        const data = await res.json()
        setPage(data.data)
        setName(data.data.name)
      } catch {
        router.push('/dashboard/pages')
      } finally {
        setLoading(false)
      }
    }
    fetchPage()
  }, [pageId, router])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError('')
    setSuccess('')

    try {
      const res = await fetch(`/api/pages/${pageId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      })

      if (!res.ok) {
        const data = await res.json()
        setError(data.error ?? 'Erro ao salvar.')
        return
      }

      setSuccess('Configurações salvas com sucesso!')
      setTimeout(() => setSuccess(''), 3000)
    } catch {
      setError('Erro ao salvar. Tente novamente.')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!confirm('Tem certeza que deseja excluir esta página? Esta ação não pode ser desfeita.')) return

    try {
      await fetch(`/api/pages/${pageId}`, { method: 'DELETE' })
      router.push('/dashboard/pages')
    } catch {
      setError('Erro ao excluir a página.')
    }
  }

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto space-y-4">
        <div className="h-8 bg-gray-200 rounded animate-pulse w-48" />
        <div className="h-48 bg-gray-200 rounded-xl animate-pulse" />
      </div>
    )
  }

  if (!page) return null

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Back */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" asChild className="gap-2">
          <Link href="/dashboard/pages">
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Link>
        </Button>
      </div>

      {/* Header */}
      <div className="flex items-center gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Configurações da Página</h1>
          <div className="flex items-center gap-2 mt-1">
            <span
              className={`text-xs px-2 py-0.5 rounded-full font-medium ${getPageTypeColor(page.type)}`}
            >
              {getPageTypeLabel(page.type)}
            </span>
            <span className="text-xs text-gray-400">{formatDate(page.createdAt)}</span>
          </div>
        </div>
      </div>

      {/* Alerts */}
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

      {/* Settings Form */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Informações da Página</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="name">Nome da Página</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nome da sua página"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label>URL da Página</Label>
              <div className="flex items-center gap-2">
                <div className="flex-1 flex items-center gap-2 h-10 px-3 bg-gray-50 border border-gray-200 rounded-md text-sm text-gray-500">
                  <Globe className="h-4 w-4 text-gray-400" />
                  /{page.slug}
                </div>
                <Button variant="outline" size="icon" asChild>
                  <a href={`/${page.slug}`} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </Button>
              </div>
            </div>

            {page.sourceUrl && (
              <div className="space-y-1.5">
                <Label>URL Original (Clone)</Label>
                <div className="h-10 px-3 flex items-center bg-gray-50 border border-gray-200 rounded-md text-sm text-gray-500 overflow-hidden">
                  <span className="truncate">{page.sourceUrl}</span>
                </div>
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <Button type="submit" disabled={saving} className="gap-2">
                <Save className="h-4 w-4" />
                {saving ? 'Salvando...' : 'Salvar'}
              </Button>
              <Button type="button" variant="outline" asChild>
                <Link href="/dashboard/pages">Cancelar</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border border-red-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base text-red-600">Zona de Perigo</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900">Excluir esta página</p>
              <p className="text-xs text-gray-500 mt-0.5">
                Esta ação é permanente e não pode ser desfeita.
              </p>
            </div>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDelete}
              className="gap-2 flex-shrink-0"
            >
              <Trash2 className="h-4 w-4" />
              Excluir
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
