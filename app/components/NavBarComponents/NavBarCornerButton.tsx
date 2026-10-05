type NavBarCornerButtonProps = {
    iconRoute: string;
    accentColor: string;
}

export default function NavBarCornerButton({iconRoute,accentColor}: NavBarCornerButtonProps) {
    return (
        <button style={{backgroundColor: accentColor}} className={`flex items-center justify-center h-full aspect-square shrink-0 rounded-full cursor-pointer`}>
            <img src={iconRoute} alt="" className={`h-[40%]`}/>
        </button>
    )
}
