"use server"
import { Application } from "../apply/Application"
import { createClient } from "../lib/supabase/server"
import { Role } from "../types/Role"
import { User } from "../types/User"
import { hashPassword } from '../helper/auth/password'
import { sendEmail } from "../helper/mailer"
import { Complaint } from "../types/Complaint"
import { OverdueTenant } from "../types/OverdueTenant"

export const getUserApplications = async () : Promise<Application[]> => {

    const supabase = await createClient()

    const {data, error} = await supabase
    .from("users")
    .select("social_security_number, email, phone_number, name, id")
    .is("course", null)

    if (error) {
        throw error
    }

    return data
}


export const acceptAndEditApplication = async (u: User) => {

    const supabase = await createClient()

    const generatedPassword = Math.floor(100000 + Math.random() * 900000).toString()
    const hashedPassword = await hashPassword(generatedPassword.toString())


    const { error } = await supabase
    .from("users")
    .update({
        ...u,
        password: hashedPassword,
        role: JSON.stringify(Role.USER),
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
        
        ē-pasts: ${u.email}
        pagaidu parole: ${generatedPassword}
        `
    })

    if (!result.success) {
        console.error(result.error)
    }
}

export const rejectApplication = async (id: number) => {
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
    const supabase = await createClient()

    const { error, data } = await supabase
    .from("complaints")
    .select("id, description, created_at")

    if (error) throw error

    return data
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
