type NavBarCornerButtonProps = {
    iconRoute: string;
    accentColor: string;
}

export default function NavBarCornerButton({iconRoute,accentColor}: NavBarCornerButtonProps) {
    return (
        <button className={`bg-[${accentColor}] flex items-center justify-center w-[4%] h-[90%] rounded-full p-4`}>
            <img src={iconRoute} alt=""/>
        </button>
    )
}