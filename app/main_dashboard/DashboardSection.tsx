import NavBar from "@/app/components/NavBarComponents/NavBar";
import DashboardAccentColorWidget from "@/app/components/dashboardComponents/DashboardAccentColorWidge";
import DashboardAccentBtn from "@/app/components/dashboardComponents/DashboardAccentBtn";
import DashboardStrokeButton from "@/app/components/dashboardComponents/DashboardStrokeButton";
import DashboardEventWidget from "@/app/components/dashboardComponents/DashboardEventWidget";
import DashboardMessagesWidget from "@/app/components/dashboardComponents/DashboardMessagesWidget";

type DashboardSectionProps = {
    studentFloor: number
    studentRoom: number
    studentName: string
    studentSurname: string
    studentCourse: string
    accentColor: string
    bgImage: string
    widgetBg: string
};

export default function DashboardSection({studentCourse,studentRoom,studentFloor, studentSurname, studentName, accentColor, bgImage, widgetBg}: DashboardSectionProps) {
    return (
        <section id={"DashboardSection"} style={{backgroundImage: `url('${bgImage}')`}} className={`sticky top-0 w-full flex flex-col justify-start items-center h-screen bg-cover bg-center bg-no-repeat`}>
        <NavBar accentColor={accentColor}/>
        <div className={`flex justify-between items-end w-[95%] mt-auto mb-[16vh]`}>
            <div className="flex flex-col items-start justify-start w-[55%] gap-7">
                <div className="flex flex-col gap-3">
                    <h1 className={`text-white font-semibold text-7xl leading-none`}>{studentName} {studentSurname}</h1>
                    <p className={`text-white font-medium text-4xl leading-none`}>{studentCourse}</p>
                </div>
                <div className={`flex items-center justify-start gap-5 h-13`}>
                    <DashboardStrokeButton/>
                    <DashboardAccentBtn/>
                </div>
                <h1 style={{color: accentColor}} className={`font-black italic text-[110px] leading-[0.8]`}>{String(studentRoom).padStart(3, '0')}</h1>
                <div className={`flex flex-row items-start justify-between gap-12 w-full`}>
                    <DashboardAccentColorWidget accentColor={accentColor} date={'30/09/2026'} text={"Nakama virtuves tirisana"}/>
                    <DashboardAccentColorWidget accentColor={accentColor} date={'30/09/2026'} text={"Nakama velas maina"}/>
                </div>
            </div>
            <div className="flex flex-col items-end justify-start w-[40%] gap-11">
                <div className={`flex flex-row gap-10 w-full`}>
                    <DashboardEventWidget title={"Nakama tiribu parbude"} highlight={"Sestdiena"} date={'11/09/2026'} bgImage={widgetBg}/>
                    <DashboardEventWidget title={"Tuvakais pasakums"} highlight={"Basketbols"} date={'11/09/2026'}/>
                </div>
                <DashboardMessagesWidget accentColor={accentColor} message={"Many desktop publishing packages and web page editors now use Lorem Ipsum as their default model text, and a search for 'lorem ipsum' will uncover many web sites still in their infancy. and a search for 'lorem ipsum' will uncover many web sites still in their infancy. and a search for 'lorem ipsum' will uncover many web sites still in their infancy."}/>
            </div>
        </div>

        </section>
    )
}
