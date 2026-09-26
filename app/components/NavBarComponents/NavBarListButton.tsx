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
            ...(active && {color: 'white'})}} className={"w-full flex justify-between items-center m-1 p-3 pl-8 pr-8 rounded-[30px]"} onClick={onClick}>
            <img src={iconRoute} alt="" />
            <p>{text}</p>
        </div>
    )
}