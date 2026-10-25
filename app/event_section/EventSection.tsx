'use client'
import EventCard, {NotificationEvent} from "@/app/components/notificationComponents/EventCard";
import {useState} from "react";

type NotificationSectionProps = {
    containerBg: string
    events: NotificationEvent[]
};

const NO_EVENTS: NotificationEvent = {title: 'Nav plānotu pasākumu', date: '', description: 'Tuvākajā laikā pasākumi nav plānoti. Kad administrācija pievienos jaunu pasākumu, tas parādīsies šeit.'}

export default function EventSection({containerBg, events}: NotificationSectionProps) {
    const [activeSlide, setActiveSlide] = useState(0)
    return (
        <section id={"EventSection"} className={`relative z-10 w-full min-h-screen -mt-[5vh] flex justify-center items-center bg-black rounded-[32px] md:rounded-[60px] py-16 md:py-[15vh]`}>
            <EventCard
                heading={"Pasākumi"}
                event={events[activeSlide] ?? NO_EVENTS}
                bgImage={containerBg}
                slideCount={events.length}
                activeSlide={activeSlide}
                slideDuration={6000}
                onSlideChange={setActiveSlide}
                onSlideEnd={() => setActiveSlide((activeSlide + 1) % events.length)}
            />
        </section>
    )
}
