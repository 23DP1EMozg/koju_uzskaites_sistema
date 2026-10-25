"use server"
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


export const acceptAndEditApplication = async (u: User) => {
    await requireAdmin()

    const supabase = await createClient()

    const generatedPassword = Math.floor(100000 + Math.random() * 900000).toString()
    const hashedPassword = await hashPassword(generatedPassword.toString())


    const { error } = await supabase
    .from("users")
    .update({
        ...u,
        password: hashedPassword,
        role: JSON.stringify(Role.USER),
        last_laundry_date: new Date().toISOString(),
        next_kitchen_cleaning_date: null,
        weekend_stay_count: 0,
    })
    .eq("id", u.id)

    if (error) {
        throw error
    }

    const result = await sendEmail({
        to: u.email as string,
        subject: "Pieņemšana dienesta viesnīcā",
        message: `
        Sveiki!

        jūs esat pieņemts RVT kojās. jūsu piekļuves dati ir:
        
        personas kods: ${u.social_security_number}
        pagaidu parole: ${generatedPassword}
        `
    })

    if (!result.success) {
        console.error(result.error)
    }
}

export const rejectApplication = async (id: number) => {
    await requireAdmin()
    const supabase = await createClient()

    const { error } = await supabase
    .from("users")
    .delete()
    .eq("id", id)

    if (error) {
        throw error
    }
}

export const getAllTenants = async () => {
    await requireAdmin()
    const supabase = await createClient()

    const { data, error } = await supabase
    .from("users")
    .select("id, room_number, name ")
    .not("course", "is", null)

    if (error) {
        throw error
    }

    return data
}

export const deleteTenant = async (id: number) => {
    await requireAdmin()
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

export const createNotification = async ({user_id, message, category} : Notification, all?:boolean) => {
    await requireAdmin()
    const supabase = await createClient()

    if (!user_id) throw new Error("invalid user id")
    if (!message) throw new Error("invalid message")
    if (!category) throw new Error("invalid category")
    
    const { error } = await supabase
    .from("reminders")
    .insert([
        {
            user_id: all ? -1 : user_id,
            message,
            category,
            read_by: []
        }
    ])

    if (error) throw error
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
