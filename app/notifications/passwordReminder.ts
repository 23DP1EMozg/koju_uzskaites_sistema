import { createClient } from "../lib/supabase/server"

// Weekly in-app reminder to replace the temporary password, until the user changes it.
// There is no column for "still on the temporary password", so the user's single row with this category in
// `reminders` is the state: an unread/read reminder counts down to the next one (kept, not deleted, when read),
// and a read row with PASSWORD_CHANGED_MESSAGE marks the password as changed for good.
export const PASSWORD_REMINDER_CATEGORY = "Drošība"

const PASSWORD_REMINDER_MESSAGE = "Tu joprojām izmanto pagaidu paroli. Drošības nolūkos nomaini to savā profilā."
const PASSWORD_CHANGED_MESSAGE = "Pagaidu parole ir nomainīta."
const REMINDER_INTERVAL_MS = 7 * 24 * 60 * 60 * 1000

// Keeps exactly one password reminder row per user
const replacePasswordReminder = async (userId: number, message: string, readBy: number[]) => {
    const supabase = await createClient()

    const { error: deleteError } = await supabase
        .from("reminders")
        .delete()
        .eq("user_id", userId)
        .eq("category", PASSWORD_REMINDER_CATEGORY)

    if (deleteError) throw deleteError

    const { error } = await supabase
        .from("reminders")
        .insert([{
            user_id: userId,
            message,
            category: PASSWORD_REMINDER_CATEGORY,
            read_by: readBy,
        }])

    if (error) throw error
}

// Creates a new reminder when the user is still on the temporary password and the last reminder is a week old
export const ensureWeeklyPasswordReminder = async (userId: number) => {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from("reminders")
        .select("message, created_at")
        .eq("user_id", userId)
        .eq("category", PASSWORD_REMINDER_CATEGORY)

    if (error) throw error

    if (data.some(row => row.message === PASSWORD_CHANGED_MESSAGE)) return

    const weekAgo = Date.now() - REMINDER_INTERVAL_MS
    if (data.some(row => new Date(row.created_at).getTime() >= weekAgo)) return

    await replacePasswordReminder(userId, PASSWORD_REMINDER_MESSAGE, [])
}

// After the admin issues a new temporary password: remind right away and weekly again until it is changed
export const restartPasswordReminders = (userId: number) => replacePasswordReminder(userId, PASSWORD_REMINDER_MESSAGE, [])

// After a password change: remove the pending reminder and stop sending new ones
export const stopPasswordReminders = (userId: number) => replacePasswordReminder(userId, PASSWORD_CHANGED_MESSAGE, [userId])

// Marked read instead of deleted, so the row keeps counting down to the next reminder.
// Any duplicate reminder rows are marked too, so a hidden one doesn't show up next
export const markPasswordReminderAsRead = async (userId: number) => {
    const supabase = await createClient()

    const { error } = await supabase
        .from("reminders")
        .update({ read_by: [userId] })
        .eq("user_id", userId)
        .eq("category", PASSWORD_REMINDER_CATEGORY)
        .neq("message", PASSWORD_CHANGED_MESSAGE)

    if (error) throw error
}
