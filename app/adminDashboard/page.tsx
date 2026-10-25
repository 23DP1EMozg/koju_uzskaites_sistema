"use client"

import { FormEvent, useCallback, useEffect, useState } from "react"
import Image from "next/image"
import { Inter } from "next/font/google"
import Modal from "react-modal"
import { Application } from "../apply/Application"
import { acceptAndEditApplication, deleteTenant, getAllComplaints, getAllTenants, getOverdueLaundryTenants, getTenantById, notifyOverdueTenant, getUserApplications, getWeekendStays, rejectApplication, setWeekendStayStatus } from "./actions"
import { User } from "../types/User"
import ApplicationCard from "./ApplicationCard"
import TenantCard from "./TenantCard"
import OverdueTenantCard from "./OverdueTenantCard"
import ComplaintCard, { complaintSenderLabel, formatComplaintDate } from "./ComplaintCard"
import Pagination, { usePagination } from "./Pagination"
import AdminNav, { NavItem } from "./AdminNav"
import StatCard from "./StatCard"
import AdminModal from "./AdminModal"
import ConfirmDialog from "./ConfirmDialog"
import InputField from "../components/InputField"
import Toast, { ToastMessage } from "../components/Toast"
import { FieldErrors, TenantFields, formatSocialSecurityNumber, hasErrors, validateTenant } from "../helper/validation"
import { Complaint } from "../types/Complaint"
import { OverdueTenant } from "../types/OverdueTenant"
import { WeekendStay } from "../types/WeekendStay"
import WeekendStayCard from "./WeekendStayCard"
import InfoSection from "./InfoSection"
import EventsSection from "./EventsSection"

const inter = Inter({
    subsets: ["latin", "latin-ext"],
    style: ["normal", "italic"],
})

