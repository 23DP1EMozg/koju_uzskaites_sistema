"use server"

import { revalidatePath } from "next/cache"
import { getCurrentUser } from "./helper/auth/jwt"
import { createClient } from "./lib/supabase/server"
import { validateComplaint } from "./helper/validation"

export type CreateComplaintResult =
    | { ok: true }
    | { ok: false, error: string }

// Returns a result instead of throwing: errors thrown from server actions are hidden in production
export const createComplaint = async (description: string): Promise<CreateComplaintResult> => {
    const user = await getCurrentUser()
    if (!user) return { ok: false, error: "Sesija ir beigusies. Ienāc vēlreiz." }

    const validationError = validateComplaint(description)
    if (validationError) return { ok: false, error: validationError }

    const supabase = await createClient()

    const { error } = await supabase
    .from("complaints")
    .insert([
        {
            description: description.trim(),
            user_id: user.id
        }
    ])

    if (error) {
        console.error(error)
        return { ok: false, error: "Neizdevās nosūtīt sūdzību. Mēģini vēlreiz." }
    }

    return { ok: true }
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
