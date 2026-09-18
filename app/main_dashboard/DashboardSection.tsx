import NavBar from "@/app/components/NavBarComponents/NavBar";



type DashboardSectionProps = {
    floor: number
    studentName: string
    studentSurname: string
    accentColor: string
};

export default function DashboardSection({floor, studentSurname, studentName, accentColor}: DashboardSectionProps) {
    return (
        <section className={"w-full flex justify-center items-start h-[100vh]"}>
        <NavBar accentColor={accentColor}/>
        </section>
    )
}