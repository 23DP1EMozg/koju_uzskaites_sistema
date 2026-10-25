// Shared by the Informācija form and its server action
export const MAX_ANNOUNCEMENT_LENGTH = 1000
export const ANNOUNCEMENT_CATEGORY = "Informācija"

export const validateAnnouncement = (value: unknown) => {
    const message = typeof value === "string" ? value.trim() : ""
    if (!message) return "Ievadi paziņojuma tekstu."
    if (message.length > MAX_ANNOUNCEMENT_LENGTH) return `Paziņojums nedrīkst būt garāks par ${MAX_ANNOUNCEMENT_LENGTH} simboliem.`
    return null
}
