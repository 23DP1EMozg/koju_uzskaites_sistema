import {InputHTMLAttributes} from "react";

type ReportInputFieldProps = InputHTMLAttributes<HTMLInputElement> & {
    label: string
    className?: string
}

export default function ReportInputField ({label, className = "", id, ...inputProps}: ReportInputFieldProps) {
    return (
        <label htmlFor={id} className={`flex flex-col gap-1 rounded-[20px] bg-black/[0.03] px-5 pt-3 pb-3 text-white shadow-[0_4px_4px_rgba(0,0,0,0.25)] backdrop-blur-[22px] transition focus-within:bg-black/[0.08] ${className}`}>
            <span className={`text-xs tracking-wide text-white/90`}>{label}</span>
            <input id={id} className={`w-[85%] border-b border-white/80 bg-transparent pb-1 text-base md:text-sm text-white outline-none`} {...inputProps}/>
        </label>
    )
}
