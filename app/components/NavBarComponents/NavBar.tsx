import NavBarCornerButton from './NavBarCornerButton'
import NavBarListButton from "./NavBarListButton";

type NavBarProps = {
    accentColor: string;
};

export default function NavBar({accentColor}: NavBarProps) {
    return (
        <nav className={"w-[90%] flex justify-between items-center h-[7%] bg-black mt-4"}>
            <NavBarCornerButton iconRoute="/icons/ProfileIcon.png" accentColor={accentColor}/>
            <ul className={"flex justify-around items-center w-[50%] bg-white rounded-4xl p-1 h-full"}>
                <li><NavBarListButton iconRoute={"/icons/ProfileIcon.png"} text={"Profils"} accentColor={accentColor}/></li>
                <li><NavBarListButton iconRoute={"/icons/ProfileIcon.png"} text={"Sudzības"} accentColor={accentColor}/></li>
                <li><NavBarListButton iconRoute={"/icons/ProfileIcon.png"} text={"Informācija"} accentColor={accentColor}/></li>
                <li><NavBarListButton iconRoute={"/icons/ProfileIcon.png"} text={"Pasākumi"} accentColor={accentColor}/></li>
            </ul>
            <NavBarCornerButton iconRoute="/icons/ProfileIcon.png" accentColor={accentColor}/>
        </nav>
    )
}