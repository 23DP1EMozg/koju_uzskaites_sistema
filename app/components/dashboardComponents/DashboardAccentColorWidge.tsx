'use client'
import BulletBtn from "@/app/components/BulletBtn";
import {useState} from "react";

type DashboardAccentColorWidgetProps = {
    accentColor: string
    text: string
    date: string
    onApply?: () => void
}
export default function DashboardAccentColorWidget ({accentColor, date, text, onApply}: DashboardAccentColorWidgetProps) {
    const [expanded, setExpanded] = useState(false)
    return (
        <div style={{background: accentColor}} className="flex-1 min-w-0 flex flex-col rounded-2xl md:rounded-3xl min-h-28 md:min-h-32 text-white pt-3 pl-4 md:pl-6 pr-3">
            <div className={`flex flex-row items-start justify-between gap-2 w-full`}>
                <p className={`md:max-w-[55%] text-base md:text-[22px] leading-tight pt-1`}>{text}</p>
                {/* Only widgets with an action can be expanded, so no button leads nowhere */}
                {onApply && (
                    <button onClick={() => setExpanded(!expanded)} aria-expanded={expanded} aria-label={text} className={`cursor-pointer transition-transform duration-500 ${expanded ? 'rotate-90' : ''}`}>
                        <BulletBtn color={"#FFFFFF"} size={"size-9 md:size-11"}/>
                    </button>
                )}
            </div>
            <p className={`w-full mt-auto text-right text-2xl md:text-[42px] font-bold italic leading-none -mb-1`}>{date}</p>
            {onApply && <div className={`grid transition-[grid-template-rows] duration-500 ${expanded ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
                <div className={`overflow-hidden`}>
                    <div className={`pt-4 md:pt-5 pb-3 md:pb-4`}>
                        <button type={"button"} onClick={onApply} tabIndex={expanded ? 0 : -1} className={`bg-white text-black rounded-[14px] md:rounded-[18px] w-full md:w-1/2 h-10 md:h-14 text-base md:text-[20px] cursor-pointer`}>
                            Pieteikt
                        </button>
                    </div>
                </div>
            </div>}
        </div>
    )
}
