import Link from "next/link";

export default function DashboardStrokeButton () {
    return (
        <Link href={"/stay"} className={`bg-transparent border border-white rounded-[18px] px-5 md:px-10 h-full flex flex-col items-center justify-center text-white text-[15px] cursor-pointer`}>
             <p>Pieteikt paliekšanu</p>
        </Link>
    )
}
