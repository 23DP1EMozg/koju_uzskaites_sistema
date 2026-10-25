import Link from "next/link";

export default function NotFound() {
    return (
        <main className="flex min-h-dvh flex-col items-center justify-center gap-6 bg-[#2a0b09] px-4 text-center text-white">
            <span className="text-8xl font-extrabold italic tracking-tight text-[#a23a32] lg:text-[10rem]">404</span>
            <h1 className="text-2xl font-medium lg:text-4xl">Lapa nav atrasta</h1>
            <p className="max-w-md text-white/70 lg:text-lg">Šāda lapa neeksistē vai ir pārvietota.</p>
            <Link
                href="/"
                className="rounded-full bg-white px-8 py-4 text-lg text-black transition hover:bg-white/85"
            >
                Uz sākumlapu
            </Link>
        </main>
    )
}
