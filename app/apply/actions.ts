"use server";

import { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "../lib/supabase/server";
import { Application } from "./Application";
import { User } from "../types/User";

export const apply = async (inputData?: Application) => {
    const supabase = await createClient()

    const {data, error} = await supabase
    .from("users")
    .select("id")
    .eq("social_security_number", inputData?.social_security_number)
    .maybeSingle()

    if(error) {
        console.error(error)
        return
    }

    if (data != null) {
        console.log("user already applied")
        return
    }

    const isValidSocialSecurityNumber = /^\d{6}-\d{5}$/.test(inputData?.social_security_number as string);

    if(!isValidSocialSecurityNumber) {
        console.log("invalid social security number")
        return
    }

    const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(inputData?.email as string)

    if(!isValidEmail) {
        console.log("invalid email")
        return
    }

    await saveApplication(supabase, inputData as Application)
}

export const saveApplication =  async (
    supabase: SupabaseClient, application: Application
) => {
    const {data, error} = await supabase
    .from("users")
    .insert([
        application        
    ])
    
    if (error) {
        console.error(error)
        return
    }
    console.log("application saved!")
}
