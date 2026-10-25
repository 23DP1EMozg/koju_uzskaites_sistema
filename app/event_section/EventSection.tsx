'use client'
import EventCard, {NotificationEvent} from "@/app/components/notificationComponents/EventCard";
import Toast, {ToastMessage} from "@/app/components/Toast";
import {signUpForEvent} from "@/app/event_section/actions";
import {useCallback, useState, useTransition} from "react";

type NotificationSectionProps = {
    containerBg: string
    events: NotificationEvent[]
};

const NO_EVENTS: NotificationEvent = {title: 'Nav plānotu pasākumu', date: '', description: 'Tuvākajā laikā pasākumi nav plānoti. Kad administrācija pievienos jaunu pasākumu, tas parādīsies šeit.'}

export default function EventSection({containerBg, events}: NotificationSectionProps) {
    const [activeSlide, setActiveSlide] = useState(0)
    // Events signed up for during this visit, on top of what the server sent
    const [signedUpIds, setSignedUpIds] = useState<Set<number>>(new Set())
    const [pendingEventId, setPendingEventId] = useState<number | null>(null)
    const [toast, setToast] = useState<ToastMessage | null>(null)
    const [, startTransition] = useTransition()

    const closeToast = useCallback(() => setToast(null), [])

    const current = events[activeSlide] ?? NO_EVENTS
    const event = {...current, signedUp: current.signedUp || (current.id !== undefined && signedUpIds.has(current.id))}

    const signUp = () => {
        const eventId = event.id
        if (eventId === undefined || pendingEventId !== null) return
        setToast(null)
        setPendingEventId(eventId)

        startTransition(async () => {
            const result = await signUpForEvent(eventId).catch(() => ({ok: false as const, error: "Neizdevās pieteikties. Mēģini vēlreiz."}))
            setPendingEventId(null)

            if (!result.ok) {
                setToast({id: Date.now(), text: result.error, variant: "error"})
                return
            }

            setSignedUpIds(prev => new Set(prev).add(eventId))
            setToast({id: Date.now(), text: `Tu esi pieteicies pasākumam „${event.title}”.`, variant: "success"})
        })
    }

    return (
        <section id={"EventSection"} className={`relative z-10 w-full min-h-screen -mt-[5vh] flex justify-center items-center bg-black rounded-[32px] md:rounded-[60px] py-16 md:py-[15vh]`}>
            <Toast toast={toast} onClose={closeToast}/>
            <EventCard
                heading={"Pasākumi"}
                event={event}
                bgImage={containerBg}
                slideCount={events.length}
                activeSlide={activeSlide}
                slideDuration={6000}
                onSlideChange={setActiveSlide}
                onSlideEnd={() => setActiveSlide((activeSlide + 1) % events.length)}
                onSignUp={signUp}
                signUpPending={pendingEventId !== null && pendingEventId === event.id}
            />
        </section>
    )
}
