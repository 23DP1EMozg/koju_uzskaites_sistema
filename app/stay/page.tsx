import { redirect } from "next/navigation";
import Link from "next/link";
import { Inter } from "next/font/google";
import { getFloorTheme } from "@/app/helper/theme";
import { getCurrentUser } from "@/app/helper/auth/jwt";
import { createClient } from "@/app/lib/supabase/server";
import { WEEKEND_STAY_REASONS, WEEKEND_STAY_STATUSES, WeekendStay, formatStayDate, formatWeekend, getUpcomingWeekend } from "@/app/types/WeekendStay";
import StayForm from "./StayForm";
import { countMonthStays, syncStayCount } from "./stayCount";

const inter = Inter({
    subsets: ["latin", "latin-ext"],
    style: ["normal", "italic"],
})

const STATUS_STYLES: Record<string, string> = {
    pending: "border-black/40 text-black/70",
    approved: "border-[#3f9a5c] bg-[#3f9a5c] text-white",
    rejected: "border-[#c4473d] text-[#c4473d]",
}

const reasonLabel = (stay: WeekendStay) => {
    const label = stay.reason ? WEEKEND_STAY_REASONS[stay.reason] : "—"
    if (stay.reason === "event" && stay.event_date) return `${label} · ${formatStayDate(stay.event_date)}`
    if (stay.reason === "other" && stay.reason_text) return stay.reason_text
    return label
}

export default async function Stay() {
    const session = await getCurrentUser()
    if (!session) redirect("/login")

    const supabase = await createClient()
    const { data: user } = await supabase
        .from("users")
        .select("name, room_number")
        .eq("id", session.id)
        .maybeSingle()

    // The account was deleted while the session was still valid
    if (!user) redirect("/login")

    const room: number = user.room_number ?? 0
    // Floor is the first digit of the room number (e.g. 235 -> 2)
    const floor = room ? Number(String(room)[0]) : 0
    const theme = getFloorTheme(floor || null)

    // Latest requests first; a failed query just shows the empty state
    const { data: stays } = await supabase
        .from("weekend_stay_requests")
        .select("id, weekend_date, reason, event_date, reason_text, status")
        .eq("user_id", session.id)
        .order("weekend_date", { ascending: false })
        .limit(5)

    const myStays: WeekendStay[] = stays ?? []

    // Counts restart every month; syncing here also resets the stored count once a new month begins
    const weekend = getUpcomingWeekend()
    const monthStays = await countMonthStays(supabase, session.id, weekend).catch(() => null)
    if (monthStays != null) await syncStayCount(supabase, session.id, weekend).catch(console.error)

    return (
        <main
            style={{ backgroundImage: `url('${theme.homeBg}')` }}
            className={`${inter.className} relative flex min-h-dvh w-full flex-col items-center bg-cover bg-center bg-no-repeat pt-4 pb-10 md:pt-5 md:pb-16`}
        >
            <nav className="sticky top-4 z-50 flex h-12 w-[calc(100%-32px)] items-center gap-2 md:top-5 md:h-17 md:w-[95%]">
                <Link
                    href="/"
                    aria-label="Sākumlapa"
                    style={{ backgroundColor: theme.accentColor }}
                    className="grid aspect-square h-full shrink-0 place-items-center rounded-full text-white"
                >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-[40%]">
                        <path d="M15 18l-6-6 6-6" />
                    </svg>
                </Link>
            </nav>

            <div className="mt-auto flex w-[calc(100%-32px)] flex-col gap-8 pt-16 md:w-[95%] md:flex-row md:items-end md:justify-between md:gap-12">
                <div className="flex w-full flex-col gap-5 md:w-[50%] md:gap-7">
                    <div className="flex flex-col gap-3">
                        <p className="text-lg leading-none text-white/80 md:text-2xl">Brīvdienas</p>
                        <h1 className="text-5xl font-semibold leading-none text-white md:text-7xl">Palikšana</h1>
                    </div>

                    <div className="w-full rounded-[20px] bg-white px-5 pt-5 pb-6 md:rounded-[28px] md:px-7 md:pt-6 md:pb-7">
                        <div className="flex items-end justify-between gap-4">
                            <p className="text-3xl font-bold italic leading-none md:text-[40px]">Mani pieteikumi</p>
                            {monthStays != null && (
                                <p className="shrink-0 text-sm text-neutral-500">Šomēnes: <span className="font-semibold text-black">{monthStays}</span></p>
                            )}
                        </div>
                        {myStays.length === 0 ? (
                            <p className="mt-5 text-neutral-500 md:mt-6">Tu vēl neesi pieteicis palikšanu.</p>
                        ) : (
                            <ul style={{ borderColor: theme.accentColor }} className="mt-5 flex flex-col gap-4 border-l-4 pl-5 md:mt-6">
                                {myStays.map(stay => (
                                    <li key={stay.id} className="flex items-start justify-between gap-4">
                                        <div className="min-w-0">
                                            <p className="text-lg">{stay.weekend_date ? formatWeekend(stay.weekend_date) : "—"}</p>
                                            <p className="truncate text-sm text-neutral-500">{reasonLabel(stay)}</p>
                                        </div>
                                        <span className={`shrink-0 whitespace-nowrap rounded-full border px-3 py-1 text-xs md:text-sm ${STATUS_STYLES[stay.status ?? "pending"]}`}>
                                            {WEEKEND_STAY_STATUSES[stay.status ?? "pending"]}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>

                <StayForm accentColor={theme.accentColor} weekend={weekend} />
            </div>
        </main>
    )
}
