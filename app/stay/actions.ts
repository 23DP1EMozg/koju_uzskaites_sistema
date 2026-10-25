"use server"

import { revalidatePath } from "next/cache"
import { getCurrentUser } from "../helper/auth/jwt"
import { createClient } from "../lib/supabase/server"
import { AUTO_APPROVE_MONTHLY_LIMIT, WeekendStayReason, getUpcomingWeekend } from "../types/WeekendStay"
import { WeekendStayFields, firstError, validateWeekendStay } from "../helper/validation"
import { countMonthStays, syncStayCount } from "./stayCount"

export type WeekendStayInput = WeekendStayFields

export type CreateWeekendStayResult =
    | { ok: true, approved: boolean }
    | { ok: false, error: string }

// Returns a result instead of throwing: errors thrown from server actions are hidden in production
export const createWeekendStay = async (input: WeekendStayInput): Promise<CreateWeekendStayResult> => {
    const { weekendDate, reason, eventDate, reasonText } = input ?? {}

    // The user id always comes from the session, never from the client
    const user = await getCurrentUser()
    if (!user) return { ok: false, error: "Sesija ir beigusies. Ienāc vēlreiz." }

    if (weekendDate !== getUpcomingWeekend()) {
        return { ok: false, error: "Palikšanu var pieteikt tikai tuvākajai nedēļas nogalei. Pārlādē lapu." }
    }

    const validationError = firstError(validateWeekendStay({ weekendDate, reason, eventDate, reasonText }))
    if (validationError) {
        return { ok: false, error: validationError }
    }

    const text = typeof reasonText === "string" ? reasonText.trim() : ""

    try {
        const supabase = await createClient()

        // One request per weekend; a rejected one can be sent again
        const { data: existing, error: existingError } = await supabase
            .from("weekend_stay_requests")
            .select("id")
            .eq("user_id", user.id)
            .eq("weekend_date", weekendDate)
            .neq("status", "rejected")
            .limit(1)

        if (existingError) {
            console.error(existingError)
            return { ok: false, error: "Neizdevās sazināties ar serveri. Mēģini vēlreiz." }
        }
        if (existing.length > 0) {
            return { ok: false, error: "Šai nedēļas nogalei tu jau esi pieteicies." }
        }

        // Distance stays are approved right away for the first 3 stays of the month; the rest wait for the admin
        const approved = reason === "distance"
            && await countMonthStays(supabase, user.id, weekendDate) < AUTO_APPROVE_MONTHLY_LIMIT

        const { error } = await supabase
            .from("weekend_stay_requests")
            .insert([{
                user_id: user.id,
                weekend_date: weekendDate,
                reason: reason as WeekendStayReason,
                event_date: reason === "event" ? eventDate : null,
                reason_text: reason === "other" ? text : null,
                status: approved ? "approved" : "pending",
            }])

        if (error) {
            console.error(error)
            return { ok: false, error: "Neizdevās nosūtīt pieteikumu. Mēģini vēlreiz." }
        }

        if (approved) await syncStayCount(supabase, user.id, weekendDate)

        revalidatePath("/stay")
        return { ok: true, approved }
    } catch (error) {
        console.error(error)
        return { ok: false, error: "Radās neparedzēta kļūda. Mēģini vēlreiz." }
    }
}
