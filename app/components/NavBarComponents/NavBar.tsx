'use client'
import NavBarCornerButton from './NavBarCornerButton'
import NavBarListButton from "./NavBarListButton";
import NotificationsMenu from "./NotificationsMenu";
import {useEffect, useState} from "react";
import Link from "next/link";
import {logoutUser} from "@/app/login/actions";

type NavBarProps = {
    accentColor: string;
    isAdmin?: boolean;
};

type NavItem = {
    text: string
    iconRoute: string
    sectionId: string
}

const items: NavItem[] = [
    {text: 'Profils', iconRoute: '/icons/navProfileIcon.svg', sectionId: 'DashboardSection'},
    {text: 'Pasākumi', iconRoute: '/icons/navEventIcon.svg', sectionId: 'EventSection'},
    {text: 'Informācija', iconRoute: '/icons/navInfoIcon.svg', sectionId: 'FAQSection'},
    {text: 'Sūdzības', iconRoute: '/icons/navComplaintIcon.svg', sectionId: 'ReportSection'},
]

export default function NavBar({accentColor, isAdmin = false}: NavBarProps) {
    const [activeSection, setActiveSection] = useState(items[0].sectionId)

    useEffect(() => {
        // Active section is the last one (in page order) whose top has passed the middle of the viewport
        const updateActiveSection = () => {
            const sections = items
                .map((item) => document.getElementById(item.sectionId))
                .filter((section): section is HTMLElement => section !== null)
                .sort((a, b) => a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1)
            const current = sections.findLast((section) => section.getBoundingClientRect().top <= window.innerHeight / 2)
            if (current) setActiveSection(current.id)
        }
        updateActiveSection()
        window.addEventListener('scroll', updateActiveSection, {passive: true})
        window.addEventListener('resize', updateActiveSection)
        return () => {
            window.removeEventListener('scroll', updateActiveSection)
            window.removeEventListener('resize', updateActiveSection)
        }
    }, [])

    const scrollToSection = (sectionId: string) => {
        const section = document.getElementById(sectionId)
        if (!section) return
        // Dashboard is sticky, so its rect always reads top 0 — scroll to page top instead
        const top = sectionId === items[0].sectionId ? 0 : section.getBoundingClientRect().top + window.scrollY
        window.scrollTo({top, behavior: 'smooth'})
    }

    return (
        <nav className={"fixed z-50 top-4 md:top-5 inset-x-0 mx-auto w-[calc(100%-32px)] md:w-[95%] flex justify-between items-center h-12 md:h-17"}>
            <div className={"flex items-center gap-2 h-full"}>
                <NavBarCornerButton iconRoute="/icons/log-outIcon.svg" accentColor={accentColor} label="Iziet" onClick={() => logoutUser()}/>
                <Link href="/profile" aria-label="Mans profils" style={{backgroundColor: accentColor}} className={"flex items-center justify-center h-full aspect-square shrink-0 rounded-full"}>
                    <img src="/icons/navProfileIcon.svg" alt="" className={"h-[40%]"}/>
                </Link>
                {isAdmin && (
                    <Link href="/adminDashboard" style={{backgroundColor: accentColor}} className={"flex items-center h-full px-4 md:px-6 rounded-full text-white text-sm md:text-base whitespace-nowrap"}>
                        Administrācija
                    </Link>
                )}
            </div>
            <ul className={"fixed bottom-4 inset-x-4 h-16 md:static md:w-[53%] md:h-full grid grid-cols-4 items-center bg-white rounded-full p-1.5 md:p-2.5 shadow-[0_4px_14px_rgba(0,0,0,0.12)]"}>
                {items.map((item) => (
                    <li key={item.sectionId} className={"flex justify-center h-full"}>
                        <NavBarListButton
                            iconRoute={item.iconRoute}
                            text={item.text}
                            accentColor={accentColor}
                            active={activeSection === item.sectionId}
                            onClick={() => scrollToSection(item.sectionId)}
                        />
                    </li>
                ))}
            </ul>
            <NotificationsMenu accentColor={accentColor} isAdmin={isAdmin}/>
        </nav>
    )
}
