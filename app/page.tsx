import NavBar from "@/app/components/NavBarComponents/NavBar";
import DashboardSection from "@/app/main_dashboard/DashboardSection";
import EventSection from "@/app/event_section/EventSection";
import FAQSection from "@/app/faq_section/FAQSection";
import ReportSection from "@/app/report_section/ReportSection";
import {getFloorTheme} from "@/app/helper/theme";


export default function Home() {
  const studentFloor = 1
  const theme = getFloorTheme(studentFloor)
  return (
      <>
        <NavBar accentColor={theme.accentColor}/>
        <DashboardSection studentRoom={235} studentFloor={studentFloor} studentName={"Kritaps"} studentSurname={"Irbe"} accentColor={theme.accentColor} studentCourse={"DP6-7"} bgImage={theme.homeBg} widgetBg={theme.widgetBg}/>
        <EventSection containerBg={theme.notificationBg}/>
        <FAQSection cardBg={theme.faqCardBg} headingBg={theme.notificationBg}/>
        <ReportSection bgImage={theme.homeBg}/>
      </>
  );
}
