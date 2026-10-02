"use server";

import { createClient } from "../lib/supabase/server";

type Props = {
    email: string,
    password: string
}

export const loginUser = async ({email, password} : Props) => {
    
    const supabase = await createClient()

    const { data, error } = await supabase
    .from("users")
    .select("password")
    .single()

    if (!data) {
        throw new Error("user doesnt exist")
    }

    if (error) {
        console.error(error)
        return
    }

    if (data.password !== password) {
        throw new Error("incorect password")
    }
    


}


