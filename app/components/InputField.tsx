import { InputHTMLAttributes, ReactNode } from "react";

type Props = InputHTMLAttributes<HTMLInputElement> & {
    label: string,
    className?: string,
    // Optional element shown at the end of the input line, e.g. a show-password toggle
    trailing?: ReactNode,
    // Validation message shown under the input
    error?: string,
}

export default function InputField({ label, className = "", id, trailing, error, ...inputProps }: Props) {
    return (
        <label
            htmlFor={id}
            className={`flex flex-col gap-1 rounded-2xl bg-white/10 px-6 pt-4 pb-4 text-white shadow-[0_4px_14px_rgba(0,0,0,0.18)] backdrop-blur-sm transition focus-within:bg-white/15 focus-within:ring-1 focus-within:ring-white/60 ${className}`}
        >
            <span className="text-xs tracking-wide text-white/90">{label}</span>
            <span className={`flex items-center gap-2 border-b pb-1 ${error ? "border-[#ffb4ab]" : "border-white/80"}`}>
                <input
                    id={id}
                    aria-invalid={error ? true : undefined}
                    aria-describedby={error && id ? `${id}_error` : undefined}
                    className="w-full min-w-0 bg-transparent text-sm text-white outline-none placeholder:text-white/45"
                    {...inputProps}
                />
                {trailing}
            </span>
            <FieldError id={id} error={error} />
        </label>
    )
}

// Shared by the other form fields so every validation message looks the same
export function FieldError({ id, error }: { id?: string, error?: string }) {
    if (!error) return null
    return (
        <span id={id ? `${id}_error` : undefined} role="alert" className="flex items-start gap-1.5 text-xs font-medium text-white">
            <svg viewBox="0 0 24 24" fill="none" stroke="#ffb4ab" strokeWidth="2.2" strokeLinecap="round" className="mt-px size-3.5 shrink-0">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 7v6M12 17h.01" />
            </svg>
            {error}
        </span>
    )
}