const NAV_ITEMS: NavItem[] = [
    { id: "pieteikumi", label: "Pieteikumi" },
    { id: "iemitnieki", label: "Iemītnieki" },
    { id: "kavetaji", label: "Kavētāji" },
    { id: "paliksana", label: "Palikšana" },
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

const APPLICATIONS_PER_PAGE = 4
const TENANTS_PER_PAGE = 8
const COMPLAINTS_PER_PAGE = 5
const WEEKEND_STAYS_PER_PAGE = 5

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
    const [editErrors, setEditErrors] = useState<FieldErrors<keyof TenantFields>>({})
    // Shown inside the modal, since a toast would sit behind its overlay
    const [editError, setEditError] = useState<string | null>(null)
    const [toast, setToast] = useState<ToastMessage | null>(null)
    const [pendingConfirm, setPendingConfirm] = useState<PendingConfirm | null>(null)
    const [isConfirming, setIsConfirming] = useState(false)
    const [complaints, setComplaints] = useState<Complaint[]>([])
    const [complaintViewData, setComplaintViewData] = useState<Complaint | null>(null)
    const [overdueTenants, setOverdueTenants] = useState<OverdueTenant[]>([])
    const [weekendStays, setWeekendStays] = useState<(WeekendStay & { month_stay_count: number })[]>([])

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
        getOverdueLaundryTenants().then(setOverdueTenants).catch(console.error)
        getWeekendStays().then(setWeekendStays).catch(console.error)
        getAllComplaints()
            .then(comp => setComplaints([...comp].sort((a, b) => (b.created_at ?? "").localeCompare(a.created_at ?? "")))) // newest first
            .catch(console.error)
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
        setEditErrors({})
        setEditError(null)
    }

    const closeToast = useCallback(() => setToast(null), [])
    const showToast = useCallback((text: string, variant: ToastMessage["variant"]) => setToast({ id: Date.now(), text, variant }), [])

    const editFields = (u: User): TenantFields => ({
        name: u.name ?? "",
        social_security_number: u.social_security_number ?? "",
        course: u.course ?? "",
        room_number: u.room_number,
        phone_number: u.phone_number ?? "",
        email: u.email ?? "",
    })

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
        setToast(null)
        setEditError(null)

        const fieldErrors = validateTenant(editFields(applicationEditData))
        setEditErrors(fieldErrors)
        if (hasErrors(fieldErrors)) return

        setIsSubmitting(true)
        try {
            const result = await acceptAndEditApplication(applicationEditData)
            if (!result.ok) {
                setEditError(result.error)
                return
            }
            closeApplicationModal()
            setToast(result.emailSent
                ? { id: Date.now(), text: "Pieteikums apstiprināts. Piekļuves dati nosūtīti e-pastā.", variant: "success" }
                : { id: Date.now(), text: "Pieteikums apstiprināts, bet e-pastu ar piekļuves datiem neizdevās nosūtīt.", variant: "error" })
            getApplications()
            getTenants()
        } catch (error) {
            console.error(error)
            setEditError("Radās neparedzēta kļūda. Mēģini vēlreiz.")
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
            showToast("Neizdevās noraidīt pieteikumu. Mēģini vēlreiz.", "error")
        }
    }

    async function handleDeleteTenant(id: number) {
        try {
            await deleteTenant(id)
            getTenants()
        } catch (error) {
            console.error(error)
            showToast("Neizdevās dzēst iemītnieku. Mēģini vēlreiz.", "error")
        }
    }

    async function handleViewTenant(id: number) {
        try {
            const data = await getTenantById(id)
            setTenantViewData(data)
            setIsTenantModalOpen(true)
        } catch (error) {
            console.error(error)
            showToast("Neizdevās ielādēt iemītnieka datus. Mēģini vēlreiz.", "error")
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
        // Room keeps only digits, the personal code gets its dash, the course is always in capitals
        const digits = e.target.value.replace(/\D/g, "")
        const value = field === "room_number"
            ? (digits === "" ? undefined : parseInt(digits))
            : field === "course" ? e.target.value.toUpperCase()
            : field === "social_security_number" ? formatSocialSecurityNumber(e.target.value, applicationEditData.social_security_number)
            : e.target.value
        setApplicationEditData(prev => ({ ...prev, [field]: value }))
        setEditErrors(prev => ({ ...prev, [field]: undefined }))
    }

    const search = tenantSearch.trim().toLowerCase()
    const filteredTenants = search
        ? tenants.filter(t =>
            t.name?.toLowerCase().includes(search) ||
            String(t.room_number ?? "").includes(search) ||
            t.course?.toLowerCase().includes(search))
        : tenants


    const findSender = (userId?: number) => tenants.find(t => t.id === userId)

    const applicationPages = usePagination(applications, APPLICATIONS_PER_PAGE)
    const tenantPages = usePagination(filteredTenants, TENANTS_PER_PAGE)
    const complaintPages = usePagination(complaints, COMPLAINTS_PER_PAGE)
    const weekendStayPages = usePagination(weekendStays, WEEKEND_STAYS_PER_PAGE)

    return (
        <div className={`${inter.className} min-h-dvh bg-white`}>
            <Toast toast={toast} onClose={closeToast} />

            <AdminNav
                items={NAV_ITEMS}
                activeId={activeSection}
                hasNotifications={applications.length > 0}
            />

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

                {/* Holds the space of the fixed nav */}
                <div className="h-12 shrink-0 lg:h-[4.9rem]" />

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
                className="relative z-10 -mt-12 scroll-mt-24 lg:scroll-mt-32 rounded-[3rem] bg-black px-4 py-14 text-white lg:-mt-16 lg:px-[7.5rem] lg:py-28"
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
                        {applicationPages.pageItems.map(a => (
                            <ApplicationCard
                                data={a}
                                onAccept={() => handleAccept(a)}
                                onReject={() => confirmRejectApplication(a)}
                                key={a.id}
                            />
                        ))}
                    </div>
                )}
                <Pagination page={applicationPages.page} pageCount={applicationPages.pageCount} onChange={applicationPages.setPage} variant="dark" />
            </section>

            {/* Tenants */}
            <section id="iemitnieki" className="scroll-mt-24 lg:scroll-mt-32 px-4 py-16 lg:px-[7.5rem] lg:py-28">
                <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                    <h2 className="bg-gradient-to-b from-black from-30% to-[#a23a32] bg-clip-text pr-4 text-6xl font-extrabold italic leading-tight tracking-tight text-transparent lg:text-[8.5rem] lg:leading-none">
                        Iemītnieki
                    </h2>
                    <input
                        type="search"
                        value={tenantSearch}
                        onChange={e => { setTenantSearch(e.target.value); tenantPages.setPage(1) }}
                        placeholder="Meklēt pēc vārda, istabas vai kursa"
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
                        tenantPages.pageItems.map(t => (
                            <TenantCard
                                tenant={t}
                                key={t.id}
                                onView={() => handleViewTenant(t.id as number)}
                                onDelete={() => confirmDeleteTenant(t)}
                            />
                        ))
                    )}
                </div>
                <Pagination page={tenantPages.page} pageCount={tenantPages.pageCount} onChange={tenantPages.setPage} variant="light" />
            </section>

            {/* Overdue cleaning — tenants who skipped laundry or kitchen cleaning for over 3 weeks */}
            <section id="kavetaji" className="scroll-mt-24 lg:scroll-mt-32 px-4 pb-16 lg:px-[7.5rem] lg:pb-28">
                <div className="rounded-[3rem] bg-[url('/backgrounds/redTheme/NotificationContainerRedBg.png')] bg-cover bg-center px-3 py-14 text-white lg:px-16 lg:py-20">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                        <h2 className="text-5xl font-extrabold italic tracking-tight lg:text-[5.5rem] lg:leading-none">Kavētāji</h2>
                        <p className="max-w-[26rem] text-lg text-white/75 lg:mb-[-1.5rem] lg:text-2xl">
                            Iemītnieki, kas vairāk nekā 3 nedēļas nav tīrījuši veļas telpu vai virtuvi
                        </p>
                    </div>

                    <div className="mt-10 flex flex-col gap-5 lg:mt-14">
                        {overdueTenants.length === 0 ? (
                            <p className="text-lg text-white/75">Visi pienākumi ir izpildīti laikā.</p>
                        ) : (
                            overdueTenants.map(t => (
                                <OverdueTenantCard
                                    tenant={t}
                                    key={t.id}
                                    onNotify={() => notifyOverdueTenant(t.id).catch(error => {
                                        showToast("Neizdevās nosūtīt atgādinājumu. Mēģini vēlreiz.", "error")
                                        throw error
                                    })}
                                />
                            ))
                        )}
                    </div>
                </div>
            </section>

            {/* Weekend stay requests */}
            <section id="paliksana" className="scroll-mt-24 lg:scroll-mt-32 px-4 pb-16 lg:px-[7.5rem] lg:pb-28">
                <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                    <h2 className="bg-gradient-to-b from-black from-30% to-[#a23a32] bg-clip-text pr-4 text-6xl font-extrabold italic leading-tight tracking-tight text-transparent lg:text-[8.5rem] lg:leading-none">
                        Palikšana
                    </h2>
                    <p className="max-w-[26rem] text-lg text-black/60 lg:mb-2 lg:text-2xl">
                        Iemītnieki, kas vēlas palikt dienesta viesnīcā brīvdienās
                    </p>
                </div>

                <div className="mt-10 flex flex-col gap-5 lg:mt-14">
                    {weekendStays.length === 0 ? (
                        <p className="text-lg text-black/60">Nav palikšanas pieteikumu.</p>
                    ) : (
                        weekendStayPages.pageItems.map(s => (
                            <WeekendStayCard
                                stay={s}
                                tenant={findSender(s.user_id)}
                                key={s.id}
                                onDecide={async status => {
                                    try {
                                        await setWeekendStayStatus(s.id as number, status)
                                        setWeekendStays(await getWeekendStays())
                                    } catch (error) {
                                        showToast("Neizdevās saglabāt lēmumu. Mēģini vēlreiz.", "error")
                                        throw error
                                    }
                                }}
                            />
                        ))
                    )}
                </div>
                <Pagination page={weekendStayPages.page} pageCount={weekendStayPages.pageCount} onChange={weekendStayPages.setPage} variant="light" />
            </section>

            {/* Complaints submitted by tenants */}
            <section
                id="sudzibas"
                className="scroll-mt-24 lg:scroll-mt-32 rounded-[3rem] bg-black px-4 py-14 text-white lg:px-[7.5rem] lg:py-28"
            >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                    <h2 className="text-5xl font-extrabold italic tracking-tight lg:text-[5.5rem] lg:leading-none">Sūdzības</h2>
                    <p className="max-w-[26rem] text-lg text-white/75 lg:mr-44 lg:mb-[-1.5rem] lg:text-2xl">
                        Iemītnieku iesniegtās sūdzības un problēmas
                    </p>
                </div>

                {complaints.length === 0 ? (
                    <div className="mt-10 flex flex-col items-center justify-center gap-3 rounded-[28px] border border-dashed border-white/25 px-6 py-16 text-center lg:mt-14 lg:py-24">
                        <span className="text-2xl font-extrabold italic tracking-tight text-[#a23a32] lg:text-3xl">Nav sūdzību</span>
                        <p className="max-w-md text-white/60 lg:text-lg">
                            Šeit parādīsies iemītnieku iesniegtās sūdzības.
                        </p>
                    </div>
                ) : (
                    <>
                        <div className="mt-10 flex flex-col gap-5 lg:mt-14">
                            {complaintPages.pageItems.map(c => (
                                <ComplaintCard
                                    complaint={c}
                                    sender={findSender(c.user_id)}
                                    key={c.id}
                                    onView={() => setComplaintViewData(c)}
                                />
                            ))}
                        </div>

                        <Pagination page={complaintPages.page} pageCount={complaintPages.pageCount} onChange={complaintPages.setPage} variant="dark" />
                    </>
                )}
            </section>

            <InfoSection showToast={showToast} />

            <EventsSection showToast={showToast} requestConfirm={setPendingConfirm} />

            {/* Bottom padding on phones keeps the last section clear of the fixed section bar */}
            <footer className="mt-5 h-28 rounded-t-[3rem] bg-black lg:h-32" />

            {/* Accept & edit application */}
            <AdminModal isOpen={isApplicationModalOpen} onClose={closeApplicationModal} title="Apstiprināt pieteikumu">
                <form onSubmit={handleSubmitAccept} noValidate className="flex flex-col gap-4">
                    <InputField id="edit_name" label="Vārds Uzvārds" required maxLength={100} value={applicationEditData.name ?? ""} onChange={updateEditField("name")} error={editErrors.name} />
                    <InputField id="edit_ssn" label="Personas kods" required inputMode="numeric" maxLength={12} placeholder="000000-00000" value={applicationEditData.social_security_number ?? ""} onChange={updateEditField("social_security_number")} error={editErrors.social_security_number} />
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <InputField id="edit_course" label="Kurss" required maxLength={10} placeholder="DP4-1" value={applicationEditData.course ?? ""} onChange={updateEditField("course")} error={editErrors.course} />
                        <InputField id="edit_room" label="Istaba" required inputMode="numeric" maxLength={3} placeholder="101" value={applicationEditData.room_number ?? ""} onChange={updateEditField("room_number")} error={editErrors.room_number} />
                    </div>
                    <InputField id="edit_phone" label="Tel. numurs" type="tel" required placeholder="+371 20000000" value={applicationEditData.phone_number ?? ""} onChange={updateEditField("phone_number")} error={editErrors.phone_number} />
                    <InputField id="edit_email" label="E-pasts" type="email" required value={applicationEditData.email ?? ""} onChange={updateEditField("email")} error={editErrors.email} />

                    {editError && <p role="alert" className="text-sm text-[#ffb4ab]">{editError}</p>}

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

            {/* View complaint */}
            <AdminModal isOpen={complaintViewData != null} onClose={() => setComplaintViewData(null)} title="Sūdzība">
                <dl className="grid grid-cols-1 gap-x-12 gap-y-5 border-l-2 border-[#a23a32] pl-6 sm:grid-cols-2">
                    <div className="min-w-0">
                        <dt className="text-sm text-white/60">Iesniedza</dt>
                        <dd className="text-lg">{complaintSenderLabel(findSender(complaintViewData?.user_id))}</dd>
                    </div>
                    <div className="min-w-0">
                        <dt className="text-sm text-white/60">Datums</dt>
                        <dd className="text-lg">{formatComplaintDate(complaintViewData?.created_at)}</dd>
                    </div>
                </dl>
                <p className="mt-8 whitespace-pre-line break-words text-lg text-white/90">{complaintViewData?.description}</p>
            </AdminModal>

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
