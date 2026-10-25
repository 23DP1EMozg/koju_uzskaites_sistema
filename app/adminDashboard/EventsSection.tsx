"use client"

import { FormEvent, useEffect, useState } from "react"
import { createEvent, deleteEventById, getAllEvents } from "../event_section/actions"
import { Event } from "../types/Event"
import InputField, { FieldError } from "../components/InputField"
import { EventFields, FieldErrors, MAX_EVENT_DESCRIPTION_LENGTH, MAX_EVENT_LOCATION_LENGTH, MAX_EVENT_TITLE_LENGTH, hasErrors, validateEvent } from "../helper/validation"

type Props = {
    showToast: (text: string, variant: "error" | "success") => void,
    requestConfirm: (confirm: { title: string, message: string, confirmLabel: string, action: () => Promise<void> }) => void,
}

const EMPTY_EVENT = { title: "", event_date: "", location: "", description: "" }

const todayInRiga = () => new Date().toLocaleDateString("sv-SE", { timeZone: "Europe/Riga" })
const formatEventDate = (date?: string) =>
    date ? new Date(date).toLocaleDateString("lv-LV", { timeZone: "Europe/Riga", day: "numeric", month: "long", year: "numeric" }) : "—"

// Upcoming events only, soonest first, like on the tenants' home page
const fetchUpcomingEvents = async () => {
    const today = todayInRiga()
    return ((await getAllEvents()) as Event[])
        .filter(event => (event.event_date ?? "").slice(0, 10) >= today)
        .sort((a, b) => (a.event_date ?? "").localeCompare(b.event_date ?? ""))
}

export default function EventsSection({ showToast, requestConfirm }: Props) {
    const [events, setEvents] = useState<Event[]>([])
    const [values, setValues] = useState(EMPTY_EVENT)
    const [errors, setErrors] = useState<FieldErrors<keyof EventFields>>({})
    const [pending, setPending] = useState(false)

    const loadEvents = async () => setEvents(await fetchUpcomingEvents())

    useEffect(() => {
        fetchUpcomingEvents().then(setEvents).catch(console.error)
    }, [])

    const update = (field: keyof typeof EMPTY_EVENT) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setValues(prev => ({ ...prev, [field]: e.target.value }))
        setErrors(prev => ({ ...prev, [field]: undefined }))
    }

    async function handleSubmit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault()
        const fieldErrors: FieldErrors<keyof EventFields> = {
            ...validateEvent(values),
            ...(values.event_date && values.event_date < todayInRiga() ? { event_date: "Pasākuma datums nevar būt pagātnē." } : {}),
        }
        setErrors(fieldErrors)
        if (hasErrors(fieldErrors)) return

        setPending(true)
        try {
            await createEvent(values)
            setValues(EMPTY_EVENT)
            showToast("Pasākums pievienots.", "success")
            await loadEvents()
        } catch (error) {
            console.error(error)
            showToast("Neizdevās pievienot pasākumu. Mēģini vēlreiz.", "error")
        } finally {
            setPending(false)
        }
    }

    function confirmDelete(event: Event) {
        requestConfirm({
            title: "Dzēst pasākumu?",
            message: `Pasākums "${event.title}" tiks dzēsts. Šo darbību nevar atsaukt.`,
            confirmLabel: "Dzēst",
            action: async () => {
                try {
                    await deleteEventById(event.id as number)
                    await loadEvents()
                } catch (error) {
                    console.error(error)
                    showToast("Neizdevās dzēst pasākumu. Mēģini vēlreiz.", "error")
                }
            },
        })
    }

    return (
        <section id="pasakumi" className="scroll-mt-4 rounded-[3rem] bg-black px-4 py-14 text-white lg:px-[7.5rem] lg:py-28">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <h2 className="text-5xl font-extrabold italic tracking-tight lg:text-[5.5rem] lg:leading-none">Pasākumi</h2>
                <p className="max-w-[26rem] text-lg text-white/75 lg:mr-44 lg:mb-[-1.5rem] lg:text-2xl">
                    Gaidāmie pasākumi un jauna pasākuma pievienošana
                </p>
            </div>

            <div className="mt-10 grid grid-cols-1 gap-10 lg:mt-14 xl:grid-cols-2">
                <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
                    <InputField id="event_title" label="Nosaukums" required maxLength={MAX_EVENT_TITLE_LENGTH} placeholder="Kopmītņu talka" value={values.title} onChange={update("title")} error={errors.title} />
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <InputField id="event_date" label="Datums" type="date" required min={todayInRiga()} value={values.event_date} onChange={update("event_date")} error={errors.event_date} className="[color-scheme:dark]" />
                        <InputField id="event_location" label="Vieta" maxLength={MAX_EVENT_LOCATION_LENGTH} placeholder="Aktu zāle" value={values.location} onChange={update("location")} error={errors.location} />
                    </div>
                    <label htmlFor="event_description" className="flex flex-col gap-2 rounded-2xl bg-white/10 px-6 pt-4 pb-4 shadow-[0_4px_14px_rgba(0,0,0,0.18)] backdrop-blur-sm transition focus-within:bg-white/15 focus-within:ring-1 focus-within:ring-white/60">
                        <span className="text-xs tracking-wide text-white/90">Apraksts</span>
                        <textarea
                            id="event_description"
                            rows={4}
                            maxLength={MAX_EVENT_DESCRIPTION_LENGTH}
                            value={values.description}
                            onChange={update("description")}
                            aria-invalid={errors.description ? true : undefined}
                            className="w-full resize-y border-b border-white/80 bg-transparent text-sm text-white outline-none placeholder:text-white/45"
                        />
                        <FieldError id="event_description" error={errors.description} />
                    </label>
                    <button
                        type="submit"
                        disabled={pending}
                        className="mt-2 cursor-pointer self-end rounded-full bg-white px-10 py-4 text-lg text-black transition hover:bg-white/85 disabled:opacity-60"
                    >
                        {pending ? "Saglabā..." : "Pievienot pasākumu"}
                    </button>
                </form>

                <div className="flex flex-col gap-5">
                    {events.length === 0 ? (
                        <p className="text-lg text-white/60">Nav gaidāmu pasākumu.</p>
                    ) : events.map(event => (
                        <article key={event.id} className="flex items-center gap-4 rounded-[28px] border border-[#a23a32]/40 bg-white/5 px-5 py-5 lg:px-8">
                            <div className="flex min-w-0 flex-1 flex-col gap-1">
                                <span className="break-words text-xl font-extrabold italic tracking-tight lg:text-2xl">{event.title}</span>
                                <span className="text-sm text-white/60 lg:text-base">
                                    {formatEventDate(event.event_date)}{event.location ? ` · ${event.location}` : ""} · {event.participant_ids?.length ?? 0} pieteikušies
                                </span>
                            </div>
                            <button
                                type="button"
                                onClick={() => confirmDelete(event)}
                                className="shrink-0 cursor-pointer rounded-full border border-white/80 px-5 py-2.5 text-sm transition hover:bg-white/10 lg:text-base"
                            >
                                Dzēst
                            </button>
                        </article>
                    ))}
                </div>
            </div>
        </section>
    )
}
