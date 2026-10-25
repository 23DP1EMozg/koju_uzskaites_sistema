"use server"
import { randomInt } from "crypto"
import { ANNOUNCEMENT_CATEGORY, validateAnnouncement } from "./announcement"
import { Application } from "../apply/Application"
import { createClient } from "../lib/supabase/server"
import { Role } from "../types/Role"
import { User } from "../types/User"
import { hashPassword } from '../helper/auth/password'
import { sendEmail } from "../helper/mailer"
import { requireAdmin } from "../helper/auth/jwt"
import { Complaint } from "../types/Complaint"
import { Notification } from "../types/Notification"
import { OverdueTenant } from "../types/OverdueTenant"
import { WeekendStay, WeekendStayStatus } from "../types/WeekendStay"
import { countMonthStays, syncStayCount } from "../stay/stayCount"
import { firstError, normalizeCourse, normalizeName, validateTenant } from "../helper/validation"

export const getUserApplications = async () : Promise<Application[]> => {
    await requireAdmin()

    const supabase = await createClient()

    const {data, error} = await supabase
    .from("users")
    .select("social_security_number, email, phone_number, name, id")
    .is("course", null)
    // Approved users (and admins) have a password; applications don't
    .is("password", null)

    if (error) {
        throw error
    }

    return data
}


// No look-alike characters (0/O, 1/l/I), since the password is typed from an email
const PASSWORD_ALPHABET = "abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789"
const TEMPORARY_PASSWORD_LENGTH = 10

const generateTemporaryPassword = () =>
    Array.from({ length: TEMPORARY_PASSWORD_LENGTH }, () => PASSWORD_ALPHABET[randomInt(PASSWORD_ALPHABET.length)]).join("")

export type AcceptApplicationResult =
    | { ok: true }
    | { ok: false, error: string }

export const acceptAndEditApplication = async (u: User): Promise<AcceptApplicationResult> => {
    await requireAdmin()

    const fields = {
        name: u?.name ?? "",
        social_security_number: u?.social_security_number ?? "",
        course: u?.course ?? "",
        room_number: u?.room_number,
        phone_number: u?.phone_number ?? "",
        email: u?.email ?? "",
    }
    if (!Number.isInteger(u?.id)) return { ok: false, error: "Pieteikums nav atrasts." }
    const validationError = firstError(validateTenant(fields))
    if (validationError) return { ok: false, error: validationError }

    const supabase = await createClient()

    // The personal code is the login, so it must stay unique even after the admin edits it
    const { data: duplicate, error: duplicateError } = await supabase
    .from("users")
    .select("id")
    .eq("social_security_number", fields.social_security_number.trim())
    .neq("id", u.id)
    .limit(1)

    if (duplicateError) {
        console.error(duplicateError)
        return { ok: false, error: "Neizdevās saglabāt pieteikumu. Mēģini vēlreiz." }
    }
    if (duplicate.length > 0) return { ok: false, error: "Lietotājs ar šo personas kodu jau eksistē." }

    const generatedPassword = generateTemporaryPassword()
    const hashedPassword = await hashPassword(generatedPassword)


    const { data: accepted, error } = await supabase
    .from("users")
    .update({
        // Only the edited fields are copied, so the client can't set the role or other columns
        name: normalizeName(fields.name),
        social_security_number: fields.social_security_number.trim(),
        course: normalizeCourse(fields.course),
        room_number: Number(fields.room_number),
        phone_number: fields.phone_number.trim(),
        email: fields.email.trim(),
        password: hashedPassword,
        role: JSON.stringify(Role.USER),
        last_laundry_date: new Date().toISOString(),
        next_kitchen_cleaning_date: null,
        weekend_stay_count: 0,
    })
    .eq("id", u.id)
    // Only an application (no password yet) can be accepted, never an existing account
    .is("password", null)
    .select("id")

    if (error) {
        console.error(error)
        // 23505: unique violation, e.g. another user already has this personal code
        return { ok: false, error: error.code === "23505" ? "Lietotājs ar šiem datiem jau eksistē." : "Neizdevās saglabāt pieteikumu. Mēģini vēlreiz." }
    }
    // Already accepted or deleted: don't email a password that wasn't saved
    if (accepted.length === 0) return { ok: false, error: "Pieteikums vairs nav pieejams. Pārlādē lapu." }

    const result = await sendEmail({
        to: fields.email.trim(),
        subject: "Pieņemšana dienesta viesnīcā",
        message: `
        Sveiki!

        jūs esat pieņemts RVT kojās. jūsu piekļuves dati ir:
        
        personas kods: ${fields.social_security_number.trim()}
        pagaidu parole: ${generatedPassword}
        `
    })

    if (!result.success) {
        console.error(result.error)
    }

    return { ok: true }
}

export const rejectApplication = async (id: number) => {
    await requireAdmin()
    if (!Number.isInteger(id)) throw new Error("invalid id")
    const supabase = await createClient()

    const { error } = await supabase
    .from("users")
    .delete()
    .eq("id", id)
    // Rejecting only removes applications, never an approved account
    .is("password", null)

    if (error) {
        throw error
    }
}

export const getAllTenants = async () => {
    await requireAdmin()
    const supabase = await createClient()

    const { data, error } = await supabase
    .from("users")
    .select("id, room_number, name, course")
    .not("course", "is", null)

    if (error) {
        throw error
    }

    return data
}

export const deleteTenant = async (id: number) => {
    await requireAdmin()
    if (!Number.isInteger(id)) throw new Error("invalid id")
    const supabase = await createClient()

    const { error } = await supabase
    .from("users")
    .delete()
    .eq("id", id)

    if (error) {
        throw error
    }
}

