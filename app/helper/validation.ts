// Form rules shared by the forms (instant feedback) and their server actions (the real check).
// Each validator returns a Latvian error message, or null when the value is valid.
import { WEEKEND_STAY_REASONS, weekendRange } from "../types/WeekendStay"

export type FieldErrors<T extends string = string> = Partial<Record<T, string>>

// The first message of a form's errors, for server actions that report a single error
export const firstError = (errors: FieldErrors): string | null =>
    Object.values(errors).find(Boolean) ?? null

export const hasErrors = (errors: FieldErrors) => firstError(errors) != null

// Rooms are numbered floor digit + 01..30, e.g. 101–130 up to 501–530
export const FLOORS = 5
export const ROOMS_PER_FLOOR = 30

export const MIN_PASSWORD_LENGTH = 8
// bcrypt ignores everything after 72 bytes
export const MAX_PASSWORD_LENGTH = 72

export const MAX_NAME_LENGTH = 100
export const MAX_EMAIL_LENGTH = 254
export const MIN_COMPLAINT_LENGTH = 10
export const MAX_COMPLAINT_LENGTH = 1000
export const MAX_STAY_REASON_LENGTH = 500

export const SSN_PATTERN = /^\d{6}-\d{5}$/

// Formats a personal code while it is typed: keeps digits only and puts the single dash after
// the 6th digit, so a dash typed by hand never doubles up
export const formatSocialSecurityNumber = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 11)
    const dash = digits.length > 6 || (digits.length === 6 && value.trimEnd().endsWith("-"))
    return dash ? `${digits.slice(0, 6)}-${digits.slice(6)}` : digits
}

