import { ButtonHTMLAttributes } from "react";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
    pending?: boolean,
    pendingText?: string,
}

export default function ApplyButton({
    pending = false,
    pendingText = "Sūta...",
    className = "",
    children = "Pieteikties",
    disabled,
    type = "submit",
    ...buttonProps
}: Props) {
    return (
        <button
            type={type}
            disabled={disabled || pending}
            className={`rounded-2xl bg-white py-5 text-black shadow-[0_4px_14px_rgba(0,0,0,0.18)] transition hover:bg-white/85 disabled:opacity-60 ${className}`}
            {...buttonProps}
        >
            {pending ? pendingText : children}
        </button>
    )
}
