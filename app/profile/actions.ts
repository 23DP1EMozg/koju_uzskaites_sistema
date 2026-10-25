"use server"

import { getCurrentUser } from "../helper/auth/jwt"
import { hashPassword, verifyPassword } from "../helper/auth/password"
import { createClient } from "../lib/supabase/server"
import { stopPasswordReminders } from "../notifications/passwordReminder"
import { firstError, validatePasswordChange } from "../helper/validation"

export type ChangePasswordResult =
    | { ok: true }
    | { ok: false, error: string }

// Returns a result instead of throwing: errors thrown from server actions are hidden in production
export const changePassword = async (currentPassword: string, newPassword: string, confirmPassword: string): Promise<ChangePasswordResult> => {
    // The user id always comes from the session, never from the client
    const user = await getCurrentUser()
    if (!user) return { ok: false, error: "Sesija ir beigusies. Ienāc vēlreiz." }

    const validationError = firstError(validatePasswordChange({ current: currentPassword, next: newPassword, confirm: confirmPassword }))
    if (validationError) {
        return { ok: false, error: validationError }
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

        // The password is already saved, so a failure here only means one more reminder
        await stopPasswordReminders(user.id).catch(console.error)

        return { ok: true }
    } catch (error) {
        console.error(error)
        return { ok: false, error: "Radās neparedzēta kļūda. Mēģini vēlreiz." }
    }
}
