"use client"

import { MouseEvent } from "react"
import Link from "next/link"

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
        <nav className="flex items-center justify-between gap-4">
            <Link
                href="/login"
                aria-label="Iziet"
                className="grid size-12 shrink-0 place-items-center rounded-full bg-[#a23a32] text-white shadow-lg transition hover:bg-[#8a2f29] lg:size-[4.9rem]"
            >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="size-5 lg:size-[1.7rem]">
                    <path d="M10 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h4" />
                    <path d="M14 8l4 4-4 4" />
                    <path d="M18 12H9" />
                </svg>
            </Link>

            <ul className="hidden flex-1 items-center rounded-full bg-white p-2.5 md:flex lg:max-w-[1200px]">
                {items.map(item => (
                    <li key={item.id} className="flex-1">
                        <a
                            href={`#${item.id}`}
                            onClick={e => scrollToSection(e, item.id)}
                            className={`block rounded-full py-2.5 text-center text-xs transition lg:py-3.5 lg:text-[0.95rem] ${
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

            <button
                type="button"
                aria-label="Paziņojumi"
                className="relative grid size-12 shrink-0 place-items-center rounded-full bg-[#a23a32] text-white shadow-lg transition hover:bg-[#8a2f29] lg:size-[4.9rem]"
            >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="size-5 lg:size-[1.7rem]">
                    <path d="M6 8a6 6 0 1 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
                    <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
                </svg>
                {hasNotifications && (
                    <span className="absolute top-2.5 right-2.5 size-2 rounded-full bg-white lg:top-4 lg:right-4 lg:size-3" />
                )}
            </button>
        </nav>
    )
}
