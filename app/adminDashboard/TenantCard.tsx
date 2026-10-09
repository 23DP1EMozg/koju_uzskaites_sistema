"use client"

import { User } from "../types/User"

type Props = {
    tenant: User
    onDelete: () => void,
    onView: () => void
}

export default function TenantCard({ tenant, onView, onDelete }: Props) {
    const subtitle = [
        tenant.room_number != null ? `Istaba ${tenant.room_number}` : null,
        tenant.course,
    ].filter(Boolean).join(" · ")

    return (
        <article className="relative flex items-center gap-5 overflow-hidden rounded-[28px] bg-black px-6 py-5 text-white lg:gap-16 lg:px-9 lg:py-6">
            <span className="w-16 shrink-0 text-3xl font-extrabold italic tracking-tight text-[#a23a32] lg:w-20 lg:text-5xl">
                {tenant.room_number ?? "—"}
            </span>

            <div className="flex min-w-0 flex-1 flex-col">
                <span className="truncate text-lg lg:text-2xl">{tenant.name}</span>
                {subtitle && <span className="truncate text-sm text-white/60 lg:text-lg">{subtitle}</span>}
            </div>

            <div className="flex shrink-0 items-center gap-3">
                <button
                    type="button"
                    onClick={onDelete}
                    className="cursor-pointer rounded-full border border-white/60 px-4 py-2 text-sm transition hover:bg-white/10 lg:px-6 lg:py-3 lg:text-lg"
                >
                    Dzēst
                </button>
                <button
                    type="button"
                    onClick={onView}
                    aria-label={`Skatīt ${tenant.name ?? "iemītnieku"}`}
                    className="grid size-10 cursor-pointer place-items-center rounded-full bg-white text-black transition hover:bg-white/85 lg:size-16"
                >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-4 lg:size-5">
                        <path d="M7 17 17 7" />
                        <path d="M8 7h9v9" />
                    </svg>
                </button>
            </div>

            <span aria-hidden className="absolute right-6 bottom-0 left-6 h-0.5 bg-gradient-to-r from-[#a23a32] via-[#a23a32]/70 to-[#a23a32]/20" />
        </article>
    )
}
