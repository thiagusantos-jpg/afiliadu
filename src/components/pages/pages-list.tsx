'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Settings, Pencil, Copy, Trash2, Globe, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { NewPageModal } from './new-page-modal'
import { formatDate, getPageTypeLabel, getPageTypeColor } from '@/lib/utils'
import type { Page } from '@/types'

const PAGE_TABS = [
  { key: 'all', label: 'Todas' },
  { key: 'CLONE', label: 'Clones' },
  { key: 'SALES', label: 'Páginas de Vendas' },
  { key: 'VSL', label: 'VSL' },
  { key: 'PRESSEL', label: 'Pressel' },
  { key: 'BACK_REDIRECT', label: 'Back Redirect' },
  { key: 'QUIZ', label: 'Quizz' },
  { key: 'THANK_YOU', label: 'Obrigado' },
  { key: 'TERMS', label: 'Termos' },
  { key: 'BLANK', label: 'Em Branco' },
]

export function PagesList() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('all')
  const [pages, setPages] = useState<Page[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const fetchPages = useCallback(async () => {
    setLoading(true)
    try {
      const params = activeTab !== 'all' ? `?type=${activeTab}` : ''
      const res = await fetch(`/api/pages${params}`)
      const data = await res.json()
      setPages(data.data ?? [])
    } catch {
      setPages([])
    } finally {
      setLoading(false)
    }
  }, [activeTab])

  useEffect(() => {
    fetchPages()
  }, [fetchPages])

  async function handleDuplicate(page: Page) {
    try {
      await fetch('/api/pages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: `${page.name} (Cópia)`,
          type: page.type,
          templateId: page.templateId,
          htmlContent: page.htmlContent,
        }),
      })
      fetchPages()
    } catch {
      // silent
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Tem certeza que deseja excluir esta página?')) return
    setDeletingId(id)
    try {
      await fetch(`/api/pages/${id}`, { method: 'DELETE' })
      setPages((prev) => prev.filter((p) => p.id !== id))
    } catch {
      // silent
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Minhas Páginas</h1>
          <p className="text-gray-500 text-sm mt-1">Gerencie todas as suas páginas criadas.</p>
        </div>
        <Button onClick={() => setModalOpen(true)} className="shrink-0">
          <Plus className="h-4 w-4 mr-2" />
          Nova Página
        </Button>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <div className="flex gap-1 overflow-x-auto pb-px">
          {PAGE_TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`whitespace-nowrap px-3 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.key
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="h-8 w-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : pages.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-dashed border-gray-300">
          <Globe className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <h3 className="font-semibold text-gray-900 mb-1">Nenhuma página encontrada</h3>
          <p className="text-gray-500 text-sm mb-4">
            Crie sua primeira página ou clone uma existente.
          </p>
          <Button onClick={() => setModalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Nova Página
          </Button>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Página
                </th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                  Tipo
                </th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">
                  Criado em
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {pages.map((page) => (
                <tr key={page.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium text-gray-900">{page.name}</p>
                      <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                        <Globe className="h-3 w-3" />
                        /{page.slug}
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-4 hidden sm:table-cell">
                    <Badge className={getPageTypeColor(page.type)}>
                      {getPageTypeLabel(page.type)}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 hidden md:table-cell">
                    <span className="text-sm text-gray-500">{formatDate(page.createdAt)}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        title="Configurações"
                        onClick={() => router.push(`/pages/${page.id}/settings`)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                      >
                        <Settings className="h-4 w-4" />
                      </button>
                      <button
                        title="Personalizar"
                        onClick={() => router.push(`/pages/${page.id}/settings`)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        title="Duplicar"
                        onClick={() => handleDuplicate(page)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                      >
                        <Copy className="h-4 w-4" />
                      </button>
                      <button
                        title="Excluir"
                        onClick={() => handleDelete(page.id)}
                        disabled={deletingId === page.id}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <NewPageModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        onPageCreated={fetchPages}
      />
    </div>
  )
}
