import { createClient } from "../lib/supabase/server"
import { monthRange } from "../types/WeekendStay"

type Supabase = Awaited<ReturnType<typeof createClient>>

// Approved stays in the month of the given Saturday; a new month starts again from 0
export const countMonthStays = async (supabase: Supabase, userId: number, saturday: string) => {
    const { from, to } = monthRange(saturday)

    const { count, error } = await supabase
        .from("weekend_stay_requests")
        .select("id", { count: "exact", head: true })
        .eq("user_id", userId)
        .eq("status", "approved")
        .gte("weekend_date", from)
        .lte("weekend_date", to)

    if (error) throw error
    return count ?? 0
}

// users.weekend_stay_count mirrors the approved stays of the current weekend's month
export const syncStayCount = async (supabase: Supabase, userId: number, saturday: string) => {
    const count = await countMonthStays(supabase, userId, saturday)

    const { error } = await supabase
        .from("users")
        .update({ weekend_stay_count: count })
        .eq("id", userId)

    if (error) throw error
}
