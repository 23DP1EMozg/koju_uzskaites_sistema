"use client";

import NavBar from "@/app/components/NavBarComponents/NavBar";
import DashboardSection from "@/app/main_dashboard/DashboardSection";
import EventSection from "@/app/event_section/EventSection";
import FAQSection from "@/app/faq_section/FAQSection";
import ReportSection from "@/app/report_section/ReportSection";
import {getFloorTheme} from "@/app/helper/theme";
import { useEffect, useState } from "react";
import { getCurrentUser } from "./helper/auth/jwt";
import { User } from "./types/User";
import { useRouter } from "next/navigation";

export default function Home() {
  const studentFloor = 1
  const theme = getFloorTheme(studentFloor)
  const [user, setUser] = useState<User>()
  const router = useRouter()

  const getLoggedInUser = async () => {
    const u = await getCurrentUser()
    if (!u) {
      router.push("/login")
      return
    }

    console.log(u)
    setUser(u)
  }

  useEffect(() => {
    getLoggedInUser()
  }, [])

  return (
      <>
        <NavBar accentColor={theme.accentColor}/>
        <DashboardSection studentRoom={235} studentFloor={studentFloor} studentName={user?.name?.split(" ")[0] as string} studentSurname={user?.name?.split(" ")[1] as string} accentColor={theme.accentColor} studentCourse={"DP6-7"} bgImage={theme.homeBg} widgetBg={theme.widgetBg}/>
        <EventSection containerBg={theme.notificationBg}/>
        <FAQSection cardBg={theme.faqCardBg} headingBg={theme.notificationBg}/>
        <ReportSection bgImage={theme.homeBg}/>
      </>
  );
}
