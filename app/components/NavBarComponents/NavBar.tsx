'use client'
import NavBarCornerButton from './NavBarCornerButton'
import NavBarListButton from "./NavBarListButton";
import {useState} from "react";

type NavBarProps = {
    accentColor: string;
};
//TODO: make accent color for nav bar buttons depend on user position on website
export default function NavBar({accentColor}: NavBarProps) {
    const [activeItem, setActiveItem] = useState("Profils")
    const items = ['Profils', 'Sudzības', 'Informācija', 'Pasākumi']
    return (
        <nav className={"w-[95%] flex justify-between items-center h-17 mt-5"}>
            <NavBarCornerButton iconRoute="/icons/ProfileIcon.png" accentColor={accentColor}/>
            <ul className={"grid grid-cols-4 items-center w-[53%] bg-white rounded-full p-2.5 h-full"}>
                {items.map((item) => (
                    <li key={item} className={"flex justify-center h-full"}>
                        <NavBarListButton
                            iconRoute="/icons/ProfileIcon.png"
                            text={item}
                            accentColor={accentColor}
                            active={activeItem === item}
                            onClick={() => {
                                setActiveItem(item)
                                window.scrollTo(0, 0)
                            }
                        }
                        />
                    </li>
                ))}
            </ul>
            <NavBarCornerButton iconRoute="/icons/ProfileIcon.png" accentColor={accentColor}/>
        </nav>
    )
}
