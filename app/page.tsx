import DashboardSection from "@/app/main_dashboard/DashboardSection";
import EventSection from "@/app/notifications_section/EventSection";


export default function Home() {
  return (
      <>
        <DashboardSection studentRoom={235} studentFloor={2} studentName={"Kritaps"} studentSurname={"Irbe"} accentColor={"#993831"} studentCourse={"DP6-7"} bgImage={"/backgrounds/RedHomeScreenBg.png"} widgetBg={"/backgrounds/RedGradientWidgetBg.png"}/>
        <EventSection containerBg={"/backgrounds/NotificationContainerRedBg.png"}/>
      </>
  );
}