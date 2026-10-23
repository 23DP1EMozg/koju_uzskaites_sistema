"use server"

import { User } from '@/app/types/User'
import jwt from 'jsonwebtoken'
import { cookies } from 'next/headers'
import { Role } from '../../types/Role'
import { AUTH_COOKIE, SESSION_MAX_AGE, SessionUser, signSessionToken, verifySessionToken } from './token'

export const signUser = (user: SessionUser) => signSessionToken(user)

export const addTokenToCookie = async (token: string) => {
    const cookieStore = await cookies()
    cookieStore.set(AUTH_COOKIE, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: SESSION_MAX_AGE,
    })
}

export const removeTokenCookie = async () => {
    const cookieStore = await cookies()
    cookieStore.delete(AUTH_COOKIE)
}

// The logged-in user, or null when there is no valid session
export const getCurrentUser = async (): Promise<SessionUser | null> => {
    const cookieStore = await cookies()
    return verifySessionToken(cookieStore.get(AUTH_COOKIE)?.value)
}

// Server actions are reachable without going through proxy.ts, so admin actions check the session themselves
export const requireAdmin = async (): Promise<SessionUser> => {
    const user = await getCurrentUser()
    if (!user || user.role !== Role.ADMIN) {
        throw new Error("Unauthorized")
    }
    return user
}
