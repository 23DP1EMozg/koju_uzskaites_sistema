import { redirect } from "next/navigation";
import NavBar from "@/app/components/NavBarComponents/NavBar";
import DashboardSection from "@/app/main_dashboard/DashboardSection";
import EventSection from "@/app/event_section/EventSection";
import FAQSection from "@/app/faq_section/FAQSection";
import ReportSection from "@/app/report_section/ReportSection";
import {getFloorTheme} from "@/app/helper/theme";
import { getCurrentUser } from "./helper/auth/jwt";
import {createClient} from "@/app/lib/supabase/server";
import {Role} from "@/app/types/Role";
import {getMyNotifications} from "@/app/notifications/actions";
import {getAllEvents} from "@/app/event_section/actions";
import {Event} from "@/app/types/Event";

const formatDate = (date?: string | null) =>
  date ? new Date(date).toLocaleDateString("en-GB", { timeZone: "Europe/Riga" }) : "—"


export default async function Home() {
  const session = await getCurrentUser()
  if (!session) redirect("/login")

  const supabase = await createClient()
  const { data: student } = await supabase
    .from("users")
    .select("name, room_number, course, last_laundry_date, next_kitchen_cleaning_date")
    .eq("id", session.id)
    .maybeSingle()

  // The account was deleted while the session was still valid
  if (!student) redirect("/login")

  const [studentName = "", ...surnameParts] = (student.name ?? "").trim().split(/\s+/)
  const studentRoom: number = student.room_number ?? 0
  // Floor is the first digit of the room number (e.g. 235 -> 2)
  const studentFloor = studentRoom ? Number(String(studentRoom)[0]) : 0
  const theme = getFloorTheme(studentFloor || null)

  const latestMessage = (await getMyNotifications().catch(() => []))[0]?.message ?? ""

  // Rooms are cleaned every Wednesday (today counts if it is Wednesday)
  const rigaToday = new Date(new Date().toLocaleDateString("sv-SE", { timeZone: "Europe/Riga" }))
  rigaToday.setUTCDate(rigaToday.getUTCDate() + (3 - rigaToday.getUTCDay() + 7) % 7)
  const roomCleaningDate = rigaToday.toLocaleDateString("en-GB", { timeZone: "UTC" })

  // Only upcoming events, soonest first
  const today = new Date().toLocaleDateString("sv-SE", { timeZone: "Europe/Riga" })
  const upcomingEvents = ((await getAllEvents().catch(() => [])) as Event[])
    .filter((event) => event.event_date && event.event_date.slice(0, 10) >= today)
    .sort((a, b) => a.event_date!.localeCompare(b.event_date!))
  const events = upcomingEvents.map((event) => ({
    id: event.id,
    title: event.title ?? "",
    date: formatDate(event.event_date),
    description: event.description ?? "",
    signedUp: event.participant_ids?.includes(session.id) ?? false,
  }))

  return (
      <>
        <NavBar accentColor={theme.accentColor} isAdmin={session.role === Role.ADMIN}/>
        <DashboardSection studentRoom={studentRoom} studentFloor={studentFloor} studentName={studentName} studentSurname={surnameParts.join(" ")} accentColor={theme.accentColor} studentCourse={student.course ?? ""} bgImage={theme.homeBg} widgetBg={theme.widgetBg} kitchenCleaningDate={formatDate(student.next_kitchen_cleaning_date)} laundryDate={formatDate(student.last_laundry_date)} message={latestMessage} roomCleaningDate={roomCleaningDate} nextEventTitle={events[0]?.title ?? "Nav plānots"} nextEventDate={events[0]?.date ?? "—"}/>
        <EventSection containerBg={theme.notificationBg} events={events}/>
        <FAQSection cardBg={theme.faqCardBg} headingBg={theme.notificationBg}/>
        <ReportSection bgImage={theme.homeBg}/>
      </>
  );
}
