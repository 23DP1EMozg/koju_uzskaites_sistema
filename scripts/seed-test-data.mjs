// Clears the database and fills it with test data, keeping the accounts listed in KEEP_USER_IDS.
// Run with: node scripts/seed-test-data.mjs --yes
// Every seeded tenant logs in with their personal code and TEST_PASSWORD.
import fs from "node:fs"
import { createClient } from "@supabase/supabase-js"
import bcrypt from "bcryptjs"

const TEST_PASSWORD = "Kojas2026!"

// Edvards Mozga (admin), Liels Zirgs, Marks Krustans
const KEEP_USER_IDS = [12, 13, 14]
// Only the temporary password state of the kept accounts is kept
const KEEP_REMINDER_CATEGORY = "Drošība"

if (!process.argv.includes("--yes")) {
    console.error("This deletes data. Run again with --yes.")
    process.exit(1)
}

const env = Object.fromEntries(fs.readFileSync(new URL("../.env", import.meta.url), "utf8")
    .split(/\r?\n/).filter(line => line.includes("="))
    .map(line => [line.slice(0, line.indexOf("=")).trim(), line.slice(line.indexOf("=") + 1).trim()]))
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY)

const check = ({ data, error }, step) => {
    if (error) throw new Error(`${step}: ${error.message}`)
    return data
}

// Fails loudly when row level security silently skips rows
const deleteWhere = async (table, query) => {
    const deleted = check(await query(supabase.from(table).delete()).select("id"), `delete ${table}`)
    console.log(`${table}: deleted ${deleted.length}`)
}

const keep = `(${KEEP_USER_IDS.join(",")})`
await deleteWhere("complaints", q => q.gte("id", 0))
await deleteWhere("weekend_stay_requests", q => q.not("user_id", "in", keep))
await deleteWhere("events", q => q.gte("id", 0))
await deleteWhere("reminders", q => q.or(`user_id.not.in.${keep},category.neq.${KEEP_REMINDER_CATEGORY}`))
await deleteWhere("users", q => q.not("id", "in", keep))

const password = await bcrypt.hash(TEST_PASSWORD, 12)
const role = JSON.stringify("USER")

// [name, personal code, course, room, phone, last laundry, next kitchen cleaning]
const tenants = [
    ["Jānis Bērziņš", "140306-20117", "DP2-1", 101, "+37120011001", "2026-10-20", "2026-10-29"],
    ["Elīna Kalniņa", "030507-20238", "DP2-1", 102, "+37120011002", "2026-10-02", "2026-10-30"],
    ["Mārtiņš Ozoliņš", "221105-20349", "DP4-1", 105, "+37120011003", "2026-10-22", "2026-11-02"],
    ["Laura Liepiņa", "170806-20451", "M2", 112, "+37120011004", "2026-09-28", "2026-10-27"],
    ["Kristers Krūmiņš", "090207-20562", "A3-1", 118, "+37120011005", "2026-10-24", null],
    ["Sanita Vītola", "251206-20673", "DT2-2", 203, "+37120011006", "2026-10-18", "2026-11-04"],
    ["Ričards Jansons", "050605-20784", "DP3-2", 207, "+37120011007", "2026-10-05", "2026-10-28"],
    ["Agnese Zariņa", "120407-20895", "M3", 211, "+37120011008", "2026-10-23", "2026-11-05"],
    ["Edgars Pētersons", "300906-20916", "A4-1", 219, "+37120011009", "2026-10-21", "2026-11-03"],
    ["Ieva Kļaviņa", "080105-20127", "DT3-1", 224, "+37120011010", "2026-09-30", null],
    ["Toms Šulcs", "190307-20238", "DP2-2", 302, "+37120011011", "2026-10-25", "2026-11-01"],
    ["Paula Grīnberga", "021006-20349", "DP2-2", 306, "+37120011012", "2026-10-19", "2026-10-31"],
    ["Artūrs Siliņš", "270705-20451", "A2-1", 314, "+37120011013", "2026-10-08", "2026-11-06"],
    ["Rūta Eglīte", "110807-20562", "M2", 320, "+37120011014", "2026-10-22", "2026-11-07"],
    ["Dāvis Lācis", "061106-20673", "DP3-1", 327, "+37120011015", "2026-10-17", null],
    ["Linda Ābele", "230205-20784", "DT4-1", 404, "+37120011016", "2026-10-03", "2026-10-29"],
    ["Rihards Kalējs", "150506-20895", "DP4-2", 408, "+37120011017", "2026-10-24", "2026-11-02"],
    ["Madara Sproģe", "040907-20916", "A3-2", 415, "+37120011018", "2026-10-20", "2026-11-08"],
    ["Gustavs Bērziņš", "281206-20127", "DP3-2", 422, "+37120011019", "2026-10-21", "2026-11-03"],
    ["Evelīna Strautiņa", "130405-20238", "M4", 429, "+37120011020", "2026-09-25", "2026-10-30"],
    ["Ralfs Āboliņš", "200107-20349", "DP2-1", 501, "+37120011021", "2026-10-23", "2026-11-05"],
    ["Katrīna Celmiņa", "100606-20451", "DT2-1", 509, "+37120011022", "2026-10-16", null],
    ["Niks Ziediņš", "010805-20562", "A4-2", 516, "+37120011023", "2026-10-25", "2026-11-04"],
    ["Alise Ruņģe", "160307-20673", "DP3-1", 530, "+37120011024", "2026-10-07", "2026-10-31"],
]

