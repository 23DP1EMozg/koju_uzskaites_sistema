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
            ...(active && {color: 'white'})}} className={"w-full md:w-auto h-full flex flex-col md:flex-row justify-center items-center gap-0.5 md:gap-2.5 px-1 md:px-9 rounded-full text-[11px] md:text-[15px] text-neutral-600 cursor-pointer whitespace-nowrap transition-colors duration-300"} onClick={onClick}>
            <img src={iconRoute} alt="" className={`h-4.5 ${active ? '' : 'invert opacity-60 md:hidden'}`}/>
            <p>{text}</p>
        </div>
    )
}
