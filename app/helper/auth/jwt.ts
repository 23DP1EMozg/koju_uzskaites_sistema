import jwt from 'jsonwebtoken'

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
