import { hash, compare } from 'bcryptjs'

export const hashPassword = async (password: string) => {
    const salt = 12

    try {
        const hashedPassword = await hash(password, salt)
        return hashedPassword
    } catch (error) {
        console.error("error while hashing password: " + error)
        throw error
    }
}

export const verifyPassword = async (password: string, hashedPassword: string) => {
    try {
        const isMatch = await compare(password, hashedPassword)
        return isMatch
    } catch (error) {
        console.error("error while comparing passwords: " + error)
        throw error
    }
}
