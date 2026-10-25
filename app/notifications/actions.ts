"use server"
import { getCurrentUser } from "../helper/auth/jwt"
import { createClient } from "../lib/supabase/server"
import { Role } from "../types/Role"
import { getUsersNotifications, MarkNotificationAsRead } from "./reminders"
import { Notification } from "../types/Notification"
import { ensureWeeklyPasswordReminder, markPasswordReminderAsRead, PASSWORD_REMINDER_CATEGORY } from "./passwordReminder"

// Student-side wrappers: the user id always comes from the session, never from the client

// Personal notifications plus broadcasts (user_id -1) the student hasn't read yet, newest first
export const getMyNotifications = async (): Promise<Notification[]> => {
    const user = await getCurrentUser()
    if (!user) throw new Error("Unauthorized")

    // A failed reminder check shouldn't hide the student's other notifications
    await ensureWeeklyPasswordReminder(user.id).catch(console.error)

    const [personal, broadcast] = await Promise.all([
        getUsersNotifications(user.id),
        getUsersNotifications(-1),
    ])

    const unreadBroadcast = (broadcast as Notification[]).filter(
        (notification) => !(notification.read_by ?? []).map(Number).includes(user.id)
    )

    const sorted = [...(personal as Notification[]), ...unreadBroadcast].sort(
        (a, b) => new Date(b.created_at ?? 0).getTime() - new Date(a.created_at ?? 0).getTime()
    )

    // Two page loads at once can each create a password reminder, so only the newest one is shown
    const newestReminder = sorted.find(notification => notification.category === PASSWORD_REMINDER_CATEGORY)
    return sorted.filter(notification => notification.category !== PASSWORD_REMINDER_CATEGORY || notification === newestReminder)
}

export const markMyNotificationAsRead = async (notificationId: number) => {
    const user = await getCurrentUser()
    if (!user) throw new Error("Unauthorized")

    // Only allow marking notifications this student can actually see
    const notifications = await getMyNotifications()
    const notification = notifications.find((notification) => notification.id === notificationId)
    if (!notification) {
        throw new Error("Notification not found")
    }

    if (notification.category === PASSWORD_REMINDER_CATEGORY && notification.user_id === user.id) {
        await markPasswordReminderAsRead(user.id)
        return
    }

    await MarkNotificationAsRead(notificationId, user.id)
}

export type AdminAlert = {
    id: string,
    category: string,
    message: string,
    href: string,
}

// Latvian counts: 1, 21, 31... take the singular, everything else (including 11) the plural
const plural = (count: number, one: string, many: string) =>
    count % 10 === 1 && count % 100 !== 11 ? one : many

// Work waiting for admins, shown on top of their notifications; an alert goes away once the work is done
export const getAdminAlerts = async (): Promise<AdminAlert[]> => {
    const user = await getCurrentUser()
    if (user?.role !== Role.ADMIN) return []

    const supabase = await createClient()
    const today = new Date().toLocaleDateString("sv-SE", { timeZone: "Europe/Riga" })
    const weekAgo = new Date(Date.now() - 7 * 86_400_000).toISOString()

    const [applications, stays, complaints] = await Promise.all([
        // Applications have no course or password until they are accepted
        supabase.from("users").select("id", { count: "exact", head: true }).is("course", null).is("password", null),
        supabase.from("weekend_stay_requests").select("id", { count: "exact", head: true }).eq("status", "pending").gte("weekend_date", today),
        supabase.from("complaints").select("id", { count: "exact", head: true }).gte("created_at", weekAgo),
    ])

    const error = applications.error ?? stays.error ?? complaints.error
    if (error) throw error

    const applicationCount = applications.count ?? 0
    const stayCount = stays.count ?? 0
    const complaintCount = complaints.count ?? 0
    const alerts: AdminAlert[] = []

    if (applicationCount > 0) alerts.push({
        id: "applications",
        category: "Pieteikumi",
        message: `${applicationCount} ${plural(applicationCount, "jauns pieteikums gaida", "jauni pieteikumi gaida")} apstiprinājumu.`,
        href: "/adminDashboard#pieteikumi",
    })
    if (stayCount > 0) alerts.push({
        id: "stays",
        category: "Palikšana",
        message: `${stayCount} ${plural(stayCount, "palikšanas pieteikums gaida", "palikšanas pieteikumi gaida")} lēmumu.`,
        href: "/adminDashboard#paliksana",
    })
    if (complaintCount > 0) alerts.push({
        id: "complaints",
        category: "Sūdzības",
        message: `${complaintCount} ${plural(complaintCount, "jauna sūdzība", "jaunas sūdzības")} pēdējās 7 dienās.`,
        href: "/adminDashboard#sudzibas",
    })

    return alerts
}
