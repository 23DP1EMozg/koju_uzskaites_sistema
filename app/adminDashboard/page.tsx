"use client"

import { FormEvent, useEffect, useState } from "react"
import Image from "next/image"
import { Inter } from "next/font/google"
import Modal from "react-modal"
import { Application } from "../apply/Application"
import { acceptAndEditApplication, deleteTenant, getAllTenants, getTenantById, getUserApplications, rejectApplication } from "./actions"
import { User } from "../types/User"
import ApplicationCard from "./ApplicationCard"
import TenantCard from "./TenantCard"
import AdminNav, { NavItem } from "./AdminNav"
import StatCard from "./StatCard"
import AdminModal from "./AdminModal"
import ConfirmDialog from "./ConfirmDialog"
import InputField from "../components/InputField"

const inter = Inter({
    subsets: ["latin", "latin-ext"],
    style: ["normal", "italic"],
})

const NAV_ITEMS: NavItem[] = [
    { id: "pieteikumi", label: "Pieteikumi" },
    { id: "iemitnieki", label: "Iemītnieki" },
    { id: "sudzibas", label: "Sūdzības" },
    { id: "informacija", label: "Informācija" },
    { id: "pasakumi", label: "Pasākumi" },
]

type PendingConfirm = {
    title: string,
    message: string,
    confirmLabel: string,
    action: () => Promise<void>,
}

const EMPTY_EDIT_DATA: User = {
    id: 0,
    email: "",
    course: "",
    room_number: undefined,
    social_security_number: "",
    name: "",
    phone_number: ""
}

