import { createClient } from "../lib/supabase/server"

// Not a "use server" module on purpose: these take a user id from the caller, so they must only be
// reachable through the session-checked wrappers in ./actions.ts, never called directly from the browser

export const getUsersNotifications = async (userId: number) => {
    const supabase = await createClient()
    const targetUserId = userId || -1

    const { error, data } = await supabase
    .from("reminders")
    .select("*")
    .eq("user_id", targetUserId)
    .not("read_by", "cs", `{${targetUserId}}`)

    if (error) throw error

    return data
}

const deleteNotificationById = async (id: number) => {
    const supabase = await createClient()

    const { error } = await supabase
    .from('reminders')
    .delete()
    .eq("id", id)

    if (error) throw error
}

const addUserIdToReadByColumnNotifications = async (userId: number, notificationId: number) => {
    const supabase = await createClient()

    const { data: reminder, error: fetchError } = await supabase
        .from("reminders")
        .select("read_by")
        .eq("id", notificationId)
        .single()

    if (fetchError) throw fetchError

    const currentReadBy: number[] = reminder?.read_by || []

    if (!currentReadBy.includes(userId)) {
        const updatedReadBy = [...currentReadBy, userId]

        const { error: updateError } = await supabase
            .from("reminders")
            .update({ read_by: updatedReadBy })
            .eq("id", notificationId)

        if (updateError) throw updateError
    }
}

export const MarkNotificationAsRead = async (notificationId: number, userId:number) => {
    const supabase = await createClient()

    const { data, error } = await supabase
    .from('reminders')
    .select("user_id")
    .eq("id", notificationId)
    .single()
    
    if (error) throw error

    if (data.user_id === -1) {
        await addUserIdToReadByColumnNotifications(userId, notificationId)
    } else {
        await deleteNotificationById(notificationId)
    }
}
