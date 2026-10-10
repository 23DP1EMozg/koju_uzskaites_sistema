type NavBarListProps = {
    iconRoute: string;
    text: string;
    accentColor: string;
    active: boolean;
    onClick: () => void;
}


export default function NavBarListButton({active , onClick, iconRoute, text, accentColor}: NavBarListProps) {
    return (
        <div style={{...(active && {backgroundColor: accentColor}),
            ...(active && {color: 'white'})}} className={"h-full flex justify-center items-center gap-2.5 px-9 rounded-full text-[15px] text-neutral-600 cursor-pointer whitespace-nowrap"} onClick={onClick}>
            {active && <img src={iconRoute} alt="" className={"h-4.5"}/>}
            <p>{text}</p>
        </div>
    )
}
