import NavBar from "@/app/components/NavBarComponents/NavBar";



type DashboardSectionProps = {
    floor: number
    studentName: string
    studentSurname: string
    accentColor: string
};

export default function DashboardSection({floor, studentSurname, studentName, accentColor}: DashboardSectionProps) {
    return (
        <section id={"DashboardSection"} className={`w-full flex justify-center items-start h-[100vh] bg-[url('/backgrounds/RedHomeScreenBg.png')] bg-cover bg-center bg-no-repeat`}>
        <NavBar accentColor={accentColor}/>
        </section>
    )
}