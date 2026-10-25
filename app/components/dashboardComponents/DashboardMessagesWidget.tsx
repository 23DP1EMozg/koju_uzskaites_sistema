type DashboardMessagesWidgetProps = {
    accentColor: string
    message: string
}
export default function DashboardMessagesWidget ({accentColor, message}: DashboardMessagesWidgetProps) {
    return (
        <div className="w-full flex flex-col gap-4 rounded-[20px] md:rounded-[28px] md:h-60 bg-white pt-3 md:pt-3.5 pl-5 md:pl-7 pr-3 md:pr-4 pb-5 md:pb-6">
            <p className={`text-3xl md:text-[40px] font-bold italic leading-none pt-2`}>Ziņojumi</p>
            <div className={`flex flex-row gap-4 pr-2 md:pr-20`}>
                <span style={{background: accentColor}} className={`w-1 shrink-0 rounded-full`}/>
                <p className={`text-[15px] leading-[1.25] line-clamp-6`}>{message}</p>
            </div>
        </div>
    )
}
