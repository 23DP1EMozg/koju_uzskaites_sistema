"use server"

import { revalidatePath } from "next/cache"
import { getCurrentUser } from "../helper/auth/jwt"
import { createClient } from "../lib/supabase/server"
import { AUTO_APPROVE_MONTHLY_LIMIT, WEEKEND_STAY_REASONS, WeekendStayReason, getUpcomingWeekend, weekendRange } from "../types/WeekendStay"
import { countMonthStays, syncStayCount } from "./stayCount"

export type WeekendStayInput = {
    weekendDate: string,
    reason: string,
    eventDate: string,
    reasonText: string,
}

export type CreateWeekendStayResult =
    | { ok: true, approved: boolean }
    | { ok: false, error: string }

const MAX_REASON_LENGTH = 500

// Returns a result instead of throwing: errors thrown from server actions are hidden in production
export const createWeekendStay = async ({ weekendDate, reason, eventDate, reasonText }: WeekendStayInput): Promise<CreateWeekendStayResult> => {
    // The user id always comes from the session, never from the client
    const user = await getCurrentUser()
    if (!user) return { ok: false, error: "Sesija ir beigusies. Ienāc vēlreiz." }

    if (weekendDate !== getUpcomingWeekend()) {
        return { ok: false, error: "Palikšanu var pieteikt tikai tuvākajai nedēļas nogalei. Pārlādē lapu." }
    }
    if (!(reason in WEEKEND_STAY_REASONS)) {
        return { ok: false, error: "Izvēlies palikšanas iemeslu." }
    }

    const { from, to } = weekendRange(weekendDate)
    if (reason === "event" && (!eventDate || eventDate < from || eventDate > to)) {
        return { ok: false, error: "Norādi pasākuma datumu šajā nedēļas nogalē." }
    }

    const text = reasonText.trim()
    if (reason === "other" && !text) {
        return { ok: false, error: "Apraksti palikšanas iemeslu." }
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
