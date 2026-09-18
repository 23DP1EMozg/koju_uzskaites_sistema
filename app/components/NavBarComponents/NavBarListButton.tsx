type NavBarListProps = {
    iconRoute: string;
    text: string;
    accentColor: string;
}


export default function NavBarListButton({iconRoute, text, accentColor}: NavBarListProps) {
    return (
        <div className={"w-full flex justify-around items-center m-1"}>
            <img src={iconRoute} alt="" />
            <p>{text}</p>
        </div>
    )
}