// Open applications: no password, course or room until the admin accepts them
const applications = [
    ["Emīls Kārkliņš", "211208-20784", "+37120022001"],
    ["Marta Bērziņa", "070908-20895", "+37120022002"],
    ["Oskars Vanags", "300408-20916", "+37120022003"],
    ["Anete Lūse", "120608-20127", "+37120022004"],
]

// "Mārtiņš Ozoliņš" -> "martins.ozolins@rvt.lv"
const emailFor = name => `${name.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase().replace(/ /g, ".")}@rvt.lv`

const insertedTenants = check(await supabase.from("users").insert(tenants.map(
    ([name, ssn, course, room, phone, laundry, kitchen], i) => ({
        name, social_security_number: ssn, course, room_number: room, phone_number: phone,
        email: emailFor(name), password, role,
        last_laundry_date: laundry, next_kitchen_cleaning_date: kitchen,
        weekend_stay_count: i % 4 === 0 ? 1 : 0,
        created_at: `2026-09-0${1 + i % 5}T09:00:00+00:00`,
    })
)).select("id, name"), "insert tenants")
console.log(`users: inserted ${insertedTenants.length} tenants`)

check(await supabase.from("users").insert(applications.map(([name, ssn, phone], i) => ({
    name, social_security_number: ssn, phone_number: phone, email: emailFor(name),
    role, password: null, created_at: `2026-10-2${i}T1${i}:30:00+00:00`,
}))), "insert applications")
console.log(`users: inserted ${applications.length} applications`)

const idOf = Object.fromEntries(insertedTenants.map(u => [u.name, u.id]))
const ids = names => names.map(name => idOf[name])
const ADMIN_ID = 12

check(await supabase.from("events").insert([
    {
        title: "Iepazīšanās vakars", description: "Jauno un veco iemītnieku iepazīšanās ar spēlēm un picu.",
        event_date: "2026-09-10T18:00:00+00:00", location: "Kopmītnes zāle", created_at: "2026-09-01T10:00:00+00:00",
        participant_ids: ids(["Jānis Bērziņš", "Elīna Kalniņa", "Toms Šulcs", "Paula Grīnberga", "Ralfs Āboliņš", "Rūta Eglīte"]),
    },
    {
        title: "Talka kopmītņu pagalmā", description: "Lapu grābšana un pagalma sakopšana. Cimdi un maisi būs uz vietas.",
        event_date: "2026-10-17T10:00:00+00:00", location: "Pagalms", created_at: "2026-10-05T10:00:00+00:00",
        participant_ids: ids(["Mārtiņš Ozoliņš", "Edgars Pētersons", "Artūrs Siliņš", "Linda Ābele"]),
    },
    {
        title: "Filmu vakars", description: "Skatāmies filmu, ko izvēlēsimies balsojot. Popkorns nodrošināts.",
        event_date: "2026-10-30T19:00:00+00:00", location: "3. stāva atpūtas telpa", created_at: "2026-10-20T10:00:00+00:00",
        participant_ids: [...ids(["Laura Liepiņa", "Agnese Zariņa", "Dāvis Lācis", "Katrīna Celmiņa"]), 13, 14],
    },
    {
        title: "Galda tenisa turnīrs", description: "Pieteikties var līdz 10. novembrim. Uzvarētājam balva.",
        event_date: "2026-11-14T15:00:00+00:00", location: "Sporta zāle", created_at: "2026-10-22T10:00:00+00:00",
        participant_ids: ids(["Kristers Krūmiņš", "Rihards Kalējs", "Gustavs Bērziņš", "Niks Ziediņš"]),
    },
    {
        title: "Ziemassvētku vakars", description: "Kopīga svētku vakarēšana ar dāvanu apmaiņu.",
        event_date: "2026-12-18T18:00:00+00:00", location: "Kopmītnes zāle", created_at: "2026-10-24T10:00:00+00:00",
        participant_ids: [ADMIN_ID],
    },
// events.id has no default in the database, so ids are given here
].map((event, i) => ({ ...event, id: i + 1, created_by: ADMIN_ID, image_url: null }))), "insert events")
console.log("events: inserted 5")

