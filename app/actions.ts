"use server"

import { revalidatePath } from "next/cache"
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

// The student marks their laundry change as done today; the id always comes from the session
export const markLaundryDone = async () => {
    const user = await getCurrentUser()
    if (!user) throw new Error("user not logged in")

    const supabase = await createClient()
    const { error } = await supabase
    .from("users")
    .update({ last_laundry_date: new Date().toLocaleDateString("sv-SE", { timeZone: "Europe/Riga" }) })
    .eq("id", user.id)

    if (error) throw error

    // Re-render the dashboard so the widget shows the new date
    revalidatePath("/")
}
