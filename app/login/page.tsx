"use client"

import { FormEvent, useCallback, useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Inter } from "next/font/google";
import InputField from "../components/InputField";
import ApplyButton from "../components/ApplyButton";
import Toast, { ToastMessage } from "../components/Toast";
import { signInUser } from "./actions";

const inter = Inter({
    subsets: ["latin", "latin-ext"],
    weight: ["300", "400"],
})

export default function Login() {
    const [socialSecurityNumber, setSocialSecurityNumber] = useState("")
    const [password, setPassword] = useState("")
    const [showPassword, setShowPassword] = useState(false)
    const [toast, setToast] = useState<ToastMessage | null>(null)
    const [isPending, startTransition] = useTransition()

    const router = useRouter()

    const closeToast = useCallback(() => setToast(null), [])

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setToast(null)

        startTransition(async () => {
            const result = await signInUser(socialSecurityNumber, password)

            if (!result.ok) {
                setToast({ id: Date.now(), text: result.error, variant: "error" })
                return
            }

            router.replace(result.redirectTo)
            router.refresh()
        })
    }

    return (
        <main className={`${inter.className} relative flex min-h-dvh items-center justify-center overflow-hidden bg-[#3b1210] px-4 py-12 text-white`}>
            <Image
                src="/apply-background.png"
                alt=""
                fill
                priority
                sizes="100vw"
                className="object-cover"
            />

            <Toast toast={toast} onClose={closeToast} />

            <form
                onSubmit={handleSubmit}
                noValidate
                className="relative z-10 flex w-full max-w-[555px] flex-col items-center"
            >
                <h1 className="text-center text-4xl font-light leading-tight sm:text-[2.6rem]">
                    Ienākšana
                    <br />
                    koju sistēmā
                </h1>

                <div className="mt-[clamp(1.5rem,4dvh,2.5rem)] flex w-full flex-col gap-[clamp(1rem,4.5dvh,2.75rem)]">
                    <InputField
                        id="social_security_number"
                        label="Personas kods"
                        autoComplete="username"
                        inputMode="numeric"
                        placeholder="000000-00000"
                        autoFocus
                        value={socialSecurityNumber}
                        onChange={e => setSocialSecurityNumber(e.target.value)}
                    />
                    <InputField
                        id="password"
                        label="Parole"
                        type={showPassword ? "text" : "password"}
                        autoComplete="current-password"
                        placeholder="••••••"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        trailing={
                            <button
                                type="button"
                                onClick={() => setShowPassword(prev => !prev)}
                                aria-label={showPassword ? "Slēpt paroli" : "Rādīt paroli"}
                                aria-pressed={showPassword}
                                className="shrink-0 cursor-pointer text-white/70 transition hover:text-white"
                            >
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="size-4">
                                    <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
                                    <circle cx="12" cy="12" r="3" />
                                    {showPassword && <path d="M3 3l18 18" />}
                                </svg>
                            </button>
                        }
                    />
                </div>

                <p className="mt-3 self-start text-sm text-white/75">
                    Nav konta?{" "}
                    <Link href="/apply" className="text-white underline underline-offset-2 transition hover:text-white/80">
                        Pieteikties
                    </Link>
                </p>

                <ApplyButton
                    pending={isPending}
                    pendingText="Piesakās..."
                    className="mt-[clamp(2rem,7dvh,3.5rem)] w-full max-w-[311px]"
                >
                    Pieteikties
                </ApplyButton>
            </form>
        </main>
    )
}
