"use client"

import { useState } from "react";
import { sendEmail } from "../helper/mailer";
import TextField from "../register/TextField";
import { loginUser } from "./actions";

type InputData = {
    email: string,
    password: string
}

export default function Login() {

    const [data, setData] = useState<InputData>({
        email: "",
        password: ""
    })

    const login = async () => {
        try {
            const token = await loginUser({
                email: data.email,
                password: data.password
            })
            console.log(token)
        } catch (error) {
            console.log(error)
        }
    }

    return (
        <main className="w-full h-screen bg-pink-900 flex items-center justify-center">
            <div className="bg-white w-[90%] h-[80%] p-5 flex flex-col justify-between max-w-200 rounded-xl">
                <div className="flex flex-col gap-2">
                    <div className="w-full text-center text-2xl font-bold">
                        <span>Login</span>
                    </div>
                    <div className="flex flex-col gap-20 pt-10">
                        <TextField label="email" placeholder="enter your email" callback={(val:string) => setData(prev => ({
                            ...prev,
                            email: val
                        }))}/>
                        <TextField label="password" placeholder="enter your password" callback={(val:string) => setData(prev => ({
                            ...prev,
                            password: val
                        }))}/>
                    </div>
                </div>
                
                <div className="w-full flex justify-center ">
                    <button className="bg-pink-900 text-white w-[70%] max-w-100 py-5 rounded-xl" onClick={() => login()}>Login</button>
                </div>
            </div>            
        </main>
    )
}
