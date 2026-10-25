import DashboardAccentColorWidget from "@/app/components/dashboardComponents/DashboardAccentColorWidge";
import DashboardAccentBtn from "@/app/components/dashboardComponents/DashboardAccentBtn";
import DashboardStrokeButton from "@/app/components/dashboardComponents/DashboardStrokeButton";
import DashboardEventWidget from "@/app/components/dashboardComponents/DashboardEventWidget";
import DashboardMessagesWidget from "@/app/components/dashboardComponents/DashboardMessagesWidget";
import {markLaundryDone} from "@/app/actions";

type DashboardSectionProps = {
    studentFloor: number
    studentRoom: number
    studentName: string
    studentSurname: string
    studentCourse: string
    accentColor: string
    bgImage: string
    widgetBg: string
    kitchenCleaningDate: string
    laundryDate: string
    message: string
    roomCleaningDate: string
    nextEventTitle: string
    nextEventDate: string
};

export default function DashboardSection({studentCourse,studentRoom,studentFloor, studentSurname, studentName, accentColor, bgImage, widgetBg, kitchenCleaningDate, laundryDate, message, roomCleaningDate, nextEventTitle, nextEventDate}: DashboardSectionProps) {
    return (
        <section id={"DashboardSection"} style={{backgroundImage: `url('${bgImage}')`}} className={`relative md:sticky top-0 w-full flex flex-col justify-start items-center min-h-screen md:h-screen pt-24 md:pt-0 bg-cover bg-center bg-no-repeat`}>
        <div className={`flex flex-col md:flex-row gap-3 md:gap-0 justify-between md:items-end w-[calc(100%-32px)] md:w-[95%] mt-auto mb-[12vh] md:mb-[16vh]`}>
            <div className="flex flex-col items-start justify-start w-full md:w-[55%] gap-5 md:gap-7">
                <div className="flex flex-col gap-3">
                    <h1 className={`text-white font-semibold text-5xl md:text-7xl leading-none`}>{studentName} {studentSurname}</h1>
                    <p className={`text-white font-medium text-2xl md:text-4xl leading-none`}>{studentCourse}</p>
                </div>
                <div className={`flex items-center justify-start gap-3 md:gap-5 h-11 md:h-13`}>
                    <DashboardStrokeButton/>
                    <DashboardAccentBtn/>
                </div>
                <h1 style={{color: accentColor}} className={`font-black italic text-[80px] md:text-[110px] leading-[0.8]`}>{String(studentRoom).padStart(3, '0')}</h1>
                <div className={`flex flex-row items-start justify-between gap-3 md:gap-12 w-full`}>
                    <DashboardAccentColorWidget accentColor={accentColor} date={kitchenCleaningDate} text={"Nākamā virtuves tīrīšana"}/>
                    <DashboardAccentColorWidget accentColor={accentColor} date={laundryDate} text={"Pēdējā veļas maiņa"} onApply={markLaundryDone}/>
                </div>
            </div>
            <div className="flex flex-col items-end justify-start w-full md:w-[40%] gap-3 md:gap-11">
                <div className={`flex flex-row gap-3 md:gap-10 w-full`}>
                    <DashboardEventWidget title={"Nākamā istabu tīrīšana"} highlight={"Trešdiena"} date={roomCleaningDate} bgImage={widgetBg}/>
                    <DashboardEventWidget title={"Tuvākais pasākums"} highlight={nextEventTitle} date={nextEventDate}/>
                </div>
                <DashboardMessagesWidget accentColor={accentColor} message={message || "Nav jaunu ziņojumu."}/>
            </div>
        </div>

        </section>
    )
}
