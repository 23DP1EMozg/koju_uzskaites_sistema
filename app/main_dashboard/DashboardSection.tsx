import NavBar from "@/app/components/NavBarComponents/NavBar";
import DashboardAccentColorWidget from "@/app/components/dashboardComponents/DashboardAccentColorWidge";
import DashboardAccentBtn from "@/app/components/dashboardComponents/DashboardAccentBtn";
import DashboardStrokeButton from "@/app/components/dashboardComponents/DashboardStrokeButton";

type DashboardSectionProps = {
    studentFloor: number
    studentRoom: number
    studentName: string
    studentSurname: string
    studentCourse: string
    accentColor: string
};

export default function DashboardSection({studentCourse,studentRoom,studentFloor, studentSurname, studentName, accentColor}: DashboardSectionProps) {
    return (
        <section id={"DashboardSection"} className={`w-full flex flex-col justify-start items-center gap-[30%] h-screen bg-[url('/backgrounds/RedHomeScreenBg.png')] bg-cover bg-center bg-no-repeat`}>
        <NavBar accentColor={accentColor}/>
        <div className={`flex justify-around items-center w-[90%]`}>
            <div className="flex flex-col items-start justify-start w-1/2 gap-4">
                <h1 className={`text-white font-semibold text-8xl `}>{studentName} {studentSurname}</h1>
                <p className={`text-white font-medium text-4xl`}>{studentCourse}</p>
                <div className={`flex items-center justify-start w-1/2 gap-4 h-[4vh]`}>
                    <DashboardStrokeButton/>
                    <DashboardAccentBtn/>
                </div>
                <h1 style={{color: accentColor}} className={`font-semibold text-8xl `}>{studentRoom}</h1>
                <div className={`flex sm:flex-row items-start justify-between w-1/2`}>
                    <DashboardAccentColorWidget accentColor={accentColor} date={'30/09/2026'} text={"Nakama virtuves tirisana"}/>
                    <DashboardAccentColorWidget accentColor={accentColor} date={'30/09/2026'} text={"Nakama velas maina"}/>
                </div>
            </div>
            <div className="flex flex-col items-end justify-start w-1/2">
                <h1 className={`text-white font-semibold text-8xl `}>{studentName} {studentSurname}</h1>
                <p className={`text-white font-medium text-4xl`}>{studentCourse}</p>
            </div>
        </div>

        </section>
    )
}