"use server";

import { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "../lib/supabase/server";
import { Application } from "../types/Application";
import { User } from "../types/User";

export const apply = async (inputData?: Application) => {
    const supabase = await createClient()

    const {data, error} = await supabase
    .from("users")
    .select("*")
    .eq("social_security_number", inputData?.social_security_number)
    .maybeSingle()

    if(error) {
        console.error(error)
    }

    if (data != null) {
        console.log("user already applied")
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
