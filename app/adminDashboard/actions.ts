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
        role: Role.USER,
        last_laundry_date: null,
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

export const deleteNotificationById = async (id: number) => {
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

    try {
        if (data.user_id === -1) {
            addUserIdToReadByColumnNotifications(userId, notificationId)
        }else {
            deleteNotificationById(notificationId)
        }
    } catch (error) {
        throw error
    }
} 


// TODO(BE): replace mock with a users query where last_laundry_date or last_kitchen_cleaning_date is older than 21 days
export const getOverdueCleaningTenants = async () : Promise<OverdueTenant[]> => {
    return [
        { id: 1, name: "Liene Ozola", room_number: 101, last_laundry_date: "2026-09-14", last_kitchen_cleaning_date: null },
        { id: 2, name: "Anna Kalniņa", room_number: 312, last_laundry_date: "2026-09-02", last_kitchen_cleaning_date: "2026-08-28" },
        { id: 3, name: "Edvards Mozga", room_number: 413, last_laundry_date: null, last_kitchen_cleaning_date: "2026-09-20" },
    ]
}

// TODO(BE): send a reminder to the tenant (e.g. sendEmail or an in-app notification row)
export const notifyOverdueTenant = async (id: number) => {
    console.log(`notify overdue tenant ${id}`)
}
