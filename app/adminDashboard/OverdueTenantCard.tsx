"use client"

import { useState } from "react"
import { OverdueTenant } from "../types/OverdueTenant"

type Props = {
    tenant: OverdueTenant
    onNotify: () => Promise<void>
}

const daysSince = (date: string) => Math.floor((Date.now() - new Date(date).getTime()) / 86_400_000)
const formatReminderDate = (date: string) =>
    new Date(date).toLocaleDateString("lv-LV", { timeZone: "Europe/Riga", day: "numeric", month: "short" })

export default function OverdueTenantCard({ tenant, onNotify }: Props) {
    // Sent during this visit; a reminder sent earlier only shows its date, and another one can still be sent
    const [sent, setSent] = useState(false)
    const [remindedAt, setRemindedAt] = useState(tenant.reminded_at ?? null)
    const [pending, setPending] = useState(false)

    const notify = () => {
        setPending(true)
        onNotify()
            .then(() => {
                setSent(true)
                setRemindedAt(new Date().toISOString())
            })
            .catch(console.error)
            .finally(() => setPending(false))
    }
    const overdueTasks = [
        ["Veļa", tenant.last_laundry_date],
        ["Virtuve", tenant.last_kitchen_cleaning_date],
    ]
        .filter((task): task is [string, string] => task[1] != null)
        .map(([label, date]) => ({ label, days: daysSince(date) }))

    return (
        <article className="relative flex items-center gap-3 overflow-hidden rounded-[28px] bg-white px-4 py-5 text-black lg:gap-16 lg:px-9 lg:py-6">
            <span className="w-14 shrink-0 text-3xl font-extrabold italic tracking-tight text-[#a23a32] lg:w-20 lg:text-5xl">
                {tenant.room_number}
            </span>

            <div className="flex min-w-0 flex-1 flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex min-w-0 flex-col">
                    <span className="truncate text-lg lg:text-2xl">{tenant.name}</span>
                    <span className="truncate text-sm text-black/60 lg:text-lg">Istaba {tenant.room_number}</span>
                </div>

                <ul className="flex flex-wrap gap-2 lg:gap-3">
                    {overdueTasks.map(task => (
                        <li key={task.label} className="whitespace-nowrap rounded-full border border-black/60 px-3 py-1 text-sm lg:px-5 lg:py-2.5 lg:text-lg">
                            {task.label} · <span className="font-semibold text-[#a23a32]">{task.days} d.</span>
                        </li>
                    ))}
                    {remindedAt && (
                        <li className="whitespace-nowrap rounded-full bg-black/5 px-3 py-1 text-sm text-black/60 lg:px-5 lg:py-2.5 lg:text-lg">
                            Atgādināts {formatReminderDate(remindedAt)}
                        </li>
                    )}
                </ul>
            </div>

            <button
                type="button"
                onClick={notify}
                disabled={sent || pending}
                aria-label={sent ? `Atgādinājums nosūtīts: ${tenant.name}` : `Nosūtīt atgādinājumu: ${tenant.name}`}
                title={sent ? "Atgādinājums nosūtīts" : "Nosūtīt atgādinājumu"}
                className="grid size-10 shrink-0 cursor-pointer place-items-center rounded-full bg-black text-white transition hover:bg-black/80 disabled:cursor-default disabled:opacity-30 lg:size-16"
            >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="size-4 lg:size-6">
                    <path d="M6 8a6 6 0 1 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
                    <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
                </svg>
            </button>

            <span aria-hidden className="absolute right-6 bottom-0 left-6 h-0.5 bg-gradient-to-r from-[#a23a32] via-[#a23a32]/70 to-[#a23a32]/20" />
        </article>
    )
}
