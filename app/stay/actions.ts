"use server"

import { revalidatePath } from "next/cache"
import { getCurrentUser } from "../helper/auth/jwt"
import { createClient } from "../lib/supabase/server"
import { WEEKEND_STAY_REASONS, WeekendStayReason, getUpcomingWeekends, weekendRange } from "../types/WeekendStay"

export type WeekendStayInput = {
    weekendDate: string,
    reason: string,
    eventDate: string,
    reasonText: string,
}

export type CreateWeekendStayResult =
    | { ok: true }
    | { ok: false, error: string }

const MAX_REASON_LENGTH = 500

// Returns a result instead of throwing: errors thrown from server actions are hidden in production
export const createWeekendStay = async ({ weekendDate, reason, eventDate, reasonText }: WeekendStayInput): Promise<CreateWeekendStayResult> => {
    // The user id always comes from the session, never from the client
    const user = await getCurrentUser()
    if (!user) return { ok: false, error: "Sesija ir beigusies. Ienāc vēlreiz." }

    if (!getUpcomingWeekends().includes(weekendDate)) {
        return { ok: false, error: "Izvēlies nedēļas nogali no saraksta." }
    }
    if (!(reason in WEEKEND_STAY_REASONS)) {
        return { ok: false, error: "Izvēlies paliekšanas iemeslu." }
    }

    const { from, to } = weekendRange(weekendDate)
    if (reason === "event" && (!eventDate || eventDate < from || eventDate > to)) {
        return { ok: false, error: "Norādi pasākuma datumu šajā nedēļas nogalē." }
    }

    const text = reasonText.trim()
    if (reason === "other" && !text) {
        return { ok: false, error: "Apraksti paliekšanas iemeslu." }
    }
    if (text.length > MAX_REASON_LENGTH) {
        return { ok: false, error: `Iemesls nedrīkst būt garāks par ${MAX_REASON_LENGTH} simboliem.` }
    }

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

        const { error } = await supabase
            .from("weekend_stay_requests")
            .insert([{
                user_id: user.id,
                weekend_date: weekendDate,
                reason: reason as WeekendStayReason,
                event_date: reason === "event" ? eventDate : null,
                reason_text: reason === "other" ? text : null,
                status: "pending",
            }])

        if (error) {
            console.error(error)
            return { ok: false, error: "Neizdevās nosūtīt pieteikumu. Mēģini vēlreiz." }
        }

        revalidatePath("/stay")
        return { ok: true }
    } catch (error) {
        console.error(error)
        return { ok: false, error: "Radās neparedzēta kļūda. Mēģini vēlreiz." }
    }
}
