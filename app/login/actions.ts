"use server";

import { addTokenToCookie, getCurrentUser, signUser } from "../helper/auth/jwt";
import { verifyPassword } from "../helper/auth/password";
import { createClient } from "../lib/supabase/server";
import jwt from 'jsonwebtoken'
import { User } from "../types/User";


type Props = {
    email: string,
    password: string
}

export const loginUser = async ({email, password} : Props) => {
    
    const supabase = await createClient()

    const { data, error } = await supabase
    .from("users")
    .select("password, email, id, name, role")
    .eq("email", email)
    .single()

    if (!data) {
        throw new Error("user doesnt exist")
    }

    if (error) {
        console.error(error)
        return
    }


    const isPasswordMatch = await verifyPassword(password, data.password)
    if (!isPasswordMatch) {
        throw new Error("incorect password")
    }
    
    const token = signUser(
        {
            id: data.id,
            name: data.name,
            email: data.email,
            role: data.role
        }
    )

    return token

}


    export const signInUser = async (email:string, password:string) => {
        try {
            const token = await loginUser({
                email: email,
                password: password
            })
            console.log(token)
            await addTokenToCookie(token as string)
            const user = await getCurrentUser() as User
            return user
        } catch (error) {
            throw error
        }
    }