export default function AdminDashboard() {
    const [applications, setApplications] = useState<Application[]>([])
    const [tenants, setTenants] = useState<User[]>([])
    const [isApplicationModalOpen, setIsApplicationModalOpen] = useState<boolean>(false)
    const [isTenantModalOpen, setIsTenantModalOpen] = useState<boolean>(false)
    const [applicationEditData, setApplicationEditData] = useState<User>(EMPTY_EDIT_DATA)
    const [tenantViewData, setTenantViewData] = useState<User | null>(null)
    const [tenantSearch, setTenantSearch] = useState("")
    const [activeSection, setActiveSection] = useState(NAV_ITEMS[0].id)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [pendingConfirm, setPendingConfirm] = useState<PendingConfirm | null>(null)
    const [isConfirming, setIsConfirming] = useState(false)

    const getApplications = async () => {
        try {
            const appl = await getUserApplications()
            setApplications(appl)
        } catch (error) {
            console.error(error)
        }
    }

    const getTenants = async () => {
        try {
            const data = await getAllTenants()
            setTenants(data)
        } catch (error) {
            console.error(error)
        }
    }

    useEffect(() => {
        getUserApplications().then(setApplications).catch(console.error)
        getAllTenants().then(setTenants).catch(console.error)
        Modal.setAppElement("body")
    }, [])

    // Highlight the nav tab of the section currently in view
    useEffect(() => {
        const sections = NAV_ITEMS
            .map(item => document.getElementById(item.id))
            .filter((el): el is HTMLElement => el != null)

        const observer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) setActiveSection(entry.target.id)
            })
        }, { rootMargin: "-40% 0px -55% 0px" })

        sections.forEach(section => observer.observe(section))
        return () => observer.disconnect()
    }, [])

    function closeApplicationModal() {
        setIsApplicationModalOpen(false)
        setApplicationEditData(EMPTY_EDIT_DATA)
    }

    function handleAccept(application: Application) {
        setApplicationEditData({
            ...EMPTY_EDIT_DATA,
            id: application.id!,
            name: application.name,
            email: application.email,
            phone_number: application.phone_number,
            social_security_number: application.social_security_number
        })
        setIsApplicationModalOpen(true)
    }

    async function handleSubmitAccept(e: FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setIsSubmitting(true)
        try {
            await acceptAndEditApplication(applicationEditData)
            closeApplicationModal()
            getApplications()
            getTenants()
        } catch (error) {
            console.error(error)
        } finally {
            setIsSubmitting(false)
        }
    }

    async function handleReject(id: number) {
        try {
            await rejectApplication(id)
            getApplications()
        } catch (error) {
            console.error(error)
        }
    }

    async function handleDeleteTenant(id: number) {
        try {
            await deleteTenant(id)
            getTenants()
        } catch (error) {
            console.error(error)
        }
    }

    async function handleViewTenant(id: number) {
        try {
            const data = await getTenantById(id)
            setTenantViewData(data)
            setIsTenantModalOpen(true)
        } catch (error) {
            console.error(error)
        }
    }

    function confirmRejectApplication(application: Application) {
        setPendingConfirm({
            title: "Noraidīt pieteikumu?",
            message: `${application.name} pieteikums tiks dzēsts. Šo darbību nevar atsaukt.`,
            confirmLabel: "Noraidīt",
            action: () => handleReject(application.id!),
        })
    }

    function confirmDeleteTenant(tenant: User) {
        setPendingConfirm({
            title: "Dzēst iemītnieku?",
            message: `${tenant.name ?? "Iemītnieks"}${tenant.room_number != null ? ` (istaba ${tenant.room_number})` : ""} tiks dzēsts no sistēmas. Šo darbību nevar atsaukt.`,
            confirmLabel: "Dzēst",
            action: () => handleDeleteTenant(tenant.id as number),
        })
    }

    async function runPendingConfirm() {
        if (!pendingConfirm) return
        setIsConfirming(true)
        await pendingConfirm.action()
        setIsConfirming(false)
        setPendingConfirm(null)
    }

    function handleCloseTenantModal() {
        setTenantViewData(null)
        setIsTenantModalOpen(false)
    }

    const updateEditField = (field: keyof User) => (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = field === "room_number"
            ? (e.target.value === "" ? undefined : parseInt(e.target.value))
            : e.target.value
        setApplicationEditData(prev => ({ ...prev, [field]: value }))
    }

    const search = tenantSearch.trim().toLowerCase()
    const filteredTenants = search
        ? tenants.filter(t =>
            t.name?.toLowerCase().includes(search) ||
            String(t.room_number ?? "").includes(search) ||
            t.course?.toLowerCase().includes(search))
        : tenants

    return (
        <div className={`${inter.className} min-h-dvh bg-white`}>
            {/* Hero */}
            <header className="relative flex min-h-dvh flex-col overflow-hidden bg-[#2a0b09] px-4 pt-6 pb-24 text-white lg:px-[3.25rem] lg:pt-8 lg:pb-40">
                <Image
                    src="/admin-background.webp"
                    alt=""
                    fill
                    priority
                    sizes="100vw"
                    className="scale-105 object-cover"
                />

                <div className="relative z-10">
                    <AdminNav
                        items={NAV_ITEMS}
                        activeId={activeSection}
                        hasNotifications={applications.length > 0}
                    />
                </div>

                <div className="relative z-10 mt-auto flex flex-col gap-10 pt-16 lg:flex-row lg:items-end lg:justify-between">
                    <div className="lg:pb-2">
                        <h1 className="text-5xl font-medium tracking-tight sm:text-7xl lg:text-[6.5rem] lg:leading-none">
                            Administrācija
                        </h1>
                        <p className="mt-2 text-2xl sm:text-3xl lg:mt-4 lg:text-[2.75rem]">Kopmītņu pārvaldība</p>
                    </div>

                    <div className="flex w-full gap-4 lg:w-[57%] lg:max-w-[920px] lg:gap-10">
                        <StatCard label="Jauni pieteikumi" value={applications.length} digits={2} variant="light" />
                        <StatCard label="Iemītnieki sistēmā" value={tenants.length} digits={3} variant="red" />
                    </div>
                </div>
            </header>

            {/* Applications */}
            <section
                id="pieteikumi"
                className="relative z-10 -mt-12 scroll-mt-4 rounded-[3rem] bg-black px-4 py-14 text-white lg:-mt-16 lg:px-[7.5rem] lg:py-28"
            >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                    <h2 className="text-5xl font-extrabold italic tracking-tight lg:text-[5.5rem] lg:leading-none">Pieteikumi</h2>
                    <p className="max-w-[26rem] text-lg text-white/75 lg:mr-44 lg:mb-[-1.5rem] lg:text-2xl">
                        Reģistrācijas pieprasījumi, kas gaida apstiprinājumu
                    </p>
                </div>

                {applications.length === 0 ? (
                    <p className="mt-12 text-lg text-white/60 lg:mt-16">Nav jaunu pieteikumu.</p>
                ) : (
                    <div className="mt-10 grid grid-cols-1 gap-6 lg:mt-14 xl:grid-cols-2 xl:gap-10">
                        {applications.map(a => (
                            <ApplicationCard
                                data={a}
                                onAccept={() => handleAccept(a)}
                                onReject={() => confirmRejectApplication(a)}
                                key={a.id}
                            />
                        ))}
                    </div>
                )}
            </section>

            {/* Tenants */}
            <section id="iemitnieki" className="scroll-mt-4 px-4 py-16 lg:px-[7.5rem] lg:py-28">
                <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                    <h2 className="bg-gradient-to-b from-black from-30% to-[#a23a32] bg-clip-text pr-4 text-6xl font-extrabold italic leading-tight tracking-tight text-transparent lg:text-[8.5rem] lg:leading-none">
                        Iemītnieki
                    </h2>
                    <input
                        type="search"
                        value={tenantSearch}
                        onChange={e => setTenantSearch(e.target.value)}
                        placeholder="Meklēt pēc vārda vai istabas"
                        aria-label="Meklēt iemītniekus"
                        className="w-full rounded-full border border-black px-6 py-4 text-lg outline-none transition focus:ring-2 focus:ring-[#a23a32] lg:mb-2 lg:max-w-[600px] lg:py-5"
                    />
                </div>

                <div className="mt-10 flex flex-col gap-5 lg:mt-14">
                    {filteredTenants.length === 0 ? (
                        <p className="text-lg text-black/60">
                            {search ? "Neviens iemītnieks neatbilst meklējumam." : "Sistēmā vēl nav iemītnieku."}
                        </p>
                    ) : (
                        filteredTenants.map(t => (
                            <TenantCard
                                tenant={t}
                                key={t.id}
                                onView={() => handleViewTenant(t.id as number)}
                                onDelete={() => confirmDeleteTenant(t)}
                            />
                        ))
                    )}
                </div>
            </section>

            {/* Complaints — placeholder until tenants can submit complaints */}
            <section
                id="sudzibas"
                className="scroll-mt-4 rounded-[3rem] bg-black px-4 py-14 text-white lg:px-[7.5rem] lg:py-28"
            >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                    <h2 className="text-5xl font-extrabold italic tracking-tight lg:text-[5.5rem] lg:leading-none">Sūdzības</h2>
                    <p className="max-w-[26rem] text-lg text-white/75 lg:mr-44 lg:mb-[-1.5rem] lg:text-2xl">
                        Iemītnieku iesniegtās sūdzības un problēmas
                    </p>
                </div>

                <div className="mt-10 flex flex-col items-center justify-center gap-3 rounded-[28px] border border-dashed border-white/25 px-6 py-16 text-center lg:mt-14 lg:py-24">
                    <span className="text-2xl font-extrabold italic tracking-tight text-[#a23a32] lg:text-3xl">Nav sūdzību</span>
                    <p className="max-w-md text-white/60 lg:text-lg">
                        Šeit parādīsies iemītnieku iesniegtās sūdzības.
                    </p>
                </div>
            </section>

            <footer className="mt-5 h-24 rounded-t-[3rem] bg-black lg:h-32" />

            {/* Accept & edit application */}
            <AdminModal isOpen={isApplicationModalOpen} onClose={closeApplicationModal} title="Apstiprināt pieteikumu">
                <form onSubmit={handleSubmitAccept} className="flex flex-col gap-4">
                    <InputField id="edit_name" label="Vārds Uzvārds" required value={applicationEditData.name ?? ""} onChange={updateEditField("name")} />
                    <InputField id="edit_ssn" label="Personas kods" required value={applicationEditData.social_security_number ?? ""} onChange={updateEditField("social_security_number")} />
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <InputField id="edit_course" label="Kurss" required placeholder="DP2-1" value={applicationEditData.course ?? ""} onChange={updateEditField("course")} />
                        <InputField id="edit_room" label="Istaba" type="number" required placeholder="101" value={applicationEditData.room_number ?? ""} onChange={updateEditField("room_number")} />
                    </div>
                    <InputField id="edit_phone" label="Tel. numurs" type="tel" value={applicationEditData.phone_number ?? ""} onChange={updateEditField("phone_number")} />
                    <InputField id="edit_email" label="E-pasts" type="email" required value={applicationEditData.email ?? ""} onChange={updateEditField("email")} />

                    <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <button type="button" onClick={closeApplicationModal} className="cursor-pointer rounded-full border border-white/80 py-4 text-lg transition hover:bg-white/10">
                            Atcelt
                        </button>
                        <button type="submit" disabled={isSubmitting} className="cursor-pointer rounded-full bg-white py-4 text-lg text-black transition hover:bg-white/85 disabled:opacity-60">
                            {isSubmitting ? "Saglabā..." : "Apstiprināt"}
                        </button>
                    </div>
                </form>
            </AdminModal>

            <ConfirmDialog
                isOpen={pendingConfirm != null}
                title={pendingConfirm?.title ?? ""}
                message={pendingConfirm?.message ?? ""}
                confirmLabel={pendingConfirm?.confirmLabel ?? ""}
                pending={isConfirming}
                onConfirm={runPendingConfirm}
                onCancel={() => { if (!isConfirming) setPendingConfirm(null) }}
            />

            {/* View tenant */}
            <AdminModal isOpen={isTenantModalOpen} onClose={handleCloseTenantModal} title={tenantViewData?.name ?? "Iemītnieks"}>
                <dl className="grid grid-cols-1 gap-x-12 gap-y-5 border-l-2 border-[#a23a32] pl-6 sm:grid-cols-2">
                    {[
                        ["Personas kods", tenantViewData?.social_security_number],
                        ["Istaba", tenantViewData?.room_number],
                        ["Kurss", tenantViewData?.course],
                        ["Tel. numurs", tenantViewData?.phone_number],
                        ["E-pasts", tenantViewData?.email],
                    ].map(([label, value]) => (
                        <div key={label as string} className="min-w-0">
                            <dt className="text-sm text-white/60">{label}</dt>
                            <dd className="truncate text-lg">{value ?? "—"}</dd>
                        </div>
                    ))}
                </dl>
            </AdminModal>
        </div>
    )
}
