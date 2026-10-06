"use client";

import { FormEvent, useState, useTransition } from "react";
import Image from "next/image";
import { Inter } from "next/font/google";
import { Application } from "./Application";
import { apply } from "./actions";
import InputField from "../components/InputField";
import ApplyButton from "../components/ApplyButton";

const inter = Inter({
    subsets: ["latin", "latin-ext"],
    weight: ["300", "400"],
})

export default function Apply() {
    const [data, setData] = useState<Application>({
        id: null,
        name: "",
        social_security_number: "",
        email: "",
        phone_number: ""
    })
    const [isPending, startTransition] = useTransition()

    const update = (field: keyof Omit<Application, "id">) => (e: React.ChangeEvent<HTMLInputElement>) => {
        setData(prev => ({
            ...prev,
            [field]: e.target.value
        }))
    }

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        startTransition(() => apply(data))
    }

    return(
        <main className={`${inter.className} relative flex min-h-dvh items-center justify-center overflow-hidden bg-[#3b1210] px-4 py-12 text-white`}>
            <Image
                src="/apply-background.png"
                alt=""
                fill
                priority
                sizes="100vw"
                className="object-cover"
            />

            <form
                onSubmit={handleSubmit}
                className="relative z-10 flex w-full max-w-[555px] flex-col items-center"
            >
                <h1 className="text-center text-4xl font-light leading-tight sm:text-[2.6rem]">
                    Koju pievienošanās
                    <br />
                    sistēma
                </h1>

                <div className="mt-[clamp(1.5rem,4dvh,2.5rem)] flex w-full flex-col gap-[clamp(1rem,4.5dvh,2.75rem)]">
                    <InputField
                        id="social_security_number"
                        label="Personas kods"
                        required
                        inputMode="numeric"
                        pattern="\d{6}-\d{5}"
                        title="Formāts: 000000-00000"
                        placeholder="000000-00000"
                        value={data.social_security_number}
                        onChange={update("social_security_number")}
                    />
                    <InputField
                        id="name"
                        label="Vārds Uzvārds"
                        required
                        autoComplete="name"
                        placeholder="Jānis Bērziņš"
                        value={data.name}
                        onChange={update("name")}
                    />
                    <InputField
                        id="phone_number"
                        label="Tel. numurs"
                        type="tel"
                        required
                        autoComplete="tel"
                        placeholder="+371 20000000"
                        value={data.phone_number}
                        onChange={update("phone_number")}
                    />
                    <InputField
                        id="email"
                        label="E-pasts"
                        type="email"
                        required
                        autoComplete="email"
                        placeholder="vards@epasts.lv"
                        value={data.email}
                        onChange={update("email")}
                    />
                </div>

                <ApplyButton
                    pending={isPending}
                    className="mt-[clamp(2rem,7dvh,3.5rem)] w-full max-w-[311px]"
                />
            </form>
        </main>
    )
}
