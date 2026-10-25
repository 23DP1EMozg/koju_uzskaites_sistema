"use client"

import { FormEvent, useState } from "react"
import { sendAnnouncement } from "./actions"
import { FieldError } from "../components/InputField"
import { MAX_ANNOUNCEMENT_LENGTH, validateAnnouncement } from "./announcement"

type Props = {
    showToast: (text: string, variant: "error" | "success") => void,
}

// A message for every tenant: it appears in their notifications and in the "Ziņojumi" widget
export default function InfoSection({ showToast }: Props) {
    const [message, setMessage] = useState("")
    const [error, setError] = useState<string | null>(null)
    const [pending, setPending] = useState(false)

    async function handleSubmit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault()
        const validationError = validateAnnouncement(message)
        setError(validationError)
        if (validationError) return

        setPending(true)
        const result = await sendAnnouncement(message).catch(() => ({ ok: false as const, error: "Neizdevās nosūtīt paziņojumu. Mēģini vēlreiz." }))
        setPending(false)

        if (!result.ok) {
            showToast(result.error, "error")
            return
        }
        setMessage("")
        showToast("Paziņojums nosūtīts visiem iemītniekiem.", "success")
    }

    return (
        <section id="informacija" className="scroll-mt-4 px-4 py-16 lg:px-[7.5rem] lg:py-28">
            <div className="rounded-[3rem] bg-[url('/backgrounds/redTheme/NotificationContainerRedBg.png')] bg-cover bg-center px-4 py-14 text-white lg:px-16 lg:py-20">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                    <h2 className="text-5xl font-extrabold italic tracking-tight lg:text-[5.5rem] lg:leading-none">Informācija</h2>
                    <p className="max-w-[26rem] text-lg text-white/75 lg:mb-[-1.5rem] lg:text-2xl">
                        Paziņojums visiem iemītniekiem
                    </p>
                </div>

                <form onSubmit={handleSubmit} noValidate className="mt-10 flex flex-col gap-6 lg:mt-14">
                    <label htmlFor="announcement" className="flex flex-col gap-2 rounded-2xl bg-white/10 px-6 pt-4 pb-4 shadow-[0_4px_14px_rgba(0,0,0,0.18)] backdrop-blur-sm transition focus-within:bg-white/15 focus-within:ring-1 focus-within:ring-white/60">
                        <span className="text-xs tracking-wide text-white/90">Paziņojuma teksts</span>
                        <textarea
                            id="announcement"
                            rows={4}
                            maxLength={MAX_ANNOUNCEMENT_LENGTH}
                            value={message}
                            onChange={e => { setMessage(e.target.value); setError(null) }}
                            placeholder="Piem., Ceturtdien no 10:00 līdz 12:00 nebūs karstā ūdens."
                            aria-invalid={error ? true : undefined}
                            aria-describedby={error ? "announcement_error" : undefined}
                            className={`w-full resize-y border-b bg-transparent text-base text-white outline-none placeholder:text-white/45 ${error ? "border-[#ffb4ab]" : "border-white/80"}`}
                        />
                        <FieldError id="announcement" error={error ?? undefined} />
                    </label>

                    <button
                        type="submit"
                        disabled={pending}
                        className="cursor-pointer self-end rounded-full bg-white px-10 py-4 text-lg text-black transition hover:bg-white/85 disabled:opacity-60"
                    >
                        {pending ? "Sūta..." : "Nosūtīt visiem"}
                    </button>
                </form>
            </div>
        </section>
    )
}
