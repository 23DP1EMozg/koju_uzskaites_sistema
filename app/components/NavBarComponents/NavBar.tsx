'use client'
import NavBarCornerButton from './NavBarCornerButton'
import NavBarListButton from "./NavBarListButton";
import {useEffect, useState} from "react";
import {logoutUser} from "@/app/login/actions";

type NavBarProps = {
    accentColor: string;
};

type NavItem = {
    text: string
    iconRoute: string
    sectionId: string
}

const items: NavItem[] = [
    {text: 'Profils', iconRoute: '/icons/navProfileIcon.svg', sectionId: 'DashboardSection'},
    {text: 'Sudzības', iconRoute: '/icons/navComplaintIcon.svg', sectionId: 'ReportSection'},
    {text: 'Informācija', iconRoute: '/icons/navInfoIcon.svg', sectionId: 'FAQSection'},
    {text: 'Pasākumi', iconRoute: '/icons/navEventIcon.svg', sectionId: 'EventSection'},
]

export default function NavBar({accentColor}: NavBarProps) {
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
        <nav className={"fixed z-50 top-5 left-1/2 -translate-x-1/2 w-[95%] flex justify-between items-center h-17"}>
            <NavBarCornerButton iconRoute="/icons/log-outIcon.svg" accentColor={accentColor} label="Iziet" onClick={() => logoutUser()}/>
            <ul className={"grid grid-cols-4 items-center w-[53%] bg-white rounded-full p-2.5 h-full shadow-[0_4px_14px_rgba(0,0,0,0.12)]"}>
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
            <NavBarCornerButton iconRoute="/icons/notificationIcon.svg" accentColor={accentColor}/>
        </nav>
    )
}
