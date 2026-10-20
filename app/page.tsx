import { redirect } from "next/navigation";
import NavBar from "@/app/components/NavBarComponents/NavBar";
import DashboardSection from "@/app/main_dashboard/DashboardSection";
import EventSection from "@/app/event_section/EventSection";
import FAQSection from "@/app/faq_section/FAQSection";
import ReportSection from "@/app/report_section/ReportSection";
import {getFloorTheme} from "@/app/helper/theme";
import {getCurrentUser} from "@/app/helper/auth/jwt";
import {createClient} from "@/app/lib/supabase/server";
import {Role} from "@/app/types/Role";


export default async function Home() {
  const session = await getCurrentUser()
  if (!session) redirect("/login")

  const supabase = await createClient()
  const { data: student } = await supabase
    .from("users")
    .select("name, room_number, course")
    .eq("id", session.id)
    .maybeSingle()

  // The account was deleted while the session was still valid
  if (!student) redirect("/login")

  const [studentName = "", ...surnameParts] = (student.name ?? "").trim().split(/\s+/)
  const studentRoom: number = student.room_number ?? 0
  // Floor is the first digit of the room number (e.g. 235 -> 2)
  const studentFloor = studentRoom ? Number(String(studentRoom)[0]) : 0
  const theme = getFloorTheme(studentFloor || null)

  return (
      <>
        <NavBar accentColor={theme.accentColor} isAdmin={session.role === Role.ADMIN}/>
        <DashboardSection studentRoom={studentRoom} studentFloor={studentFloor} studentName={studentName} studentSurname={surnameParts.join(" ")} accentColor={theme.accentColor} studentCourse={student.course ?? ""} bgImage={theme.homeBg} widgetBg={theme.widgetBg}/>
        <EventSection containerBg={theme.notificationBg}/>
        <FAQSection cardBg={theme.faqCardBg} headingBg={theme.notificationBg}/>
        <ReportSection bgImage={theme.homeBg}/>
      </>
  );
}
