import BulletBtn from "@/app/components/BulletBtn";
type DashboardAccentColorWidgetProps = {
    accentColor: string
    text: string
    date: string
}
export default function DashboardAccentColorWidget ({accentColor, date, text}: DashboardAccentColorWidgetProps) {
    return (
        <div style={{background: accentColor}} className="flex-1 flex flex-col justify-between rounded-3xl h-32 text-white pt-3 pl-6 pr-3">
            <div className={`flex flex-row items-start justify-between w-full`}>
                <p className={`max-w-[55%] text-[22px] leading-tight pt-1`}>{text}</p>
                <BulletBtn color={"#FFFFFF"}/>
            </div>
            <p className={`w-full text-right text-[42px] font-bold italic leading-none -mb-1`}>{date}</p>
        </div>
    )
}
