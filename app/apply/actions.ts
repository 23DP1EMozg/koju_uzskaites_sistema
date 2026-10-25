"use server";

import { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "../lib/supabase/server";
import { Application } from "./Application";

type ApplyResult = { ok: true } | { ok: false, error: string }

const GENERIC_ERROR = "Neizdevās nosūtīt pieteikumu. Mēģini vēlreiz."

export const apply = async (inputData?: Application): Promise<ApplyResult> => {
    if (!inputData?.name.trim() || !inputData.phone_number.trim()) {
        return { ok: false, error: "Lūdzu, aizpildi visus laukus." }
    }

    const isValidSocialSecurityNumber = /^\d{6}-\d{5}$/.test(inputData.social_security_number)

    if (!isValidSocialSecurityNumber) {
        return { ok: false, error: "Personas kodam jābūt formātā 000000-00000." }
    }

    const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(inputData.email)

    if (!isValidEmail) {
        return { ok: false, error: "Lūdzu, ievadi derīgu e-pasta adresi." }
    }

    const supabase = await createClient()

    const {data, error} = await supabase
    .from("users")
    .select("id")
    .eq("social_security_number", inputData.social_security_number)
    .maybeSingle()

    if (error) {
        console.error(error)
        return { ok: false, error: GENERIC_ERROR }
    }

    if (data != null) {
        return { ok: false, error: "Pieteikums ar šo personas kodu jau ir iesniegts." }
    }

    return saveApplication(supabase, inputData)
}

export const saveApplication = async (
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
