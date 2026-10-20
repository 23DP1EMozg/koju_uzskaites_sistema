"use client"

import { Complaint } from "../types/Complaint"
import { User } from "../types/User"

type Props = {
    complaint: Complaint,
    sender?: User,
    onView: () => void,
}

export const formatComplaintDate = (date?: string) =>
    date ? new Date(date).toLocaleDateString("lv-LV", { day: "numeric", month: "long", year: "numeric" }) : "—"

export const complaintSenderLabel = (sender?: User) =>
    sender
        ? [sender.name, sender.room_number != null ? `Istaba ${sender.room_number}` : null].filter(Boolean).join(" · ")
        : "Nezināms iemītnieks"

export default function ComplaintCard({ complaint, sender, onView }: Props) {
    const date = complaint.created_at ? new Date(complaint.created_at) : null

    return (
        <article className="relative flex items-center gap-4 overflow-hidden rounded-[28px] bg-white px-5 py-5 text-black lg:gap-16 lg:px-9 lg:py-6">
            <div className="flex w-14 shrink-0 flex-col items-start lg:w-20">
                <span className="text-3xl font-extrabold italic leading-none tracking-tight text-[#a23a32] lg:text-5xl">
                    {date ? date.getDate() : "—"}
                </span>
                {date && (
                    <span className="mt-1 text-sm text-black/60 lg:text-base">
                        {date.toLocaleDateString("lv-LV", { month: "short" })}
                    </span>
                )}
            </div>

            <div className="flex min-w-0 flex-1 flex-col gap-1">
                <p className="line-clamp-2 break-words text-lg lg:text-2xl">{complaint.description}</p>
                <span className="truncate text-sm text-black/60 lg:text-lg">{complaintSenderLabel(sender)}</span>
            </div>

            <button
                type="button"
                onClick={onView}
                aria-label="Skatīt sūdzību"
                className="grid size-10 shrink-0 cursor-pointer place-items-center rounded-full bg-black text-white transition hover:bg-black/80 lg:size-16"
            >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-4 lg:size-5">
                    <path d="M7 17 17 7" />
                    <path d="M8 7h9v9" />
                </svg>
            </button>

            <span aria-hidden className="absolute right-6 bottom-0 left-6 h-0.5 bg-gradient-to-r from-[#a23a32] via-[#a23a32]/70 to-[#a23a32]/20" />
        </article>
    )
}
