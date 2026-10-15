import BulletBtn from "@/app/components/BulletBtn";
type DashboardAccentColorWidgetProps = {
    accentColor: string
    text: string
    date: string
}
export default function DashboardAccentColorWidget ({accentColor, date, text}: DashboardAccentColorWidgetProps) {
    return (
        <div style={{background: accentColor}} className="flex-1 min-w-0 flex flex-col justify-between rounded-2xl md:rounded-3xl h-28 md:h-32 text-white pt-3 pl-4 md:pl-6 pr-3">
            <div className={`flex flex-row items-start justify-between gap-2 w-full`}>
                <p className={`md:max-w-[55%] text-base md:text-[22px] leading-tight pt-1`}>{text}</p>
                <BulletBtn color={"#FFFFFF"} size={"size-9 md:size-11"}/>
            </div>
            <p className={`w-full text-right text-2xl md:text-[42px] font-bold italic leading-none -mb-1`}>{date}</p>
        </div>
    )
}
