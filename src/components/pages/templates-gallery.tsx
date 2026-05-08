'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import type { Template, PageType } from '@/types'

const templates: Template[] = [
  { id: 'blank', name: 'Página em Branco', category: 'Em Branco', type: 'BLANK', thumbnail: '', gradient: 'from-gray-200 to-gray-300' },
  { id: 'pressel-frete', name: 'Pressel Pop-Up Frete', category: 'Pressel', type: 'PRESSEL', thumbnail: '', gradient: 'from-blue-400 to-blue-600', isNew: false },
  { id: 'pressel-promo', name: 'Pressel Pop-up Promoção', category: 'Pressel', type: 'PRESSEL', thumbnail: '', gradient: 'from-indigo-400 to-purple-600' },
  { id: 'pressel-press-hold', name: 'Pressel Pop-up Press & Hold', category: 'Pressel', type: 'PRESSEL', thumbnail: '', gradient: 'from-violet-400 to-violet-600' },
  { id: 'pressel-genero', name: 'Pressel Pop-up de Gênero', category: 'Pressel', type: 'PRESSEL', thumbnail: '', gradient: 'from-pink-400 to-rose-600' },
  { id: 'pressel-cupom', name: 'Pressel Pop-up Formulário com Cupom', category: 'Pressel', type: 'PRESSEL', thumbnail: '', gradient: 'from-orange-400 to-red-500' },
  { id: 'pressel-pais', name: 'Pressel Pop-up País', category: 'Pressel', type: 'PRESSEL', thumbnail: '', gradient: 'from-cyan-400 to-blue-500' },
  { id: 'pressel-captcha', name: 'Pressel Pop-up com Captcha', category: 'Pressel', type: 'PRESSEL', thumbnail: '', gradient: 'from-teal-400 to-green-500' },
  { id: 'pressel-idade', name: 'Pressel Pop-up de Idade', category: 'Pressel', type: 'PRESSEL', thumbnail: '', gradient: 'from-amber-400 to-orange-500' },
  { id: 'pressel-robusta', name: 'Pressel Robusta', category: 'Pressel', type: 'PRESSEL', thumbnail: '', gradient: 'from-blue-500 to-indigo-600' },
  { id: 'pressel-paises', name: 'Pressel Países', category: 'Pressel', type: 'PRESSEL', thumbnail: '', gradient: 'from-sky-400 to-cyan-500' },
  { id: 'pressel-cookie', name: 'Pressel Pop-up de Cookie', category: 'Pressel', type: 'PRESSEL', thumbnail: '', gradient: 'from-yellow-400 to-amber-500' },
  { id: 'pressel-cod', name: 'Pressel COD', category: 'Pressel', type: 'PRESSEL', thumbnail: '', gradient: 'from-emerald-400 to-teal-500' },
  { id: 'pressel-review', name: 'Pressel Review', category: 'Pressel', type: 'PRESSEL', thumbnail: '', gradient: 'from-fuchsia-400 to-purple-500' },
  { id: 'pressel-cookies', name: 'Pressel de Cookies', category: 'Pressel', type: 'PRESSEL', thumbnail: '', gradient: 'from-lime-400 to-green-500' },
  { id: 'pressel-fisico', name: 'Pressel Produto Físico', category: 'Pressel', type: 'PRESSEL', thumbnail: '', gradient: 'from-red-400 to-rose-500' },
  { id: 'pressel-info', name: 'Pressel Infoproduto', category: 'Pressel', type: 'PRESSEL', thumbnail: '', gradient: 'from-violet-500 to-indigo-600' },
  { id: 'sales-clean', name: 'Página de Vendas Clean', category: 'Páginas de Vendas', type: 'SALES', thumbnail: '', gradient: 'from-green-400 to-emerald-600' },
  { id: 'sales-standard', name: 'Página de Vendas', category: 'Páginas de Vendas', type: 'SALES', thumbnail: '', gradient: 'from-green-500 to-teal-600' },
  { id: 'sales-video', name: 'Página de Vendas com Vídeo', category: 'Páginas de Vendas', type: 'SALES', thumbnail: '', gradient: 'from-emerald-500 to-green-700' },
  { id: 'vsl-delay', name: 'VSL Com Delay', category: 'VSL', type: 'VSL', thumbnail: '', gradient: 'from-purple-500 to-violet-700' },
  { id: 'back-redirect', name: 'Página de Back Redirect', category: 'Back Redirect', type: 'BACK_REDIRECT', thumbnail: '', gradient: 'from-yellow-500 to-orange-600' },
  { id: 'obrigado-video', name: 'Obrigado com Vídeo', category: 'Obrigado', type: 'THANK_YOU', thumbnail: '', gradient: 'from-teal-500 to-cyan-600' },
  { id: 'quizz', name: 'Quizz', category: 'Quiz', type: 'QUIZ', thumbnail: '', gradient: 'from-pink-500 to-rose-600' },
  { id: 'termos', name: 'Termos de Uso', category: 'Termos e Políticas', type: 'TERMS', thumbnail: '', gradient: 'from-gray-400 to-slate-500' },
  { id: 'privacidade', name: 'Política de Privacidade', category: 'Termos e Políticas', type: 'TERMS', thumbnail: '', gradient: 'from-slate-400 to-gray-600' },
]

const categories = [
  'Todas',
  'Páginas de Vendas',
  'VSL',
  'Pressel',
  'Back Redirect',
  'Quiz',
  'Obrigado',
  'Termos e Políticas',
  'Em Branco',
]

interface TemplatesGalleryProps {
  onSelect: (template: Template) => void
}

export function TemplatesGallery({ onSelect }: TemplatesGalleryProps) {
  const [activeCategory, setActiveCategory] = useState('Todas')

  const filtered =
    activeCategory === 'Todas'
      ? templates
      : templates.filter((t) => t.category === activeCategory)

  return (
    <div className="space-y-4">
      {/* Category filter */}
      <div className="flex flex-wrap gap-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              activeCategory === cat
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Templates grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 max-h-[60vh] overflow-y-auto pr-1">
        {filtered.map((template) => (
          <button
            key={template.id}
            onClick={() => onSelect(template)}
            className="group text-left rounded-xl overflow-hidden border-2 border-transparent hover:border-indigo-500 transition-all shadow-sm hover:shadow-md"
          >
            {/* Thumbnail */}
            <div
              className={`h-28 bg-gradient-to-br ${template.gradient} relative flex items-center justify-center`}
            >
              <span className="text-white/20 text-6xl font-bold select-none">
                {template.name.charAt(0)}
              </span>
              {template.isNew && (
                <span className="absolute top-2 right-2 text-[10px] font-bold bg-green-500 text-white px-1.5 py-0.5 rounded">
                  NOVO
                </span>
              )}
              {template.isBeta && (
                <span className="absolute top-2 right-2 text-[10px] font-bold bg-amber-500 text-white px-1.5 py-0.5 rounded">
                  BETA
                </span>
              )}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                <span className="opacity-0 group-hover:opacity-100 transition-opacity text-white text-xs font-semibold bg-indigo-600 px-3 py-1.5 rounded-lg">
                  Usar este
                </span>
              </div>
            </div>

            {/* Info */}
            <div className="p-3 bg-white">
              <p className="text-xs font-medium text-gray-900 leading-tight line-clamp-2">
                {template.name}
              </p>
              <p className="text-[11px] text-gray-400 mt-0.5">{template.category}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
