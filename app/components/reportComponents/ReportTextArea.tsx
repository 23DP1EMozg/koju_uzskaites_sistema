import {TextareaHTMLAttributes} from "react";
import { FieldError } from "../InputField";

type ReportTextAreaProps = Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "onChange"> & {
    label: string
    className?: string
    onChange?: (value: string) => void // Must be (value: string) => void
    error?: string
}

export default function ReportTextArea ({label, className = "" ,id, onChange, error, ...textAreaProps}: ReportTextAreaProps) {
    return (
        <label htmlFor={id} className={`flex flex-col gap-1 rounded-[20px] bg-black/[0.03] px-5 pt-3 pb-3 text-white shadow-[0_4px_4px_rgba(0,0,0,0.25)] backdrop-blur-[22px] transition focus-within:bg-black/[0.08] ${className}`}>
            <span className={`text-xs tracking-wide text-white/90`}>{label}</span>
            <textarea id={id} aria-invalid={error ? true : undefined} aria-describedby={error && id ? `${id}_error` : undefined} className={`w-full h-24 resize-none border-b ${error ? "border-[#ffb4ab]" : "border-white/80"} bg-transparent pb-1 text-sm text-white outline-none`} {...textAreaProps} onChange={(e) => onChange?.(e.target.value)}/>
            <FieldError id={id} error={error}/>
        </label>
    )
}
