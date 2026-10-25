"use server"

import { getCurrentUser } from "../helper/auth/jwt"
import { createClient } from "../lib/supabase/server"
import { Event } from "../types/Event"

export const createEvent = async (event: Event) => {
    const supabase = await createClient()

    const user = await getCurrentUser()

    if (!event) throw new Error("invalid event")

    const { error } = await supabase
    .from("events")
    .insert([
        {
            ...event,
            created_by: user?.id,
        }
    ])

    if (error) throw error
}

export const getAllEvents = async () => {
    const supabase = await createClient()

    const { data, error } = await supabase
    .from("events")
    .select("*")

    if (error) throw error

    return data
}

export const getEventById = async (id: number) => {
    const supabase = await createClient()

    if (!id) throw new Error("invalid id")

    const { data, error } = await supabase
    .from("events")
    .select("*")
    .eq("id", id)

    if (error) throw error

    return data
}

export const deleteEventById = async (id: number) => {
    const supabase = await createClient()

    if (!id) throw new Error("invalid id")

    const { error } = await supabase
    .from("events")
    .delete()
    .eq("id", id)

    if (error) throw error
}


export const editEventById = async (id: number, event: Event) => {
    const supabase = await createClient()

    const user = await getCurrentUser()

    if (!id) throw new Error("invalid id")
    if (!event) throw new Error("invalid event")
    if (!user?.id) throw new Error("unauthorized")

    const { error } = await supabase
        .from("events")
        .update({
            ...event,
        })
        .eq("id", id)
        .eq("created_by", user.id)
    if (error) throw error
}


type SignUpResult = { ok: true } | { ok: false, error: string }

const SIGN_UP_ERROR = "Neizdevās pieteikties. Mēģini vēlreiz."

export const signUpForEvent = async (eventId: number): Promise<SignUpResult> => {
    const user = await getCurrentUser()
    if (!user?.id) return { ok: false, error: "Lai pieteiktos, lūdzu, ienāc sistēmā." }
    if (!eventId) return { ok: false, error: "Pasākums nav atrasts." }

    const supabase = await createClient()

    const { data, error } = await supabase
        .from("events")
        .select("participant_ids")
        .eq("id", eventId)
        .maybeSingle()

    if (error) {
        console.error(error)
        return { ok: false, error: SIGN_UP_ERROR }
    }
    if (!data) return { ok: false, error: "Pasākums nav atrasts." }

    const participantIds: number[] = data.participant_ids ?? []
    if (participantIds.includes(user.id)) return { ok: true }

    const { error: updateError } = await supabase
        .from("events")
        .update({ participant_ids: [...participantIds, user.id] })
        .eq("id", eventId)

    if (updateError) {
        console.error(updateError)
        return { ok: false, error: SIGN_UP_ERROR }
    }

    return { ok: true }
}
