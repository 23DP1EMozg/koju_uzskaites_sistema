import NavBar from "@/app/components/NavBarComponents/NavBar";
import DashboardSection from "@/app/main_dashboard/DashboardSection";
import EventSection from "@/app/event_section/EventSection";
import FAQSection from "@/app/faq_section/FAQSection";
import ReportSection from "@/app/report_section/ReportSection";


export default function Home() {
  return (
      <>
        <NavBar accentColor={"#993831"}/>
        <DashboardSection studentRoom={235} studentFloor={2} studentName={"Kritaps"} studentSurname={"Irbe"} accentColor={"#993831"} studentCourse={"DP6-7"} bgImage={"/backgrounds/redTheme/RedHomeScreenBg.png"} widgetBg={"/backgrounds/redTheme/RedGradientWidgetBg.png"}/>
        <EventSection containerBg={"/backgrounds/redTheme/NotificationContainerRedBg.png"}/>
        <FAQSection cardBg={"/backgrounds/redTheme/ImageBgFAQRed.png"} headingBg={"/backgrounds/redTheme/NotificationContainerRedBg.png"}/>
        <ReportSection bgImage={"/backgrounds/redTheme/RedHomeScreenBg.png"}/>
      </>
  );
}
