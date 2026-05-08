import { auth } from '@/lib/auth'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const PROTECTED_ROUTES = [
  '/dashboard',
  '/pages',
  '/domains',
  '/leads',
  '/player',
  '/spy',
  '/launches',
  '/affiliate',
]

export default auth((req) => {
  const { nextUrl, auth: session } = req as NextRequest & { auth: any }
  const isLoggedIn = !!session
  const { pathname } = nextUrl

  const isAuthPage = pathname.startsWith('/login') || pathname.startsWith('/register')
  const isApiAuthRoute = pathname.startsWith('/api/auth')
  const isProtected = PROTECTED_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(route + '/')
  )

  if (isApiAuthRoute) return NextResponse.next()

  if (isAuthPage) {
    if (isLoggedIn) return NextResponse.redirect(new URL('/dashboard', nextUrl))
    return NextResponse.next()
  }

  if (isProtected && !isLoggedIn) {
    const loginUrl = new URL('/login', nextUrl)
    loginUrl.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
})

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api/auth).*)'],
}
