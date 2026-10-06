import BulletBtn from "@/app/components/BulletBtn";

export type NotificationEvent = {
    title: string
    date: string
    description: string
}

type NotificationEventCardProps = {
    heading: string
    event: NotificationEvent
    bgImage: string
    slideCount: number
    activeSlide: number
    slideDuration: number
    onSlideChange: (index: number) => void
    onSlideEnd: () => void
}

export default function EventCard ({heading, event, bgImage, slideCount, activeSlide, slideDuration, onSlideChange, onSlideEnd}: NotificationEventCardProps) {
    return (
        <div style={{backgroundImage: `url('${bgImage}')`}} className="w-[73%] min-h-128 flex flex-col rounded-[32px] bg-cover bg-center text-white pt-9 pl-14 pr-10 pb-6">
            <div className={`flex flex-row items-start justify-between w-full`}>
                <h2 className={`text-[50px] font-bold italic leading-none pt-2`}>{heading}</h2>
                <BulletBtn color={"#FFFFFF"} size={"size-14"}/>
            </div>
            <div key={activeSlide} className={`flex flex-col w-full animate-slide-reveal motion-reduce:animate-none`}>
                <div className={`flex flex-row items-baseline justify-between w-full mt-9`}>
                    <p className={`text-4xl leading-none`}>{event.title}</p>
                    <p className={`text-[22px] font-medium leading-none`}>{event.date}</p>
                </div>
                <p className={`max-w-[70%] text-[22px] leading-tight mt-9 line-clamp-5`}>{event.description}</p>
            </div>
            <button className={`bg-white text-black rounded-[20px] w-68 h-16 text-[22px] mt-8 cursor-pointer`}>
                Pieteikties
            </button>
            <div className={`flex flex-row justify-center gap-10 mt-auto pt-12`}>
                {Array.from({length: slideCount}, (_, index) => (
                    <button key={index} onClick={() => onSlideChange(index)} className={`w-17 h-1 rounded-full overflow-hidden bg-white/40 cursor-pointer`}>
                        {index === activeSlide &&
                            <span style={{animationDuration: `${slideDuration}ms`}} onAnimationEnd={onSlideEnd} className={`block h-full bg-white origin-left animate-slide-progress`}/>}
                    </button>
                ))}
            </div>
        </div>
    )
}
