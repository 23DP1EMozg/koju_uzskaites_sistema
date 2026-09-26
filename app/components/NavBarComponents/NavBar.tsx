'use client'
import NavBarCornerButton from './NavBarCornerButton'
import NavBarListButton from "./NavBarListButton";
import {useState} from "react";

type NavBarProps = {
    accentColor: string;
};

export default function NavBar({accentColor}: NavBarProps) {
    const [activeItem, setActiveItem] = useState("Profils")
    const items = ['Profils', 'Sudzības', 'Informācija', 'Pasākumi']
    return (
        <nav className={"w-[90%] flex justify-between items-center h-[6%] mt-4"}>
            <NavBarCornerButton iconRoute="/icons/ProfileIcon.png" accentColor={accentColor}/>
            <ul className={"flex justify-around items-center w-[50%] bg-white rounded-4xl p-1 h-full"}>
                {items.map((item) => (
                    <li key={item}>
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