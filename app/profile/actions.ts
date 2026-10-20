"use server"

import { getCurrentUser } from "../helper/auth/jwt"
import { hashPassword, verifyPassword } from "../helper/auth/password"
import { createClient } from "../lib/supabase/server"
import { MIN_PASSWORD_LENGTH } from "./passwordRules"

export type ChangePasswordResult =
    | { ok: true }
    | { ok: false, error: string }

// Returns a result instead of throwing: errors thrown from server actions are hidden in production
export const changePassword = async (currentPassword: string, newPassword: string, confirmPassword: string): Promise<ChangePasswordResult> => {
    // The user id always comes from the session, never from the client
    const user = await getCurrentUser()
    if (!user) return { ok: false, error: "Sesija ir beigusies. Ienāc vēlreiz." }

    if (!currentPassword || !newPassword || !confirmPassword) {
        return { ok: false, error: "Aizpildi visus laukus." }
    }
    if (newPassword.length < MIN_PASSWORD_LENGTH) {
        return { ok: false, error: `Jaunajai parolei jābūt vismaz ${MIN_PASSWORD_LENGTH} simbolus garai.` }
    }
    if (newPassword !== confirmPassword) {
        return { ok: false, error: "Jaunās paroles nesakrīt." }
    }
    if (newPassword === currentPassword) {
        return { ok: false, error: "Jaunajai parolei jāatšķiras no pašreizējās." }
    }

    try {
        const supabase = await createClient()

        const { data, error } = await supabase
            .from("users")
            .select("password")
            .eq("id", user.id)
            .maybeSingle()

        if (error) {
            console.error(error)
            return { ok: false, error: "Neizdevās sazināties ar serveri. Mēģini vēlreiz." }
        }

        if (!data?.password || !(await verifyPassword(currentPassword, data.password))) {
            return { ok: false, error: "Pašreizējā parole nav pareiza." }
        }

        const { error: updateError } = await supabase
            .from("users")
            .update({ password: await hashPassword(newPassword) })
            .eq("id", user.id)

        if (updateError) {
            console.error(updateError)
            return { ok: false, error: "Neizdevās saglabāt jauno paroli. Mēģini vēlreiz." }
        }

        return { ok: true }
    } catch (error) {
        console.error(error)
        return { ok: false, error: "Radās neparedzēta kļūda. Mēģini vēlreiz." }
    }
}
