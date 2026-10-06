import { InputHTMLAttributes } from "react";

type Props = InputHTMLAttributes<HTMLInputElement> & {
    label: string,
    className?: string,
}

export default function InputField({ label, className = "", id, ...inputProps }: Props) {
    return (
        <label
            htmlFor={id}
            className={`flex flex-col gap-1 rounded-2xl bg-white/10 px-6 pt-4 pb-4 text-white shadow-[0_4px_14px_rgba(0,0,0,0.18)] backdrop-blur-sm transition focus-within:bg-white/15 focus-within:ring-1 focus-within:ring-white/60 ${className}`}
        >
            <span className="text-xs tracking-wide text-white/90">{label}</span>
            <input
                id={id}
                className="w-full border-b border-white/80 bg-transparent pb-1 text-sm text-white outline-none placeholder:text-white/45"
                {...inputProps}
            />
        </label>
    )
}
