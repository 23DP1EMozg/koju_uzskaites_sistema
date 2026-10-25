export type WeekendStayReason = "distance" | "work" | "event" | "other"
export type WeekendStayStatus = "pending" | "approved" | "rejected"

// One row of the weekend_stay_requests table
export type WeekendStay = {
    id?: number,
    created_at?: string,
    user_id?: number,
    weekend_date?: string, // Saturday of the weekend, YYYY-MM-DD
    reason?: WeekendStayReason,
    event_date?: string | null, // only for "event"
    reason_text?: string | null, // only for "other"
    status?: WeekendStayStatus,
}

export const WEEKEND_STAY_REASONS: Record<WeekendStayReason, string> = {
    distance: "Liels attālums līdz mājām",
    work: "Darbs",
    event: "Pasākums",
    other: "Cits iemesls",
}

export const WEEKEND_STAY_STATUSES: Record<WeekendStayStatus, string> = {
    pending: "Gaida apstiprinājumu",
    approved: "Apstiprināts",
    rejected: "Noraidīts",
}

// Distance stays are approved automatically while the tenant has fewer approved stays than this in the month
export const AUTO_APPROVE_MONTHLY_LIMIT = 3

const rigaToday = () => new Date(new Date().toLocaleDateString("sv-SE", { timeZone: "Europe/Riga" }))

const addDays = (date: string, days: number) => {
    const d = new Date(date)
    d.setUTCDate(d.getUTCDate() + days)
    return d.toISOString().slice(0, 10)
}

// Saturday of the upcoming weekend (today counts if it is Saturday), YYYY-MM-DD; stays can only be requested for it
export const getUpcomingWeekend = (): string => {
    const saturday = rigaToday()
    saturday.setUTCDate(saturday.getUTCDate() + (6 - saturday.getUTCDay() + 7) % 7)
    return saturday.toISOString().slice(0, 10)
}

// A stay counts towards the month of its Saturday; first and last day of that month, YYYY-MM-DD
export const monthRange = (saturday: string) => {
    const from = `${saturday.slice(0, 7)}-01`
    const next = new Date(from)
    next.setUTCMonth(next.getUTCMonth() + 1)
    return { from, to: addDays(next.toISOString().slice(0, 10), -1) }
}

// Friday to Sunday around a weekend's Saturday; an event date must fall inside it
export const weekendRange = (saturday: string) => ({ from: addDays(saturday, -1), to: addDays(saturday, 1) })

const formatDay = (date: string, options: Intl.DateTimeFormatOptions) =>
    new Date(date).toLocaleDateString("lv-LV", { timeZone: "UTC", ...options })

// "31. okt. – 1. nov."
export const formatWeekend = (saturday: string) =>
    `${formatDay(saturday, { day: "numeric", month: "short" })} – ${formatDay(addDays(saturday, 1), { day: "numeric", month: "short" })}`

// "sestdiena, 31. oktobris"
export const formatStayDate = (date: string) => formatDay(date, { weekday: "long", day: "numeric", month: "long" })
