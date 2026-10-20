'use client'
import NavBarCornerButton from "./NavBarCornerButton";
import {useCallback, useEffect, useRef, useState} from "react";
import {Notification} from "@/app/types/Notification";
import {getMyNotifications, markMyNotificationAsRead} from "@/app/notifications/actions";

type NotificationsMenuProps = {
    accentColor: string;
};

const formatDate = (value?: string) => {
    if (!value) return ""
    const date = new Date(value)
    return `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`
}

export default function NotificationsMenu({accentColor}: NotificationsMenuProps) {
    const [open, setOpen] = useState(false)
    const [notifications, setNotifications] = useState<Notification[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(false)
    const containerRef = useRef<HTMLDivElement>(null)

    const loadNotifications = useCallback(() => getMyNotifications()
        .then((data) => {
            setNotifications(data)
            setError(false)
        })
        .catch(() => setError(true))
        .finally(() => setLoading(false)), [])

    // Load once for the unread dot, then refresh every time the panel is opened
    useEffect(() => {
        getMyNotifications()
            .then(setNotifications)
            .catch(() => setError(true))
            .finally(() => setLoading(false))
    }, [])

    useEffect(() => {
        if (!open) return
        const closeOnOutsideClick = (event: MouseEvent) => {
            if (!containerRef.current?.contains(event.target as Node)) setOpen(false)
        }
        const closeOnEscape = (event: KeyboardEvent) => {
            if (event.key === 'Escape') setOpen(false)
        }
        document.addEventListener('mousedown', closeOnOutsideClick)
        document.addEventListener('keydown', closeOnEscape)
        return () => {
            document.removeEventListener('mousedown', closeOnOutsideClick)
            document.removeEventListener('keydown', closeOnEscape)
        }
    }, [open])

    const toggle = () => {
        if (!open) loadNotifications()
        setOpen(!open)
    }

    const markAsRead = async (id?: number) => {
        if (id == null) return
        const previous = notifications
        setNotifications(previous.filter((notification) => notification.id !== id))
        try {
            await markMyNotificationAsRead(id)
        } catch {
            setNotifications(previous)
            setError(true)
        }
    }

    return (
        <div ref={containerRef} className={"relative h-full"}>
            <NavBarCornerButton iconRoute="/icons/notificationIcon.svg" accentColor={accentColor} label="Paziņojumi" onClick={toggle}/>
            {notifications.length > 0 &&
                <span className={"pointer-events-none absolute top-[18%] right-[18%] size-2 md:size-2.5 rounded-full bg-white"} style={{boxShadow: `0 0 0 2px ${accentColor}`}}/>}

            {open &&
                <div role="dialog" aria-label="Paziņojumi" className={"fixed md:absolute top-20 md:top-[calc(100%+12px)] inset-x-4 md:inset-x-auto md:right-0 md:w-105 max-h-[70vh] flex flex-col rounded-[20px] md:rounded-[28px] bg-white shadow-[0_10px_30px_rgba(0,0,0,0.18)] pt-4 md:pt-5 pl-5 md:pl-7 pr-3 md:pr-4 pb-4 md:pb-5 animate-toast-in motion-reduce:animate-none"}>
                    <div className={"flex flex-row items-center justify-between w-full pr-2"}>
                        <p className={"text-3xl md:text-[34px] font-bold italic leading-none"}>Paziņojumi</p>
                        <span style={{backgroundColor: accentColor}} className={"min-w-8 h-8 px-2 grid place-items-center rounded-full text-white text-sm font-semibold"}>
                            {notifications.length}
                        </span>
                    </div>

                    <div className={"flex flex-col gap-3 mt-5 overflow-y-auto pr-2"}>
                        {loading && <p className={"text-[15px] text-neutral-500"}>Ielādē...</p>}
                        {!loading && error &&
                            <p className={"text-[15px] text-[#c4473d]"}>Neizdevās ielādēt paziņojumus. Mēģini vēlreiz.</p>}
                        {!loading && !error && notifications.length === 0 &&
                            <p className={"text-[15px] text-neutral-500"}>Tev nav jaunu paziņojumu.</p>}

                        {notifications.map((notification) => (
                            <div key={notification.id} className={"flex flex-row gap-4"}>
                                <span style={{background: accentColor}} className={"w-1 shrink-0 rounded-full"}/>
                                <div className={"flex flex-col gap-1.5 flex-1 min-w-0"}>
                                    <div className={"flex flex-row items-baseline justify-between gap-2 text-xs text-neutral-500"}>
                                        <span className={"font-semibold uppercase tracking-wide truncate"}>{notification.category}</span>
                                        <span className={"shrink-0"}>{formatDate(notification.created_at)}</span>
                                    </div>
                                    <p className={"text-[15px] leading-[1.25] break-words"}>{notification.message}</p>
                                    <button type="button" onClick={() => markAsRead(notification.id)} className={"self-start text-[13px] font-medium text-neutral-600 underline underline-offset-2 hover:text-black cursor-pointer"}>
                                        Atzīmēt kā izlasītu
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>}
        </div>
    )
}