// weekend_date is the Saturday; event_date only for "event", reason_text only for "other"
const stays = [
    ["Jānis Bērziņš", "2026-10-10", "distance", "approved"],
    ["Ieva Kļaviņa", "2026-10-10", "work", "approved"],
    ["Artūrs Siliņš", "2026-10-17", "event", "approved", { event_date: "2026-10-17" }],
    ["Linda Ābele", "2026-10-17", "distance", "approved"],
    ["Toms Šulcs", "2026-10-24", "other", "rejected", { reason_text: "Gribu palikt, jo draugi arī paliek." }],
    ["Rihards Kalējs", "2026-10-24", "work", "approved"],
    ["Jānis Bērziņš", "2026-10-31", "distance", "approved"],
    ["Laura Liepiņa", "2026-10-31", "event", "pending", { event_date: "2026-10-30" }],
    ["Niks Ziediņš", "2026-10-31", "work", "pending"],
    ["Evelīna Strautiņa", "2026-10-31", "other", "pending", { reason_text: "Sestdien jākārto eksāmens otrā kursā, svētdien konsultācija." }],
]
check(await supabase.from("weekend_stay_requests").insert(stays.map(([name, weekend, reason, status, extra]) => ({
    user_id: idOf[name], weekend_date: weekend, reason, status, event_date: null, reason_text: null, ...extra,
    created_at: `${weekend.slice(0, 8)}${String(Number(weekend.slice(8)) - 2).padStart(2, "0")}T12:00:00+00:00`,
}))), "insert weekend stays")
console.log(`weekend_stay_requests: inserted ${stays.length}`)

const complaints = [
    ["Elīna Kalniņa", "Otrā stāva dušā jau nedēļu tek ūdens no krāna, pat ja tas ir aizgriezts.", "2026-10-06"],
    ["Ričards Jansons", "Virtuvē 2. stāvā nedarbojas viena plīts riņķis.", "2026-10-09"],
    ["Paula Grīnberga", "Kaimiņi no 307. istabas regulāri trokšņo pēc pusnakts darbdienās.", "2026-10-13"],
    ["Linda Ābele", "Istabā 404 logs neaizveras līdz galam, naktīs ir ļoti auksti.", "2026-10-15"],
    ["Artūrs Siliņš", "Veļas mašīna Nr. 2 pagrabā neizgriež veļu, tā paliek slapja.", "2026-10-19"],
    ["Katrīna Celmiņa", "5. stāva gaitenī nedeg divas lampas pie kāpnēm.", "2026-10-21"],
    ["Toms Šulcs", "Ledusskapī virtuvē kāds regulāri paņem manus produktus.", "2026-10-23"],
    ["Madara Sproģe", "Wi-Fi 4. stāvā vakaros pazūd uz vairākām minūtēm.", "2026-10-25"],
]
check(await supabase.from("complaints").insert(complaints.map(([name, description, date]) => ({
    user_id: idOf[name], description, created_at: `${date}T16:00:00+00:00`,
}))), "insert complaints")
console.log(`complaints: inserted ${complaints.length}`)

// Laundry reminders for the tenants whose last laundry is overdue
const overdue = tenants.filter(t => t[5] < "2026-10-10").map(t => t[0])
check(await supabase.from("reminders").insert(overdue.map((name, i) => ({
    user_id: idOf[name], message: "Jums ir jānodod veļa", category: "Atgādinājums",
    read_by: i % 2 === 0 ? [String(idOf[name])] : [], created_at: "2026-10-24T08:00:00+00:00",
}))), "insert reminders")
console.log(`reminders: inserted ${overdue.length}`)
