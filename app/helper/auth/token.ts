import jwt from 'jsonwebtoken'
import { Role } from '../../types/Role'

// Pure JWT helpers (no next/headers), so they can be used from proxy.ts as well as server code

export const AUTH_COOKIE = "auth_token"
export const SESSION_MAX_AGE = 60 * 60 * 24 * 7 // 7 days, in seconds

export type SessionUser = {
    id: number,
    name: string,
    email: string,
    role: Role,
}

const getSecret = () => {
    const secret = process.env.JWT_SECRET_KEY
    if (!secret) {
        throw new Error("JWT_SECRET_KEY is not set in .env")
    }
    return secret
}

// Older rows store the role JSON-encoded (e.g. "\"USER\""), so strip any quotes
export const normalizeRole = (role: unknown): Role => {
    const value = String(role ?? "").replace(/"/g, "").trim().toUpperCase()
    return value === Role.ADMIN ? Role.ADMIN : Role.USER
}

export const signSessionToken = (user: SessionUser) => {
    return jwt.sign(user, getSecret(), { expiresIn: SESSION_MAX_AGE })
}

// Returns null for a missing, expired or tampered token instead of throwing
export const verifySessionToken = (token: string | undefined): SessionUser | null => {
    if (!token) return null

    try {
        const payload = jwt.verify(token, getSecret()) as Partial<SessionUser>
        if (typeof payload.id !== "number") return null

        return {
            id: payload.id,
            name: payload.name ?? "",
            email: payload.email ?? "",
            role: normalizeRole(payload.role),
        }
    } catch {
        return null
    }
}

export const homePathForRole = (role: Role) => role === Role.ADMIN ? "/adminDashboard" : "/"