export const getTenantById = async (id: number) : Promise<User> => {
    await requireAdmin()
    const supabase = await createClient()

    const { error, data } = await supabase
    .from("users")
    .select("name, social_security_number, room_number, course, email, phone_number")
    .eq("id", id)
    .single()


    if (error) {
        throw error
    }

    return data
}

export const getAllComplaints = async () : Promise<Complaint[]> => {
    await requireAdmin()
    const supabase = await createClient()

    const { error, data } = await supabase
    .from("complaints")
    .select("id, user_id, description, created_at")

    if (error) throw error

    return data
}

const MAX_NOTIFICATION_LENGTH = 1000

export const createNotification = async ({user_id, message, category} : Notification, all?:boolean) => {
    await requireAdmin()
    const supabase = await createClient()

    if (!Number.isInteger(user_id)) throw new Error("invalid user id")
    if (typeof message !== "string" || !message.trim() || message.length > MAX_NOTIFICATION_LENGTH) throw new Error("invalid message")
    if (typeof category !== "string" || !category.trim() || category.length > 50) throw new Error("invalid category")
    
    const { error } = await supabase
    .from("reminders")
    .insert([
        {
            user_id: all ? -1 : user_id,
            message: message.trim(),
            category: category.trim(),
            read_by: []
        }
    ])

    if (error) throw error
}

// Broadcast (user_id -1) shown to every tenant; returns a result since thrown errors are hidden in production
export const sendAnnouncement = async (message: string): Promise<{ ok: true } | { ok: false, error: string }> => {
    await requireAdmin()
    const validationError = validateAnnouncement(message)
    if (validationError) return { ok: false, error: validationError }

    try {
        await createNotification({ user_id: -1, message: message.trim(), category: ANNOUNCEMENT_CATEGORY }, true)
        return { ok: true }
    } catch (error) {
        console.error(error)
        return { ok: false, error: "Neizdevās nosūtīt paziņojumu. Mēģini vēlreiz." }
    }
}

// Matches the "vairāk nekā 3 nedēļas" text in the admin Kavētāji section
const OVERDUE_LAUNDRY_DAYS = 21
const LAUNDRY_REMINDER_CATEGORY = "Atgādinājums"

// Tenants whose last laundry change is older than OVERDUE_LAUNDRY_DAYS; never-set dates (new tenants) are skipped
export const getOverdueLaundryTenants = async () : Promise<OverdueTenant[]> => {
    await requireAdmin()
    const supabase = await createClient()

    const threshold = new Date(Date.now() - OVERDUE_LAUNDRY_DAYS * 86_400_000)
        .toLocaleDateString("sv-SE", { timeZone: "Europe/Riga" }) // YYYY-MM-DD

    const { data, error } = await supabase
    .from("users")
    .select("id, name, room_number, last_laundry_date")
    .lt("last_laundry_date", threshold)
    .order("last_laundry_date", { ascending: true })

    if (error) throw error
    if (data.length === 0) return []

    // A reminder sent after the student's last laundry change means this overdue period was already reminded
    const { data: reminders, error: remindersError } = await supabase
    .from("reminders")
    .select("user_id, created_at")
    .eq("category", LAUNDRY_REMINDER_CATEGORY)
    .in("user_id", data.map(tenant => tenant.id))

    if (remindersError) throw remindersError

    return data.map(tenant => ({
        ...tenant,
        reminded: reminders.some(reminder =>
            reminder.user_id === tenant.id && new Date(reminder.created_at) >= new Date(tenant.last_laundry_date)),
    }))
}

export const notifyOverdueTenant = async (id: number) => {
    await requireAdmin()
    if (!Number.isInteger(id)) throw new Error("invalid id")
    await createNotification({ user_id: id, message: "Jums ir jānodod veļa", category: LAUNDRY_REMINDER_CATEGORY })
}

// Upcoming and recent weekend stay requests (weekends from last week on), soonest weekend first,
// each with the tenant's approved stays in that weekend's month
export const getWeekendStays = async () : Promise<(WeekendStay & { month_stay_count: number })[]> => {
    await requireAdmin()
    const supabase = await createClient()

    const since = new Date(Date.now() - 7 * 86_400_000)
        .toLocaleDateString("sv-SE", { timeZone: "Europe/Riga" }) // YYYY-MM-DD

    const { data, error } = await supabase
    .from("weekend_stay_requests")
    .select("id, user_id, weekend_date, reason, event_date, reason_text, status, created_at")
    .gte("weekend_date", since)
    .order("weekend_date", { ascending: true })
    .order("created_at", { ascending: true })

    if (error) throw error

    return Promise.all(data.map(async stay => ({
        ...stay,
        month_stay_count: await countMonthStays(supabase, stay.user_id, stay.weekend_date),
    })))
}

export const setWeekendStayStatus = async (id: number, status: Exclude<WeekendStayStatus, "pending">) => {
    await requireAdmin()
    if (!Number.isInteger(id)) throw new Error("invalid id")
    if (status !== "approved" && status !== "rejected") throw new Error("invalid status")
    const supabase = await createClient()

    // Only pending requests can be decided, so the stay count is never bumped twice
    const { data, error } = await supabase
    .from("weekend_stay_requests")
    .update({ status })
    .eq("id", id)
    .eq("status", "pending")
    .select("user_id, weekend_date")
    .maybeSingle()

    if (error) throw error
    if (!data || status !== "approved") return

    await syncStayCount(supabase, data.user_id, data.weekend_date)
}
