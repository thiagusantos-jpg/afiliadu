'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Users, Download, Trash2, Link2, Mail, Phone, Calendar } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import type { Lead } from '@/types'

interface LeadWithPage extends Lead {
  page?: { name: string } | null
}

export function LeadsTable() {
  const [leads, setLeads] = useState<LeadWithPage[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [showIntegrations, setShowIntegrations] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const fetchLeads = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/leads?page=${currentPage}&limit=20`)
      const data = await res.json()
      setLeads(data.data ?? [])
      setTotalPages(data.pagination?.totalPages ?? 1)
      setTotal(data.pagination?.total ?? 0)
    } catch {
      setLeads([])
    } finally {
      setLoading(false)
    }
  }, [currentPage])

  useEffect(() => {
    fetchLeads()
  }, [fetchLeads])

  const toggleSelect = (id: string) => {
    const newSelected = new Set(selected)
    if (newSelected.has(id)) {
      newSelected.delete(id)
    } else {
      newSelected.add(id)
    }
    setSelected(newSelected)
  }

  const toggleSelectAll = () => {
    if (selected.size === leads.length) {
      setSelected(new Set())
    } else {
      setSelected(new Set(leads.map((l) => l.id)))
    }
  }

  const handleDeleteSelected = async () => {
    if (selected.size === 0) return
    if (!confirm(`Excluir ${selected.size} lead(s) selecionado(s)?`)) return

    setDeleting(true)
    try {
      await fetch('/api/leads', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: Array.from(selected) }),
      })
      setSelected(new Set())
      fetchLeads()
    } catch (error) {
      console.error('Error deleting leads:', error)
    } finally {
      setDeleting(false)
    }
  }

  const handleExport = () => {
    window.open('/api/leads?format=csv', '_blank')
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Meus Leads</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {total} lead{total !== 1 ? 's' : ''} capturado{total !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowIntegrations(true)}
            className="gap-2 hidden sm:flex"
          >
            <Link2 className="h-4 w-4" />
            Integrações
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
            className="gap-2"
          >
            <Download className="h-4 w-4" />
            Exportar Leads
          </Button>
          {selected.size > 0 && (
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDeleteSelected}
              disabled={deleting}
              className="gap-2"
            >
              <Trash2 className="h-4 w-4" />
              Excluir ({selected.size})
            </Button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="h-8 w-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-sm text-gray-500 mt-2">Carregando leads...</p>
          </div>
        ) : leads.length === 0 ? (
          <div className="p-12 text-center">
            <Users className="h-12 w-12 text-gray-200 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-gray-700">Nenhum lead ainda</h3>
            <p className="text-sm text-gray-500 mt-1">
              Seus leads aparecerão aqui quando capturados pelas suas páginas.
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className="w-12">
                  <Checkbox
                    checked={selected.size === leads.length && leads.length > 0}
                    onCheckedChange={toggleSelectAll}
                  />
                </TableHead>
                <TableHead>Nome</TableHead>
                <TableHead>Contato</TableHead>
                <TableHead>Origem</TableHead>
                <TableHead>Data/Hora</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {leads.map((lead) => (
                <TableRow
                  key={lead.id}
                  className={selected.has(lead.id) ? 'bg-indigo-50' : ''}
                >
                  <TableCell>
                    <Checkbox
                      checked={selected.has(lead.id)}
                      onCheckedChange={() => toggleSelect(lead.id)}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
                        <span className="text-xs font-semibold text-indigo-700">
                          {(lead.name ?? lead.email ?? '?')[0].toUpperCase()}
                        </span>
                      </div>
                      <span className="font-medium text-gray-900 text-sm">
                        {lead.name ?? <span className="text-gray-400 italic">Sem nome</span>}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-0.5">
                      {lead.email && (
                        <div className="flex items-center gap-1.5 text-sm text-gray-600">
                          <Mail className="h-3.5 w-3.5 text-gray-400" />
                          <a
                            href={`mailto:${lead.email}`}
                            className="hover:text-indigo-600 hover:underline"
                          >
                            {lead.email}
                          </a>
                        </div>
                      )}
                      {lead.phone && (
                        <div className="flex items-center gap-1.5 text-sm text-gray-600">
                          <Phone className="h-3.5 w-3.5 text-gray-400" />
                          <a
                            href={`https://wa.me/${lead.phone.replace(/\D/g, '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:text-green-600 hover:underline"
                          >
                            {lead.phone}
                          </a>
                        </div>
                      )}
                      {!lead.email && !lead.phone && (
                        <span className="text-gray-400 text-sm italic">Sem contato</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-gray-600">
                      {lead.page?.name ?? lead.source ?? (
                        <span className="text-gray-400 italic">Desconhecida</span>
                      )}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5 text-sm text-gray-500">
                      <Calendar className="h-3.5 w-3.5" />
                      {formatDate(lead.createdAt)}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            Anterior
          </Button>
          <span className="text-sm text-gray-600">
            {currentPage} de {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
          >
            Próxima
          </Button>
        </div>
      )}

      {/* Integrations Modal */}
      <Dialog open={showIntegrations} onOpenChange={setShowIntegrations}>
        <DialogContent className="bg-white max-w-md">
          <DialogHeader>
            <DialogTitle>Integrações</DialogTitle>
            <DialogDescription>
              Conecte seus leads com outras plataformas de email marketing.
            </DialogDescription>
          </DialogHeader>
          <div className="py-6 text-center">
            <div className="h-16 w-16 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Link2 className="h-8 w-8 text-indigo-600" />
            </div>
            <h3 className="text-base font-semibold text-gray-900 mb-2">Em breve!</h3>
            <p className="text-sm text-gray-500">
              As integrações com plataformas como ActiveCampaign, Mailchimp e outras estarão disponíveis em breve.
            </p>
            <Button
              className="mt-4"
              variant="outline"
              onClick={() => setShowIntegrations(false)}
            >
              Fechar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
