'use client'
import EventCard, {NotificationEvent} from "@/app/components/notificationComponents/EventCard";
import {useState} from "react";

type NotificationSectionProps = {
    containerBg: string
};

const events: NotificationEvent[] = [
    {title: 'Basketbola sacencības', date: '11/09/2026', description: "Many desktop publishing packages and web page editors now use Lorem Ipsum as their default model text, and a search for 'lorem ipsum' will uncover many web sites still in their infancy. and a search for 'lorem ipsum' will uncover many web sites still in their infancy. and a search for 'lorem ipsum' will uncover many web sites still in their infancy."},
    {title: 'Filmu vakars', date: '18/09/2026', description: "Many desktop publishing packages and web page editors now use Lorem Ipsum as their default model text, and a search for 'lorem ipsum' will uncover many web sites still in their infancy."},
    {title: 'Galda spēļu turnīrs', date: '25/09/2026', description: "Many desktop publishing packages and web page editors now use Lorem Ipsum as their default model text, and a search for 'lorem ipsum' will uncover many web sites still in their infancy. and a search for 'lorem ipsum' will uncover many web sites still in their infancy."},
    {title: 'Kopmītņu talka', date: '02/10/2026', description: "Many desktop publishing packages and web page editors now use Lorem Ipsum as their default model text."},
]

export default function EventSection({containerBg}: NotificationSectionProps) {
    const [activeSlide, setActiveSlide] = useState(0)
    return (
        <section id={"EventSection"} className={`relative z-10 w-full min-h-screen -mt-[5vh] flex justify-center items-center bg-black rounded-t-[60px] py-[15vh]`}>
            <EventCard
                heading={"Pasākumi"}
                event={events[activeSlide]}
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
