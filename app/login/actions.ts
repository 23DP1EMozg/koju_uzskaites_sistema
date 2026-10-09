"use server";

import { signUser } from "../helper/auth/jwt";
import { verifyPassword } from "../helper/auth/password";
import { createClient } from "../lib/supabase/server";
import jwt from 'jsonwebtoken'


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


