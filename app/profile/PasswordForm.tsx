"use client"

import { FormEvent, useCallback, useState, useTransition } from "react";
import InputField from "../components/InputField";
import ApplyButton from "../components/ApplyButton";
import Toast, { ToastMessage } from "../components/Toast";
import { changePassword } from "./actions";
import { FieldErrors, MAX_PASSWORD_LENGTH, MIN_PASSWORD_LENGTH, hasErrors, validatePasswordChange } from "../helper/validation";

type Props = {
    accentColor: string,
}

const EMPTY = { current: "", next: "", confirm: "" }

export default function PasswordForm({ accentColor }: Props) {
    const [values, setValues] = useState(EMPTY)
    const [showPasswords, setShowPasswords] = useState(false)
    const [errors, setErrors] = useState<FieldErrors<keyof typeof EMPTY>>({})
    const [toast, setToast] = useState<ToastMessage | null>(null)
    const [isPending, startTransition] = useTransition()

    const closeToast = useCallback(() => setToast(null), [])

    const update = (field: keyof typeof EMPTY) => (e: React.ChangeEvent<HTMLInputElement>) => {
        setValues(prev => ({ ...prev, [field]: e.target.value }))
        setErrors(prev => ({ ...prev, [field]: undefined }))
    }

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setToast(null)

        const fieldErrors = validatePasswordChange(values)
        setErrors(fieldErrors)
        if (hasErrors(fieldErrors)) return

        startTransition(async () => {
            const result = await changePassword(values.current, values.next, values.confirm)

            if (!result.ok) {
                setToast({ id: Date.now(), text: result.error, variant: "error" })
                return
            }

            setValues(EMPTY)
            setShowPasswords(false)
            setToast({ id: Date.now(), text: "Parole nomainīta.", variant: "success" })
        })
    }

    const type = showPasswords ? "text" : "password"

    return (
        <>
            <Toast toast={toast} onClose={closeToast} />

            <form
                onSubmit={handleSubmit}
                noValidate
                className="flex w-full flex-col rounded-[20px] bg-black/45 px-5 pt-5 pb-6 text-white shadow-[0_4px_14px_rgba(0,0,0,0.18)] backdrop-blur-sm md:w-[42%] md:rounded-[28px] md:px-7 md:pt-6 md:pb-7"
            >
                <div className="flex items-start justify-between gap-4">
                    <h2 className="text-3xl font-bold italic leading-none md:text-[40px]">Mainīt paroli</h2>
                    <button
                        type="button"
                        onClick={() => setShowPasswords(prev => !prev)}
                        aria-label={showPasswords ? "Slēpt paroles" : "Rādīt paroles"}
                        aria-pressed={showPasswords}
                        className="grid size-9 shrink-0 cursor-pointer place-items-center rounded-full bg-white/15 text-white transition hover:bg-white/25 md:size-11"
                    >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="size-4 md:size-5">
                            <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
                            <circle cx="12" cy="12" r="3" />
                            {showPasswords && <path d="M3 3l18 18" />}
                        </svg>
                    </button>
                </div>
                <div className="mt-4 flex gap-4">
                    <span style={{ background: accentColor }} className="w-1 shrink-0 rounded-full" />
                    <p className="text-sm leading-snug text-white/85 md:text-[15px]">
                        Pēc apstiprināšanas tu saņēmi pagaidu paroli e-pastā. Nomaini to uz savu, vismaz {MIN_PASSWORD_LENGTH} simbolus garu.
                    </p>
                </div>

                <div className="mt-5 flex flex-col gap-3 md:mt-6 md:gap-4">
                    <InputField
                        id="current_password"
                        label="Pašreizējā parole"
                        type={type}
                        autoComplete="current-password"
                        placeholder="••••••"
                        value={values.current}
                        onChange={update("current")}
                        error={errors.current}
                    />
                    <InputField
                        id="new_password"
                        label="Jaunā parole"
                        type={type}
                        autoComplete="new-password"
                        placeholder="••••••••"
                        value={values.next}
                        maxLength={MAX_PASSWORD_LENGTH}
                        onChange={update("next")}
                        error={errors.next}
                    />
                    <InputField
                        id="confirm_password"
                        label="Atkārto jauno paroli"
                        type={type}
                        autoComplete="new-password"
                        placeholder="••••••••"
                        value={values.confirm}
                        maxLength={MAX_PASSWORD_LENGTH}
                        onChange={update("confirm")}
                        error={errors.confirm}
                    />
                </div>

                <ApplyButton
                    pending={isPending}
                    pendingText="Saglabā..."
                    className="mt-6 w-full cursor-pointer md:mt-7"
                >
                    Saglabāt paroli
                </ApplyButton>
            </form>
        </>
    )
}
