"use client"

import { useState } from "react"
import { User } from "../types/User"
import { WEEKEND_STAY_REASONS, WEEKEND_STAY_STATUSES, WeekendStay, formatStayDate, formatWeekend } from "../types/WeekendStay"
import { complaintSenderLabel } from "./ComplaintCard"

type Props = {
    stay: WeekendStay & { month_stay_count: number },
    tenant?: User,
    onDecide: (status: "approved" | "rejected") => Promise<void>,
}

export default function WeekendStayCard({ stay, tenant, onDecide }: Props) {
    const [pending, setPending] = useState(false)

    const decide = (status: "approved" | "rejected") => {
        setPending(true)
        onDecide(status).catch(console.error).finally(() => setPending(false))
    }

    const reason = stay.reason ? WEEKEND_STAY_REASONS[stay.reason] : "—"
    const detail = stay.reason === "event" && stay.event_date
        ? formatStayDate(stay.event_date)
        : stay.reason === "other" ? stay.reason_text : null

    return (
        <article className="relative flex flex-col gap-4 overflow-hidden rounded-[28px] bg-white px-5 py-5 text-black lg:flex-row lg:items-center lg:gap-16 lg:px-9 lg:py-6">
            <span className="shrink-0 text-2xl font-extrabold italic leading-none tracking-tight text-[#a23a32] lg:w-48 lg:text-3xl">
                {stay.weekend_date ? formatWeekend(stay.weekend_date) : "—"}
            </span>

            <div className="flex min-w-0 flex-1 flex-col gap-1">
                <span className="truncate text-lg lg:text-2xl">
                    {complaintSenderLabel(tenant)}
                    <span className="text-black/60"> · {stay.month_stay_count} šomēnes</span>
                </span>
                <span className="break-words text-sm text-black/60 lg:text-lg">
                    {reason}{detail ? ` · ${detail}` : ""}
                </span>
            </div>

            {stay.status === "pending" ? (
                <div className="flex shrink-0 gap-2">
                    <button
                        type="button"
                        onClick={() => decide("rejected")}
                        disabled={pending}
                        className="cursor-pointer rounded-full border border-black px-5 py-2.5 text-sm transition hover:bg-black/5 disabled:opacity-40 lg:px-7 lg:py-3.5 lg:text-base"
                    >
                        Noraidīt
                    </button>
                    <button
                        type="button"
                        onClick={() => decide("approved")}
                        disabled={pending}
                        className="cursor-pointer rounded-full bg-black px-5 py-2.5 text-sm text-white transition hover:bg-black/80 disabled:opacity-40 lg:px-7 lg:py-3.5 lg:text-base"
                    >
                        Apstiprināt
                    </button>
                </div>
            ) : (
                <span className={`shrink-0 self-start whitespace-nowrap rounded-full border px-4 py-1.5 text-sm lg:self-center lg:text-base ${
                    stay.status === "approved" ? "border-[#3f9a5c] text-[#3f9a5c]" : "border-[#a23a32] text-[#a23a32]"
                }`}>
                    {WEEKEND_STAY_STATUSES[stay.status ?? "pending"]}
                </span>
            )}

            <span aria-hidden className="absolute right-6 bottom-0 left-6 h-0.5 bg-gradient-to-r from-[#a23a32] via-[#a23a32]/70 to-[#a23a32]/20" />
        </article>
    )
}
