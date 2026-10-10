import TextField from "../components/TextField";
import { createClient } from "../lib/supabase/server";
import bcrypt from "bcryptjs";

export async function Users() {
    const supabase = await createClient()

    const { data, error } = await supabase
    .from('users')
    .select("*")

    if(error) {
        return <div>{error.message}</div>
    }

    return(
        <pre>{JSON.stringify(data, null, 2)}</pre>
    )

}


export default async function Register() {

    return(
        <main className="w-full h-screen bg-pink-900 flex items-center justify-center">
            <form className="bg-white w-[90%] h-[80%] p-5 flex flex-col justify-between max-w-200 rounded-xl">
                <div className="flex flex-col gap-2">
                    <div className="w-full text-center text-2xl font-bold">
                        <span>Register</span>
                    </div>
                    <div className="flex flex-col gap-20 pt-10">
                        <TextField label="email" placeholder="enter your email"/>
                        <TextField label="password" placeholder="enter your password"/>
                        <TextField label="password again" placeholder="enter your password again"/>
                    </div>
                </div>
               
                <div className="w-full flex justify-center ">
                    <button className="bg-pink-900 text-white w-[70%] max-w-100 py-5 rounded-xl">Register</button>
                </div>
                <Users/>
            </form>
        </main>
    )
}
