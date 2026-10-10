import BulletBtn from "@/app/components/BulletBtn";
type DashboardMessagesWidgetProps = {
    accentColor: string
    message: string
}
export default function DashboardMessagesWidget ({accentColor, message}: DashboardMessagesWidgetProps) {
    return (
        <div className="w-full flex flex-col gap-4 rounded-[28px] h-60 bg-white pt-3.5 pl-7 pr-4 pb-6">
            <div className={`flex flex-row items-start justify-between w-full`}>
                <p className={`text-[40px] font-bold italic leading-none pt-2`}>Zinojumi</p>
                <BulletBtn color={"#000000"} invertArrow/>
            </div>
            <div className={`flex flex-row gap-4 pr-20`}>
                <span style={{background: accentColor}} className={`w-1 shrink-0 rounded-full`}/>
                <p className={`text-[15px] leading-[1.25] line-clamp-6`}>{message}</p>
            </div>
        </div>
    )
}
