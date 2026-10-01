import BulletBtn from "@/app/components/BulletBtn";
type DashboardAccentColorWidgetProps = {
    accentColor: string
    text: string
    date: string
}
export default function DashboardAccentColorWidget ({accentColor, date, text}: DashboardAccentColorWidgetProps) {
    return (
        <div style={{background: accentColor}} className="w-1/2 flex flex-col items-center justify-between w-[48%] rounded-xl h-[7vh] text-white p-1.5">
            <div className={`flex flex-row items-start justify-between w-full`}>
            <p className={`w-[50%]`}>{text}</p>
            <BulletBtn color={"#FFFFFF"}/>
            </div>
            <p className={`w-full text-right text-2xl font-semibold italic mt-3`}>{date}</p>
        </div>
    )
}