"use server";

import { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "../lib/supabase/server";
import { Application } from "./Application";
import { firstError, normalizeName, validateApplication } from "../helper/validation";

type ApplyResult = { ok: true } | { ok: false, error: string }

const GENERIC_ERROR = "Neizdevās nosūtīt pieteikumu. Mēģini vēlreiz."

export const apply = async (inputData?: Application): Promise<ApplyResult> => {
    if (!inputData) {
        return { ok: false, error: "Lūdzu, aizpildi visus laukus." }
    }

    const validationError = firstError(validateApplication(inputData))
    if (validationError) {
        return { ok: false, error: validationError }
    }

    const application: Application = {
        id: null,
        name: normalizeName(inputData.name),
        social_security_number: inputData.social_security_number.trim(),
        email: inputData.email.trim(),
        phone_number: inputData.phone_number.trim(),
    }

    const supabase = await createClient()

    const [ssnMatch, emailMatch] = await Promise.all([
        supabase.from("users").select("id").eq("social_security_number", application.social_security_number).limit(1),
        // Case-insensitive, with LIKE wildcards escaped so they match literally
        supabase.from("users").select("id").ilike("email", application.email.replace(/[\\%_]/g, "\\$&")).limit(1),
    ])

    if (ssnMatch.error || emailMatch.error) {
        console.error(ssnMatch.error ?? emailMatch.error)
        return { ok: false, error: GENERIC_ERROR }
    }

    if (ssnMatch.data.length > 0) {
        return { ok: false, error: "Pieteikums ar šo personas kodu jau ir iesniegts." }
    }
    if (emailMatch.data.length > 0) {
        return { ok: false, error: "Šis e-pasts jau tiek izmantots citā pieteikumā." }
    }

    return saveApplication(supabase, application)
}

const saveApplication = async (
    supabase: SupabaseClient, application: Application
): Promise<ApplyResult> => {

    const { id, ...userData } = application;

    const { error } = await supabase
    .from("users")
    .insert([
        userData
    ])

    if (error) {
        console.error(error)
        return { ok: false, error: GENERIC_ERROR }
    }

    return { ok: true }
}
