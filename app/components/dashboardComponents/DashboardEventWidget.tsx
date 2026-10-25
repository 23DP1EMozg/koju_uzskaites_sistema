type DashboardEventWidgetProps = {
    title: string
    highlight: string
    date: string
    bgImage?: string
}

export default function DashboardEventWidget ({title, highlight, date, bgImage}: DashboardEventWidgetProps) {
    return (
        <div style={bgImage ? {backgroundImage: `url('${bgImage}')`} : undefined} className="flex-1 min-w-0 flex flex-col justify-between rounded-[20px] md:rounded-[28px] h-44 md:h-61 bg-white bg-cover bg-center pt-3 md:pt-3.5 pl-4 md:pl-5 pr-3 md:pr-4 pb-4 md:pb-6">
            <p className={`max-w-[60%] md:max-w-[55%] text-sm md:text-base font-medium leading-tight pt-1.5`}>{title}</p>
            <div className={`flex flex-col gap-1.5 md:gap-2.5`}>
                <p className={`text-2xl md:text-[28px] xl:text-[40px] font-bold italic leading-none break-words`}>{highlight}</p>
                <p className={`text-base md:text-[22px] leading-none`}>{date}</p>
            </div>
        </div>
    )
}
