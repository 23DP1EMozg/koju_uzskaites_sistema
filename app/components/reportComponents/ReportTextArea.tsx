import {TextareaHTMLAttributes} from "react";

type ReportTextAreaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
    label: string
    className?: string
}

export default function ReportTextArea ({label, className = "", id, ...textAreaProps}: ReportTextAreaProps) {
    return (
        <label htmlFor={id} className={`flex flex-col gap-1 rounded-[20px] bg-black/[0.03] px-5 pt-3 pb-3 text-white shadow-[0_4px_4px_rgba(0,0,0,0.25)] backdrop-blur-[22px] transition focus-within:bg-black/[0.08] ${className}`}>
            <span className={`text-xs tracking-wide text-white/90`}>{label}</span>
            <textarea id={id} className={`w-full h-24 resize-none border-b border-white/80 bg-transparent pb-1 text-base md:text-sm text-white outline-none`} {...textAreaProps}/>
        </label>
    )
}
