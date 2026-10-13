

import { User } from '@/app/types/User'
import jwt from 'jsonwebtoken'
import { cookies } from 'next/headers'

type props = {
    id: number,
    name: string,
    email: string,
    role: string
}

export const signUser = ({id, name, email, role}: props) => {
    try {
        const token = jwt.sign({id, name, email, role}, process.env.JWT_SECRET_KEY as string)
        return token        
    } catch (error) {
        throw error
    }
}

export const decodeUserJwt = (token: string) => {
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY as string)        
        return decoded
    } catch (error) {
        throw error
    }
}

export const addTokenToCookie = async (token: string) => {
    const cookieStore = await cookies()
    cookieStore.set("auth_token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 7,
    })
}

export const getCurrentUser = async () : Promise<User | null> => {
    const cookieStore = await cookies()
    const token = cookieStore.get("auth_token")?.value

    if (!token) return null

    try { 
        const user = decodeUserJwt(token) as unknown as User
        return user
    } catch (error) {
        return null
    }
}
