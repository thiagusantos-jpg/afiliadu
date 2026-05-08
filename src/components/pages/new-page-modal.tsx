'use client'

import { useState } from 'react'
import { Copy, Plus, ArrowLeft } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { TemplatesGallery } from './templates-gallery'
import { CloneForm } from './clone-form'
import type { Template } from '@/types'

type Step = 'choose' | 'create' | 'clone' | 'template-selected'

interface NewPageModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onPageCreated: () => void
}

export function NewPageModal({ open, onOpenChange, onPageCreated }: NewPageModalProps) {
  const [step, setStep] = useState<Step>('choose')
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null)
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState('')

  function handleClose() {
    onOpenChange(false)
    setStep('choose')
    setSelectedTemplate(null)
    setError('')
  }

  async function handleTemplateSelect(template: Template) {
    setSelectedTemplate(template)
    setCreating(true)
    setError('')
    try {
      const res = await fetch('/api/pages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: template.name,
          type: template.type,
          templateId: template.id,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? 'Erro ao criar página.')
        return
      }
      onPageCreated()
      handleClose()
    } catch {
      setError('Erro ao criar página.')
    } finally {
      setCreating(false)
    }
  }

  function handleCloneSuccess() {
    onPageCreated()
    handleClose()
  }

  const titles: Record<Step, string> = {
    choose: 'Nova Página',
    create: 'Escolher Modelo',
    clone: 'Clonar Página',
    'template-selected': 'Criar Página',
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl bg-white">
        <DialogHeader>
          <div className="flex items-center gap-3">
            {step !== 'choose' && (
              <button
                onClick={() => setStep('choose')}
                className="text-gray-400 hover:text-gray-600"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
            )}
            <DialogTitle>{titles[step]}</DialogTitle>
          </div>
        </DialogHeader>

        {step === 'choose' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-4">
            <button
              onClick={() => setStep('clone')}
              className="group p-6 rounded-xl border-2 border-dashed border-orange-300 hover:border-orange-500 bg-orange-50 hover:bg-orange-100 transition-all text-left"
            >
              <div className="h-12 w-12 rounded-xl bg-orange-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Copy className="h-6 w-6 text-white" />
              </div>
              <h3 className="font-bold text-gray-900 text-lg mb-1">Quero CLONAR</h3>
              <p className="text-gray-500 text-sm">
                Cole a URL de qualquer página e crie uma cópia em segundos com nossa tecnologia de clonagem.
              </p>
            </button>

            <button
              onClick={() => setStep('create')}
              className="group p-6 rounded-xl border-2 border-dashed border-indigo-300 hover:border-indigo-500 bg-indigo-50 hover:bg-indigo-100 transition-all text-left"
            >
              <div className="h-12 w-12 rounded-xl bg-indigo-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Plus className="h-6 w-6 text-white" />
              </div>
              <h3 className="font-bold text-gray-900 text-lg mb-1">Quero CRIAR</h3>
              <p className="text-gray-500 text-sm">
                Escolha entre dezenas de modelos prontos e personalize do zero com nosso editor visual.
              </p>
            </button>
          </div>
        )}

        {step === 'create' && (
          <div className="py-2">
            {error && (
              <p className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">
                {error}
              </p>
            )}
            {creating && (
              <div className="flex items-center justify-center py-8">
                <div className="h-8 w-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
              </div>
            )}
            {!creating && (
              <TemplatesGallery onSelect={handleTemplateSelect} />
            )}
          </div>
        )}

        {step === 'clone' && (
          <div className="py-2">
            <CloneForm onSuccess={handleCloneSuccess} />
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
