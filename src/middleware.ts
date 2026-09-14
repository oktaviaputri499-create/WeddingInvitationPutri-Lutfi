import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Very basic auth for /admin just to demonstrate protection
  // In production, use NextAuth.js or properly verify JWTs.
  if (request.nextUrl.pathname.startsWith('/admin')) {
    const authCookie = request.cookies.get('admin_session')
    
    // For demo purposes, we will allow access if bypassing via a query param (e.g., ?secret=demo) to make testing easier without setting up full auth flow
    // DO NOT DO THIS IN PRODUCTION
    const secret = request.nextUrl.searchParams.get('secret')
    
    if (!authCookie && secret !== 'demo123') {
      return new NextResponse('Unauthorized. Please login or append ?secret=demo123 to URL for demo access.', { status: 401 })
    }
  }
  return NextResponse.next()
}
