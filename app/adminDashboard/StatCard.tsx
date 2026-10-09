type Props = {
    label: string,
    value: number,
    digits: number,
    variant: "light" | "red",
}

export default function StatCard({ label, value, digits, variant }: Props) {
    const isLight = variant === "light"

    return (
        <div
            className={`flex aspect-[437/314] min-w-0 flex-1 flex-col justify-between rounded-[28px] p-6 lg:p-8 ${
                isLight ? "bg-white text-black" : "bg-[#a23a32] text-white"
            }`}
        >
            <span className="max-w-[9rem] text-base leading-snug lg:text-xl">{label}</span>
            <span
                className={`text-6xl font-extrabold italic leading-none tracking-tight lg:text-[7rem] ${
                    isLight ? "text-[#a23a32]" : "text-white"
                }`}
            >
                {String(value).padStart(digits, "0")}
            </span>
        </div>
    )
}
