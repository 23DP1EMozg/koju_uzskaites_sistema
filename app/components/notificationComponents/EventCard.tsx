export type NotificationEvent = {
    id?: number
    title: string
    date: string
    description: string
    signedUp?: boolean
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
    onSignUp: () => void
    signUpPending: boolean
}

export default function EventCard ({heading, event, bgImage, slideCount, activeSlide, slideDuration, onSlideChange, onSlideEnd, onSignUp, signUpPending}: NotificationEventCardProps) {
    return (
        <div style={{backgroundImage: `url('${bgImage}')`}} className="w-[calc(100%-32px)] md:w-[73%] min-h-128 flex flex-col rounded-[24px] md:rounded-[32px] bg-cover bg-center text-white pt-6 md:pt-9 pl-6 md:pl-14 pr-5 md:pr-10 pb-5 md:pb-6">
            <h2 className={`text-4xl md:text-[50px] font-bold italic leading-none pt-2`}>{heading}</h2>
            <div key={activeSlide} className={`flex flex-col w-full animate-slide-reveal motion-reduce:animate-none`}>
                <div className={`flex flex-col md:flex-row md:items-baseline justify-between gap-1 md:gap-2 w-full mt-12 md:mt-9`}>
                    <p className={`text-2xl md:text-4xl leading-none`}>{event.title}</p>
                    <p className={`text-lg md:text-[22px] font-semibold md:font-medium leading-none`}>{event.date}</p>
                </div>
                <p className={`md:max-w-[70%] text-base md:text-[22px] leading-tight mt-5 md:mt-9 line-clamp-10 md:line-clamp-5`}>{event.description}</p>
            </div>
            {event.id !== undefined &&
                <button type={"button"} onClick={onSignUp} disabled={signUpPending || event.signedUp} aria-busy={signUpPending} className={`bg-white text-black rounded-xl md:rounded-[20px] w-50 md:w-68 h-12 md:h-16 text-lg md:text-[22px] mt-10 md:mt-8 cursor-pointer transition hover:bg-white/85 active:scale-[0.98] disabled:cursor-default disabled:opacity-60 disabled:hover:bg-white disabled:active:scale-100`}>
                    {signUpPending ? "Piesakās..." : event.signedUp ? "Pieteicies ✓" : "Pieteikties"}
                </button>}
            <div className={`flex flex-row justify-center gap-4 md:gap-10 mt-auto pt-8 md:pt-12`}>
                {Array.from({length: slideCount}, (_, index) => (
                    <button key={index} onClick={() => onSlideChange(index)} className={`w-12 md:w-17 h-1 rounded-full overflow-hidden bg-white/40 cursor-pointer`}>
                        {index === activeSlide &&
                            <span style={{animationDuration: `${slideDuration}ms`}} onAnimationEnd={onSlideEnd} className={`block h-full bg-white origin-left animate-slide-progress`}/>}
                    </button>
                ))}
            </div>
        </div>
    )
}
