"use server"
import { getCurrentUser } from "../helper/auth/jwt"
import { getUsersNotifications, MarkNotificationAsRead } from "../adminDashboard/actions"
import { Notification } from "../types/Notification"

// Student-side wrappers: the user id always comes from the session, never from the client

// Personal notifications plus broadcasts (user_id -1) the student hasn't read yet, newest first
export const getMyNotifications = async (): Promise<Notification[]> => {
    const user = await getCurrentUser()
    if (!user) throw new Error("Unauthorized")

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
    if (!notifications.some((notification) => notification.id === notificationId)) {
        throw new Error("Notification not found")
    }

    await MarkNotificationAsRead(notificationId, user.id)
}
