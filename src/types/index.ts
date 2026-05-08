export type PageType =
  | 'BLANK'
  | 'SALES'
  | 'VSL'
  | 'PRESSEL'
  | 'BACK_REDIRECT'
  | 'QUIZ'
  | 'THANK_YOU'
  | 'TERMS'
  | 'CLONE'

export type DomainStatus = 'PENDING' | 'ACTIVE' | 'ERROR'

export interface User {
  id: string
  name: string | null
  email: string
  image: string | null
  createdAt: Date
  updatedAt: Date
}

export interface Page {
  id: string
  name: string
  slug: string
  type: PageType
  status: string
  htmlContent: string | null
  sourceUrl: string | null
  cloneMode: string | null
  templateId: string | null
  userId: string
  createdAt: Date
  updatedAt: Date
}

export interface Domain {
  id: string
  domain: string
  status: DomainStatus
  userId: string
  createdAt: Date
  updatedAt: Date
}

export interface Lead {
  id: string
  name: string | null
  email: string | null
  phone: string | null
  source: string | null
  pageId: string | null
  userId: string
  createdAt: Date
}

export interface Template {
  id: string
  name: string
  category: string
  type: PageType
  thumbnail: string
  gradient: string
  isNew?: boolean
  isBeta?: boolean
}

export interface NavItem {
  label: string
  href: string
  icon: string
  badge?: string
}

export interface NavSection {
  title: string
  items: NavItem[]
}

export type CloneMode = 'quick' | 'advanced'

export interface CloneRequest {
  url: string
  mode: CloneMode
  name: string
}

export interface ApiResponse<T = unknown> {
  data?: T
  error?: string
  message?: string
}
