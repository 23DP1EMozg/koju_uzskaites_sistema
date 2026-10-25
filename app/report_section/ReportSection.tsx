"use client"

import ReportInputField from "@/app/components/reportComponents/ReportInputField";
import ReportTextArea from "@/app/components/reportComponents/ReportTextArea";
import { useCallback, useState, useTransition } from "react";
import Toast, { ToastMessage } from "@/app/components/Toast";
import { MAX_COMPLAINT_LENGTH, validateComplaint } from "@/app/helper/validation";
import { createComplaint } from "../actions";

type ReportSectionProps = {
    bgImage: string
};

export default function ReportSection({bgImage}: ReportSectionProps) {

    const [complaint, setComplaint] = useState("")
    const [error, setError] = useState<string>()
    const [toast, setToast] = useState<ToastMessage | null>(null)
    const [isPending, startTransition] = useTransition()

    const closeToast = useCallback(() => setToast(null), [])

    const sendComplaint = (e: React.SubmitEvent<HTMLFormElement>) => {
        e.preventDefault()
        setToast(null)

        const validationError = validateComplaint(complaint) ?? undefined
        setError(validationError)
        if (validationError) return

        startTransition(async () => {
            const result = await createComplaint(complaint)

            if (!result.ok) {
                setToast({ id: Date.now(), text: result.error, variant: "error" })
                return
            }

            setComplaint("")
            setToast({ id: Date.now(), text: "Sūdzība nosūtīta. Administrācija to izskatīs.", variant: "success" })
        })
    }

    return (
        <section id={"ReportSection"} className={`relative z-[5] w-full flex justify-center bg-white px-4 pb-4`}>
            <div style={{backgroundImage: `url('${bgImage}')`}} className={`w-full min-h-screen flex flex-row items-center justify-between rounded-[28px] md:rounded-[40px] px-5 md:px-0 pt-24 pb-28 md:py-0 bg-cover bg-center bg-no-repeat overflow-hidden`}>
                <h2 className={`hidden md:block w-min text-white font-black text-[10vw] leading-[0.95] tracking-tight drop-shadow-[0_4px_12px_rgba(0,0,0,0.25)]`}>Kaut kas nepatīk?</h2>
                <Toast toast={toast} onClose={closeToast} />
                <form className={`flex flex-col w-full md:w-[38%] gap-5 md:mr-[8%]`} onSubmit={sendComplaint} noValidate>
                    <h3 className={`text-white font-extralight text-[34px] leading-none`}>Sūdzība</h3>
                    <div className={`flex flex-row gap-4 w-full`}>
                        <ReportInputField id={"reportName"} name={"name"} label={"Vārds"} className={`w-1/2`}/>
                        <ReportInputField id={"reportSurname"} name={"surname"} label={"Uzvārds"} className={`w-1/2`}/>
                    </div>
                    <ReportTextArea id={"reportDescription"} name={"description"} label={"Apraksts"} value={complaint} required maxLength={MAX_COMPLAINT_LENGTH} error={error} onChange={(value) => {
                        setComplaint(value)
                        setError(undefined)
                    }}/>
                    <button type={"submit"} disabled={isPending} className={`self-center bg-white text-black rounded-[18px] w-50 h-13 text-[17px] mt-6 cursor-pointer disabled:opacity-60`}>
                        {isPending ? "Sūta..." : "Nosūtīt"}
                    </button>
                </form>
            </div>
        </section>
    )
}
