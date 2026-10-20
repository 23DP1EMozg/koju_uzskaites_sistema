"use client"

import { useRef, useState } from "react"

type Props = {
    page: number,
    pageCount: number,
    onChange: (page: number) => void,
    variant: "dark" | "light",
}

// Pages to show around the current one; gaps become "…"
const pageNumbers = (page: number, pageCount: number): (number | null)[] => {
    const pages: (number | null)[] = []
    for (let p = 1; p <= pageCount; p++) {
        if (p === 1 || p === pageCount || Math.abs(p - page) <= 1) {
            pages.push(p)
        } else if (pages[pages.length - 1] !== null) {
            pages.push(null)
        }
    }
    return pages
}

export function usePagination<T>(items: T[], pageSize: number) {
    const [page, setPage] = useState(1)
    const pageCount = Math.max(1, Math.ceil(items.length / pageSize))
    // Stay in range when items are removed (e.g. after a delete)
    const currentPage = Math.min(page, pageCount)

    return {
        page: currentPage,
        pageCount,
        setPage,
        pageItems: items.slice((currentPage - 1) * pageSize, currentPage * pageSize),
    }
}

export default function Pagination({ page, pageCount, onChange, variant }: Props) {
    const navRef = useRef<HTMLElement>(null)

    if (pageCount <= 1) return null

    // Bring the top of the section back into view, otherwise a shorter page leaves you further down the dashboard
    const goToPage = (p: number) => {
        onChange(p)
        const section = navRef.current?.closest("section")
        if (!section) return
        const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches
        section.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" })
    }

    const isDark = variant === "dark"
    const arrowClass = `grid size-10 cursor-pointer place-items-center rounded-full border transition disabled:cursor-default disabled:opacity-30 lg:size-12 ${
        isDark ? "border-white/60 hover:bg-white/10" : "border-black/60 hover:bg-black/5"
    }`

    return (
        <nav ref={navRef} aria-label="Lapas" className="mt-8 flex items-center justify-center gap-2 lg:mt-12 lg:gap-3">
            <button type="button" onClick={() => goToPage(page - 1)} disabled={page === 1} aria-label="Iepriekšējā lapa" className={arrowClass}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-4">
                    <path d="M15 6l-6 6 6 6" />
                </svg>
            </button>

            {pageNumbers(page, pageCount).map((p, i) =>
                p === null ? (
                    <span key={`gap-${i}`} className={isDark ? "px-1 text-white/60" : "px-1 text-black/60"}>…</span>
                ) : (
                    <button
                        type="button"
                        key={p}
                        onClick={() => goToPage(p)}
                        aria-label={`Lapa ${p}`}
                        aria-current={p === page ? "page" : undefined}
                        className={`grid size-10 cursor-pointer place-items-center rounded-full text-lg transition lg:size-12 ${
                            p === page
                                ? "bg-[#a23a32] text-white"
                                : isDark ? "text-white/75 hover:bg-white/10" : "text-black/70 hover:bg-black/5"
                        }`}
                    >
                        {p}
                    </button>
                )
            )}

            <button type="button" onClick={() => goToPage(page + 1)} disabled={page === pageCount} aria-label="Nākamā lapa" className={arrowClass}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-4">
                    <path d="M9 6l6 6-6 6" />
                </svg>
            </button>
        </nav>
    )
}