const NAME_PART = /^\p{L}+(?:['’-]\p{L}+)*$/u
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
// 8 digits (Latvian, +371 optional) or any international number with its + country code
const PHONE_PATTERN = /^(?:\d{8}|\+\d{8,15})$/
// Groups vary (M2, DP4-1, A3-1), so only check it starts with a letter and stays short
const COURSE_PATTERN = /^[A-ZĀČĒĢĪĶĻŅŠŪŽ][A-ZĀČĒĢĪĶĻŅŠŪŽ0-9-]{0,9}$/

// Server actions can be called with anything, so non-strings count as empty
const text = (value: unknown) => typeof value === "string" ? value : ""

// Collapses repeated spaces so "Jānis  Bērziņš " is stored as "Jānis Bērziņš"
export const normalizeName = (value: string) => text(value).trim().replace(/\s+/g, " ")
export const normalizeCourse = (value: string) => text(value).trim().toUpperCase()

export const validateName = (value: string) => {
    const name = normalizeName(value)
    if (!name) return "Ievadi vārdu un uzvārdu."
    if (name.length > MAX_NAME_LENGTH) return `Vārds un uzvārds nedrīkst būt garāks par ${MAX_NAME_LENGTH} simboliem.`
    const parts = name.split(" ")
    if (parts.length < 2) return "Ievadi gan vārdu, gan uzvārdu."
    if (!parts.every(part => NAME_PART.test(part))) return "Vārdā un uzvārdā drīkst būt tikai burti, defise un apostrofs."
    return null
}

// Old codes start with the birth date (DDMMYY) and the digit after the dash gives the century;
// codes issued since 2017 start with 32 and carry no date
export const validateSocialSecurityNumber = (value: string) => {
    const ssn = text(value).trim()
    if (!ssn) return "Ievadi personas kodu."
    if (!SSN_PATTERN.test(ssn)) return "Personas kodam jābūt formātā 000000-00000."
    if (ssn.startsWith("32")) return null

    const century = [1800, 1900, 2000][Number(ssn[7])]
    const day = Number(ssn.slice(0, 2))
    const month = Number(ssn.slice(2, 4))
    const year = century + Number(ssn.slice(4, 6))
    const date = new Date(Date.UTC(year, month - 1, day))
    const isRealDate = century != null
        && date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day

    if (!isRealDate || date > new Date()) return "Personas kodā nav derīga dzimšanas datuma."
    return null
}

export const validateEmail = (value: string) => {
    const email = text(value).trim()
    if (!email) return "Ievadi e-pasta adresi."
    if (email.length > MAX_EMAIL_LENGTH || !EMAIL_PATTERN.test(email)) return "Ievadi derīgu e-pasta adresi."
    return null
}

export const validatePhoneNumber = (value: string) => {
    const phone = text(value).trim()
    if (!phone) return "Ievadi tālruņa numuru."
    if (!PHONE_PATTERN.test(phone.replace(/[\s-]/g, ""))) return "Ievadi 8 ciparu numuru (piem., +371 20000000) vai ārzemju numuru ar valsts kodu."
    return null
}

export const validateCourse = (value: string) => {
    const course = normalizeCourse(value)
    if (!course) return "Ievadi kursu."
    if (!COURSE_PATTERN.test(course)) return "Kursam jāsākas ar burtu, piem., DP4-1 vai M2."
    return null
}

export const validateRoomNumber = (value: number | string | null | undefined) => {
    const room = String(value ?? "").trim()
    if (!room) return "Ievadi istabas numuru."
    const match = /^(\d)(\d\d)$/.exec(room)
    const floor = Number(match?.[1])
    const number = Number(match?.[2])
    if (!match || floor < 1 || floor > FLOORS || number < 1 || number > ROOMS_PER_FLOOR) {
        return `Istabas numuram jābūt no x01 līdz x${ROOMS_PER_FLOOR}, kur x ir stāvs (1–${FLOORS}).`
    }
    return null
}

export const validateNewPassword = (input: string) => {
    const value = text(input)
    if (!value) return "Ievadi jauno paroli."
    if (value.length < MIN_PASSWORD_LENGTH) return `Jaunajai parolei jābūt vismaz ${MIN_PASSWORD_LENGTH} simbolus garai.`
    if (value.length > MAX_PASSWORD_LENGTH) return `Parole nedrīkst būt garāka par ${MAX_PASSWORD_LENGTH} simboliem.`
    if (value.trim() !== value) return "Parole nedrīkst sākties vai beigties ar atstarpi."
    return null
}

export type ApplicationFields = {
    name: string,
    social_security_number: string,
    email: string,
    phone_number: string,
}

export const validateApplication = (values: ApplicationFields): FieldErrors<keyof ApplicationFields> => ({
    social_security_number: validateSocialSecurityNumber(values.social_security_number) ?? undefined,
    name: validateName(values.name) ?? undefined,
    phone_number: validatePhoneNumber(values.phone_number) ?? undefined,
    email: validateEmail(values.email) ?? undefined,
})

// The admin's accept form: the application fields plus the course and room
export type TenantFields = ApplicationFields & {
    course: string,
    room_number: number | string | null | undefined,
}

export const validateTenant = (values: TenantFields): FieldErrors<keyof TenantFields> => ({
    name: validateName(values.name) ?? undefined,
    social_security_number: validateSocialSecurityNumber(values.social_security_number) ?? undefined,
    course: validateCourse(values.course) ?? undefined,
    room_number: validateRoomNumber(values.room_number) ?? undefined,
    phone_number: validatePhoneNumber(values.phone_number) ?? undefined,
    email: validateEmail(values.email) ?? undefined,
})

// Only the format: existing accounts must be able to log in whatever their code looks like
export const validateLogin = (values: { socialSecurityNumber: string, password: string }) => ({
    socialSecurityNumber: !text(values.socialSecurityNumber).trim()
        ? "Ievadi personas kodu."
        : SSN_PATTERN.test(text(values.socialSecurityNumber).trim()) ? undefined : "Personas kodam jābūt formātā 000000-00000.",
    password: text(values.password) ? undefined : "Ievadi paroli.",
})

export const validatePasswordChange = (values: { current: string, next: string, confirm: string }) => ({
    current: values.current ? undefined : "Ievadi pašreizējo paroli.",
    next: validateNewPassword(values.next)
        ?? (values.current && values.next === values.current ? "Jaunajai parolei jāatšķiras no pašreizējās." : undefined),
    confirm: !values.confirm
        ? "Atkārto jauno paroli."
        : values.confirm === values.next ? undefined : "Jaunās paroles nesakrīt.",
})

export const validateComplaint = (description: string) => {
    const complaint = text(description).trim()
    if (!complaint) return "Apraksti problēmu."
    if (complaint.length < MIN_COMPLAINT_LENGTH) return `Aprakstā jābūt vismaz ${MIN_COMPLAINT_LENGTH} simboliem.`
    if (complaint.length > MAX_COMPLAINT_LENGTH) return `Apraksts nedrīkst būt garāks par ${MAX_COMPLAINT_LENGTH} simboliem.`
    return null
}

export type WeekendStayFields = {
    weekendDate: string,
    reason: string,
    eventDate: string,
    reasonText: string,
}

export const validateWeekendStay = (values: WeekendStayFields): FieldErrors<keyof WeekendStayFields> => {
    const { from, to } = weekendRange(text(values.weekendDate))
    const reasonText = text(values.reasonText).trim()

    return {
        reason: Object.hasOwn(WEEKEND_STAY_REASONS, values.reason) ? undefined : "Izvēlies palikšanas iemeslu.",
        eventDate: values.reason !== "event" ? undefined
            : !values.eventDate ? "Norādi pasākuma datumu."
            : values.eventDate < from || values.eventDate > to ? "Pasākuma datumam jābūt šajā nedēļas nogalē (piektdiena–svētdiena)."
            : undefined,
        reasonText: values.reason !== "other" ? undefined
            : !reasonText ? "Apraksti palikšanas iemeslu."
            : reasonText.length > MAX_STAY_REASON_LENGTH ? `Iemesls nedrīkst būt garāks par ${MAX_STAY_REASON_LENGTH} simboliem.`
            : undefined,
    }
}

export const MAX_EVENT_TITLE_LENGTH = 100
export const MAX_EVENT_DESCRIPTION_LENGTH = 2000
export const MAX_EVENT_LOCATION_LENGTH = 100

export type EventFields = {
    title: string,
    description: string,
    event_date: string,
    location: string,
    image_url: string,
}

// No event form exists yet; the event server actions use this so nothing unchecked reaches the database
export const validateEvent = (values: Partial<EventFields>): FieldErrors<keyof EventFields> => {
    const title = text(values.title).trim()
    const description = text(values.description).trim()
    const location = text(values.location).trim()
    const imageUrl = text(values.image_url).trim()
    const date = text(values.event_date)

    return {
        title: !title ? "Ievadi pasākuma nosaukumu."
            : title.length > MAX_EVENT_TITLE_LENGTH ? `Nosaukums nedrīkst būt garāks par ${MAX_EVENT_TITLE_LENGTH} simboliem.`
            : undefined,
        description: description.length > MAX_EVENT_DESCRIPTION_LENGTH ? `Apraksts nedrīkst būt garāks par ${MAX_EVENT_DESCRIPTION_LENGTH} simboliem.` : undefined,
        event_date: !date ? "Norādi pasākuma datumu."
            : !/^\d{4}-\d{2}-\d{2}/.test(date) || Number.isNaN(Date.parse(date)) ? "Pasākuma datums nav derīgs."
            : undefined,
        location: location.length > MAX_EVENT_LOCATION_LENGTH ? `Vieta nedrīkst būt garāka par ${MAX_EVENT_LOCATION_LENGTH} simboliem.` : undefined,
        image_url: imageUrl && !/^https?:\/\/\S+$/i.test(imageUrl) ? "Attēla saitei jāsākas ar http:// vai https://." : undefined,
    }
}
