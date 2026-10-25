"use client"

import { MouseEvent } from "react"
import Link from "next/link"
import { logoutUser } from "../login/actions"

export type NavItem = {
    id: string,
    label: string,
}

type Props = {
    items: NavItem[],
    activeId: string,
    hasNotifications: boolean,
}

function scrollToSection(e: MouseEvent<HTMLAnchorElement>, id: string) {
    const target = document.getElementById(id)
    if (!target) return

    e.preventDefault()
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    target.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" })
    history.replaceState(null, "", `#${id}`)
}

export default function AdminNav({ items, activeId, hasNotifications }: Props) {
    return (
        <nav className="fixed inset-x-4 top-6 z-50 flex items-center justify-between gap-4 lg:inset-x-[3.25rem] lg:top-8">
            <div className="flex shrink-0 items-center gap-2">
                <form action={logoutUser}>
                    <button
                        type="submit"
                        aria-label="Iziet"
                        className="grid size-12 cursor-pointer shrink-0 place-items-center rounded-full bg-[#a23a32] text-white shadow-lg transition hover:bg-[#8a2f29] lg:size-[4.9rem]"
                    >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="size-5 lg:size-[1.7rem]">
                            <path d="M10 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h4" />
                            <path d="M14 8l4 4-4 4" />
                            <path d="M18 12H9" />
                        </svg>
                    </button>
                </form>
                <Link
                    href="/"
                    aria-label="Sākumlapa"
                    className="grid size-12 shrink-0 place-items-center rounded-full bg-[#a23a32] text-white shadow-lg transition hover:bg-[#8a2f29] lg:size-[4.9rem]"
                >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="size-5 lg:size-[1.7rem]">
                        <path d="M3 11l9-7 9 7" />
                        <path d="M5 10v10h14V10" />
                        <path d="M10 20v-6h4v6" />
                    </svg>
                </Link>
            </div>

            {/* A scrollable bar at the bottom of the screen on phones, inline on wider screens */}
            <ul className="fixed inset-x-4 bottom-4 z-40 flex items-center overflow-x-auto rounded-full bg-white p-1.5 shadow-[0_4px_14px_rgba(0,0,0,0.25)] [scrollbar-width:none] md:static md:z-auto md:flex-1 md:overflow-visible md:p-2.5 lg:max-w-[1200px]">
                {items.map(item => (
                    <li key={item.id} className="shrink-0 md:flex-1">
                        <a
                            href={`#${item.id}`}
                            onClick={e => scrollToSection(e, item.id)}
                            className={`block whitespace-nowrap rounded-full px-4 py-3 text-center text-sm transition md:px-0 md:py-2.5 md:text-xs lg:py-3.5 lg:text-[0.95rem] ${
                                activeId === item.id
                                    ? "bg-[#a23a32] text-white"
                                    : "text-neutral-600 hover:text-black"
                            }`}
                        >
                            {item.label}
                        </a>
                    </li>
                ))}
            </ul>

            {/* The dot means new applications are waiting, so the bell leads to them */}
            <a
                href={`#${items[0].id}`}
                onClick={e => scrollToSection(e, items[0].id)}
                aria-label={hasNotifications ? "Jauni pieteikumi" : "Pieteikumi"}
                title={hasNotifications ? "Jauni pieteikumi" : "Nav jaunu pieteikumu"}
                className="relative grid size-12 shrink-0 place-items-center rounded-full bg-[#a23a32] text-white shadow-lg transition hover:bg-[#8a2f29] lg:size-[4.9rem]"
            >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="size-5 lg:size-[1.7rem]">
                    <path d="M6 8a6 6 0 1 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
                    <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
                </svg>
                {hasNotifications && (
                    <span className="absolute top-2.5 right-2.5 size-2 rounded-full bg-white lg:top-4 lg:right-4 lg:size-3" />
                )}
            </a>
        </nav>
    )
}
