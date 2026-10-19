type NavBarCornerButtonProps = {
    iconRoute: string;
    accentColor: string;
    onClick?: () => void;
    label?: string;
}

export default function NavBarCornerButton({iconRoute, accentColor, onClick, label}: NavBarCornerButtonProps) {
    return (
        <button type="button" onClick={onClick} aria-label={label} style={{backgroundColor: accentColor}} className={`flex items-center justify-center h-full aspect-square shrink-0 rounded-full cursor-pointer`}>
            <img src={iconRoute} alt="" className={`h-[40%]`}/>
        </button>
    )
}
