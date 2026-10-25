"use server";

import { redirect } from "next/navigation";
import { addTokenToCookie, removeTokenCookie, signUser } from "../helper/auth/jwt";
import { homePathForRole, normalizeRole } from "../helper/auth/token";
import { verifyPassword } from "../helper/auth/password";
import { createClient } from "../lib/supabase/server";
import { firstError, validateLogin } from "../helper/validation";

export type LoginResult =
    | { ok: true, redirectTo: string }
    | { ok: false, error: string }

const INVALID_CREDENTIALS = "Nepareizs personas kods vai parole."

// Returns a result instead of throwing: errors thrown from server actions are hidden in production
export const signInUser = async (socialSecurityNumber: string, password: string): Promise<LoginResult> => {
    const validationError = firstError(validateLogin({ socialSecurityNumber, password }))
    if (validationError) {
        return { ok: false, error: validationError }
    }

    const ssn = socialSecurityNumber.trim()

    try {
        const supabase = await createClient()

        const { data, error } = await supabase
            .from("users")
            .select("id, name, email, role, password")
            .eq("social_security_number", ssn)
            .maybeSingle()

        if (error) {
            console.error(error)
            return { ok: false, error: "Neizdevās sazināties ar serveri. Mēģini vēlreiz." }
        }

        // No user, or an application that hasn't been approved yet (no password)
        if (!data?.password) {
            return { ok: false, error: INVALID_CREDENTIALS }
        }

        const isPasswordMatch = await verifyPassword(password, data.password)
        if (!isPasswordMatch) {
            return { ok: false, error: INVALID_CREDENTIALS }
        }

        const role = normalizeRole(data.role)
        const token = signUser({
            id: data.id,
            name: data.name,
            email: data.email,
            role,
        })

        await addTokenToCookie(token)

        return { ok: true, redirectTo: homePathForRole(role) }
    } catch (error) {
        console.error(error)
        return { ok: false, error: "Radās neparedzēta kļūda. Mēģini vēlreiz." }
    }
}

export const logoutUser = async () => {
    await removeTokenCookie()
    redirect("/login")
}
