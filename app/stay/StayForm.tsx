"use client"

import { FormEvent, ReactNode, useCallback, useState, useTransition } from "react";
import InputField, { FieldError } from "../components/InputField";
import ApplyButton from "../components/ApplyButton";
import Toast, { ToastMessage } from "../components/Toast";
import { WEEKEND_STAY_REASONS, formatWeekend, weekendRange } from "../types/WeekendStay";
import { createWeekendStay } from "./actions";
import { FieldErrors, MAX_STAY_REASON_LENGTH, WeekendStayFields, hasErrors, validateWeekendStay } from "../helper/validation";

type Props = {
    accentColor: string,
    weekend: string,
}

// Same look as InputField, for the select and textarea
function Field({ id, label, error, children }: { id: string, label: string, error?: string, children: ReactNode }) {
    return (
        <label
            htmlFor={id}
            className="flex flex-col gap-1 rounded-2xl bg-white/10 px-6 pt-4 pb-4 text-white shadow-[0_4px_14px_rgba(0,0,0,0.18)] backdrop-blur-sm transition focus-within:bg-white/15 focus-within:ring-1 focus-within:ring-white/60"
        >
            <span className="text-xs tracking-wide text-white/90">{label}</span>
            <span className={`flex items-center gap-2 border-b pb-1 ${error ? "border-[#ffb4ab]" : "border-white/80"}`}>{children}</span>
            <FieldError id={id} error={error} />
        </label>
    )
}

const controlClass = "w-full min-w-0 cursor-pointer bg-transparent text-sm text-white outline-none [&>option]:text-black"

export default function StayForm({ accentColor, weekend }: Props) {
    const empty = { weekendDate: weekend, reason: "", eventDate: "", reasonText: "" }
    const [values, setValues] = useState(empty)
    const [errors, setErrors] = useState<FieldErrors<keyof WeekendStayFields>>({})
    const [toast, setToast] = useState<ToastMessage | null>(null)
    const [isPending, startTransition] = useTransition()

    const closeToast = useCallback(() => setToast(null), [])

    const update = (field: keyof typeof empty) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        setValues(prev => ({ ...prev, [field]: e.target.value }))
        setErrors(prev => ({ ...prev, [field]: undefined }))
    }

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setToast(null)

        const fieldErrors = validateWeekendStay(values)
        setErrors(fieldErrors)
        if (hasErrors(fieldErrors)) return

        startTransition(async () => {
            const result = await createWeekendStay(values)

            if (!result.ok) {
                setToast({ id: Date.now(), text: result.error, variant: "error" })
                return
            }

            setValues(empty)
            setToast({
                id: Date.now(),
                text: result.approved ? "Palikšana apstiprināta." : "Pieteikums nosūtīts. Administrācija to izskatīs.",
                variant: "success",
            })
        })
    }

    const range = weekendRange(values.weekendDate)

    return (
        <>
            <Toast toast={toast} onClose={closeToast} />

            <form
                onSubmit={handleSubmit}
                noValidate
                className="flex w-full flex-col rounded-[20px] bg-black/45 px-5 pt-5 pb-6 text-white shadow-[0_4px_14px_rgba(0,0,0,0.18)] backdrop-blur-sm md:w-[42%] md:rounded-[28px] md:px-7 md:pt-6 md:pb-7"
            >
                <h2 className="text-3xl font-bold italic leading-none md:text-[40px]">Pieteikt palikšanu</h2>
                <div className="mt-4 flex gap-4">
                    <span style={{ background: accentColor }} className="w-1 shrink-0 rounded-full" />
                    <p className="text-sm leading-snug text-white/85 md:text-[15px]">
                        Palikšana brīvdienās jāpiesaka iepriekš, norādot iemeslu. Pieteikumu apstiprina administrācija.
                    </p>
                </div>

                <div className="mt-5 flex flex-col gap-3 md:mt-6 md:gap-4">
                    {/* Only the upcoming weekend can be requested */}
                    <InputField id="stay_weekend" label="Nedēļas nogale" value={formatWeekend(weekend)} readOnly />

                    <Field id="stay_reason" label="Iemesls" error={errors.reason}>
                        <select id="stay_reason" required aria-invalid={errors.reason ? true : undefined} value={values.reason} onChange={update("reason")} className={controlClass}>
                            <option value="" disabled>Izvēlies iemeslu</option>
                            {Object.entries(WEEKEND_STAY_REASONS).map(([value, label]) => (
                                <option key={value} value={value}>{label}</option>
                            ))}
                        </select>
                    </Field>

                    {values.reason === "event" && (
                        <InputField
                            id="stay_event_date"
                            label="Pasākuma datums"
                            type="date"
                            required
                            min={range.from}
                            max={range.to}
                            value={values.eventDate}
                            onChange={update("eventDate")}
                            error={errors.eventDate}
                            className="[&_input]:[color-scheme:dark]"
                        />
                    )}

                    {values.reason === "other" && (
                        <Field id="stay_reason_text" label="Apraksti iemeslu" error={errors.reasonText}>
                            <textarea
                                id="stay_reason_text"
                                required
                                aria-invalid={errors.reasonText ? true : undefined}
                                maxLength={MAX_STAY_REASON_LENGTH}
                                placeholder="Kāpēc paliksi dienesta viesnīcā?"
                                value={values.reasonText}
                                onChange={update("reasonText")}
                                className="h-24 w-full resize-none bg-transparent text-sm text-white outline-none placeholder:text-white/45"
                            />
                        </Field>
                    )}
                </div>

                <ApplyButton
                    pending={isPending}
                    pendingText="Sūta..."
                    className="mt-6 w-full cursor-pointer md:mt-7"
                >
                    Nosūtīt pieteikumu
                </ApplyButton>
            </form>
        </>
    )
}
