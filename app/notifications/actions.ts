"use server"
import { getCurrentUser } from "../helper/auth/jwt"
import { getUsersNotifications, MarkNotificationAsRead } from "../adminDashboard/actions"
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

    return [...(personal as Notification[]), ...unreadBroadcast].sort(
        (a, b) => new Date(b.created_at ?? 0).getTime() - new Date(a.created_at ?? 0).getTime()
    )
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
        await markPasswordReminderAsRead(user.id, notificationId)
        return
    }

    await MarkNotificationAsRead(notificationId, user.id)
}
