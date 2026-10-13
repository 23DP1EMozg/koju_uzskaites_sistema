"use server"

import { getCurrentUser } from "./helper/auth/jwt"
import { createClient } from "./lib/supabase/server"
import { Complaint } from "./types/Complaint"

export const createComplaint = async (description:string) => {
    const supabase = await createClient()
    const user = await getCurrentUser()

    if (!user) throw new Error("user not logged in")
    
    const { error } = await supabase
    .from("complaints")
    .insert([
        {
            description: description,
            user_id: user.id        
        }
    ])

    if (error) {
        throw error
    }

}
