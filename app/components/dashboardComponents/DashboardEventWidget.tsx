import BulletBtn from "@/app/components/BulletBtn";
type DashboardEventWidgetProps = {
    title: string
    highlight: string
    date: string
    bgImage?: string
}

export default function DashboardEventWidget ({title, highlight, date, bgImage}: DashboardEventWidgetProps) {
    return (
        <div style={bgImage ? {backgroundImage: `url('${bgImage}')`} : undefined} className="flex-1 flex flex-col justify-between rounded-[28px] h-61 bg-white bg-cover bg-center pt-3.5 pl-5 pr-4 pb-6">
            <div className={`flex flex-row items-start justify-between w-full`}>
                <p className={`max-w-[55%] font-medium leading-tight pt-1.5`}>{title}</p>
                <BulletBtn color={"#000000"} invertArrow/>
            </div>
            <div className={`flex flex-col gap-2.5`}>
                <p className={`text-[40px] font-bold italic leading-none`}>{highlight}</p>
                <p className={`text-[22px] leading-none`}>{date}</p>
            </div>
        </div>
    )
}
