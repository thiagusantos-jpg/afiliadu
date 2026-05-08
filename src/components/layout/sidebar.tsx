'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutGrid,
  Globe,
  Play,
  Eye,
  Users,
  Megaphone,
  Rocket,
  X,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const navSections = [
  {
    title: 'PÁGINAS',
    items: [
      { label: 'Minhas Páginas', href: '/pages', icon: LayoutGrid },
    ],
  },
  {
    title: 'DOMÍNIOS',
    items: [
      { label: 'Meus Domínios', href: '/domains', icon: Globe },
    ],
  },
  {
    title: 'AFILIADU PLAYER',
    items: [
      { label: 'Meus Vídeos', href: '/player', icon: Play },
    ],
  },
  {
    title: 'AFILIADU SPY',
    items: [
      { label: 'Espionar Anúncios', href: '/spy', icon: Eye },
      { label: 'Pesquisa Google', href: '/spy', icon: Eye, badge: 'BETA' },
    ],
  },
  {
    title: 'LEADS',
    items: [
      { label: 'Meus Leads', href: '/leads', icon: Users },
    ],
  },
  {
    title: 'LANÇAMENTOS',
    items: [
      { label: 'Novidades', href: '/launches', icon: Rocket },
    ],
  },
  {
    title: 'PROGRAMA DE AFILIADOS',
    items: [
      { label: 'Promova e Ganhe', href: '/affiliate', icon: Megaphone },
    ],
  },
]

interface SidebarProps {
  open: boolean
  onClose: () => void
}

export function Sidebar({ open, onClose }: SidebarProps) {
  const pathname = usePathname()

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-0 z-50 h-full w-64 bg-slate-900 flex flex-col transition-transform duration-300 lg:translate-x-0 lg:static lg:z-auto',
          open ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-700">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center">
              <span className="text-white font-bold text-sm">A</span>
            </div>
            <span className="text-white font-bold text-lg tracking-tight">AFILIADU</span>
          </Link>
          <button
            onClick={onClose}
            className="lg:hidden text-slate-400 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-3">
          {navSections.map((section) => (
            <div key={section.title} className="mb-4">
              <p className="px-3 mb-1 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                {section.title}
              </p>
              {section.items.map((item) => {
                const Icon = item.icon
                const isActive =
                  pathname === item.href ||
                  pathname.startsWith(item.href + '/')
                return (
                  <Link
                    key={item.href + item.label}
                    href={item.href}
                    onClick={onClose}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors mb-0.5',
                      isActive
                        ? 'bg-indigo-600 text-white'
                        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                    )}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    <span className="flex-1">{item.label}</span>
                    {item.badge && (
                      <span className="text-[10px] font-bold bg-indigo-500 text-white px-1.5 py-0.5 rounded">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                )
              })}
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="px-3 pb-4 border-t border-slate-700 pt-3">
          <p className="text-xs text-slate-500 text-center">Afiliadu © 2025</p>
        </div>
      </aside>
    </>
  )
}
