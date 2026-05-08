import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d)
}

export function formatDateShort(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(d)
}

export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
    + '-' + Math.random().toString(36).substring(2, 8)
}

export function getPageTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    BLANK: 'Em Branco',
    SALES: 'Página de Vendas',
    VSL: 'VSL',
    PRESSEL: 'Pressel',
    BACK_REDIRECT: 'Back Redirect',
    QUIZ: 'Quiz',
    THANK_YOU: 'Obrigado',
    TERMS: 'Termos',
    CLONE: 'Clone',
  }
  return labels[type] || type
}

export function getPageTypeColor(type: string): string {
  const colors: Record<string, string> = {
    BLANK: 'bg-gray-100 text-gray-700',
    SALES: 'bg-green-100 text-green-700',
    VSL: 'bg-purple-100 text-purple-700',
    PRESSEL: 'bg-blue-100 text-blue-700',
    BACK_REDIRECT: 'bg-yellow-100 text-yellow-700',
    QUIZ: 'bg-pink-100 text-pink-700',
    THANK_YOU: 'bg-teal-100 text-teal-700',
    TERMS: 'bg-gray-100 text-gray-600',
    CLONE: 'bg-orange-100 text-orange-700',
  }
  return colors[type] || 'bg-gray-100 text-gray-700'
}

export function getDomainStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    PENDING: 'Verificando',
    ACTIVE: 'Ativo',
    ERROR: 'Erro',
  }
  return labels[status] || status
}

export function getDomainStatusColor(status: string): string {
  const colors: Record<string, string> = {
    PENDING: 'bg-yellow-100 text-yellow-700',
    ACTIVE: 'bg-green-100 text-green-700',
    ERROR: 'bg-red-100 text-red-700',
  }
  return colors[status] || 'bg-gray-100 text-gray-700'
}
