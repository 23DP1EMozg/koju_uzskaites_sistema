import { redirect } from "next/navigation";
import Link from "next/link";
import { Inter } from "next/font/google";
import { getFloorTheme } from "@/app/helper/theme";
import { getCurrentUser } from "@/app/helper/auth/jwt";
import { createClient } from "@/app/lib/supabase/server";
import { logoutUser } from "@/app/login/actions";
import PasswordForm from "./PasswordForm";

const inter = Inter({
    subsets: ["latin", "latin-ext"],
    style: ["normal", "italic"],
})

export default async function Profile() {
    const session = await getCurrentUser()
    if (!session) redirect("/login")

    const supabase = await createClient()
    const { data: user } = await supabase
        .from("users")
        .select("name, email, phone_number, social_security_number, room_number, course")
        .eq("id", session.id)
        .maybeSingle()

    // The account was deleted while the session was still valid
    if (!user) redirect("/login")

    const room: number = user.room_number ?? 0
    // Floor is the first digit of the room number (e.g. 235 -> 2)
    const floor = room ? Number(String(room)[0]) : 0
    const theme = getFloorTheme(floor || null)

    // Everything here is read-only; only the password can be changed
    const details: [string, string | number | null | undefined][] = [
        ["Personas kods", user.social_security_number],
        ["Istaba", room ? String(room).padStart(3, "0") : null],
        ["Kurss", user.course],
        ["Tel. numurs", user.phone_number],
        ["E-pasts", user.email],
    ]

    return (
        <main
            style={{ backgroundImage: `url('${theme.homeBg}')` }}
            className={`${inter.className} relative flex min-h-dvh w-full flex-col items-center bg-cover bg-center bg-no-repeat pt-4 pb-10 md:pt-5 md:pb-16`}
        >
            <nav className="flex h-12 w-[calc(100%-32px)] items-center gap-2 md:h-17 md:w-[95%]">
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
                <form action={logoutUser} className="h-full">
                    <button
                        type="submit"
                        aria-label="Iziet"
                        style={{ backgroundColor: theme.accentColor }}
                        className="grid aspect-square h-full shrink-0 cursor-pointer place-items-center rounded-full"
                    >
                        <img src="/icons/log-outIcon.svg" alt="" className="h-[40%]" />
                    </button>
                </form>
            </nav>

            <div className="mt-auto flex w-[calc(100%-32px)] flex-col gap-8 pt-16 md:w-[95%] md:flex-row md:items-end md:justify-between md:gap-12">
                <div className="flex w-full flex-col gap-5 md:w-[50%] md:gap-7">
                    <div className="flex flex-col gap-3">
                        <p className="text-lg leading-none text-white/80 md:text-2xl">Mans profils</p>
                        <h1 className="text-5xl font-semibold leading-none text-white md:text-7xl">{user.name}</h1>
                    </div>

                    <div className="w-full rounded-[20px] bg-white px-5 pt-5 pb-6 md:rounded-[28px] md:px-7 md:pt-6 md:pb-7">
                        <p className="text-3xl font-bold italic leading-none md:text-[40px]">Mani dati</p>
                        <dl style={{ borderColor: theme.accentColor }} className="mt-5 grid grid-cols-1 gap-x-10 gap-y-4 border-l-4 pl-5 sm:grid-cols-2 md:mt-6">
                            {details.map(([label, value]) => (
                                <div key={label} className="min-w-0">
                                    <dt className="text-sm text-neutral-500">{label}</dt>
                                    <dd className="truncate text-lg">{value || "—"}</dd>
                                </div>
                            ))}
                        </dl>
                        <p className="mt-5 text-sm text-neutral-500">
                            Ja dati ir nepareizi, sazinies ar administrāciju.
                        </p>
                    </div>
                </div>

                <PasswordForm accentColor={theme.accentColor} />
            </div>
        </main>
    )
}
