"use client"

import { useEffect } from "react"

export type ToastMessage = {
    id: number,
    text: string,
    variant: "error" | "success",
}

type Props = {
    toast: ToastMessage | null,
    onClose: () => void,
    duration?: number,
}

export default function Toast({ toast, onClose, duration = 5000 }: Props) {
    // Restart the timer whenever a new toast (new id) appears
    useEffect(() => {
        if (!toast) return
        const timer = setTimeout(onClose, duration)
        return () => clearTimeout(timer)
    }, [toast, onClose, duration])

    return (
        <div className="pointer-events-none fixed inset-x-0 top-0 z-50 flex justify-center px-4 pt-6" aria-live="assertive">
            {toast && (
                <div
                    key={toast.id}
                    role={toast.variant === "error" ? "alert" : "status"}
                    className="pointer-events-auto animate-toast-in motion-reduce:animate-none flex w-full max-w-[460px] items-start gap-3 rounded-2xl border border-white/15 bg-[#1a0907]/80 px-5 py-4 text-white shadow-[0_10px_30px_rgba(0,0,0,0.35)] backdrop-blur-md"
                >
                    <span
                        className={`mt-0.5 grid size-6 shrink-0 place-items-center rounded-full text-sm font-semibold ${
                            toast.variant === "error" ? "bg-[#c4473d]" : "bg-[#3f9a5c]"
                        }`}
                        aria-hidden
                    >
                        {toast.variant === "error" ? "!" : "✓"}
                    </span>
                    <p className="flex-1 text-sm leading-relaxed sm:text-base">{toast.text}</p>
                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Aizvērt"
                        className="-mr-1 grid size-7 shrink-0 cursor-pointer place-items-center rounded-full text-white/70 transition hover:bg-white/10 hover:text-white"
                    >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="size-4">
                            <path d="M6 6l12 12M18 6 6 18" />
                        </svg>
                    </button>
                </div>
            )}
        </div>
    )
}
