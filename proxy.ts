import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { AUTH_COOKIE, homePathForRole, verifySessionToken } from './app/helper/auth/token'
import { Role } from './app/types/Role'

// Pages anyone can open without logging in
const PUBLIC_PATHS = ['/login', '/apply']
// Pages only admins can open
const ADMIN_PATHS = ['/adminDashboard', '/register']

const matches = (pathname: string, paths: string[]) =>
    paths.some(path => pathname === path || pathname.startsWith(`${path}/`))

export function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl
    const user = verifySessionToken(request.cookies.get(AUTH_COOKIE)?.value)

    // Already logged in: skip the login page
    if (pathname === '/login' && user) {
        return NextResponse.redirect(new URL(homePathForRole(user.role), request.url))
    }

    if (matches(pathname, PUBLIC_PATHS)) {
        return NextResponse.next()
    }

    if (!user) {
        const response = NextResponse.redirect(new URL('/login', request.url))
        // Clear an expired or invalid token so it doesn't linger
        if (request.cookies.has(AUTH_COOKIE)) response.cookies.delete(AUTH_COOKIE)
        return response
    }

    if (matches(pathname, ADMIN_PATHS) && user.role !== Role.ADMIN) {
        return NextResponse.redirect(new URL('/', request.url))
    }

    return NextResponse.next()
}

export const config = {
    // Skip Next internals and files in public/ (anything with a file extension)
    matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)'],
}
