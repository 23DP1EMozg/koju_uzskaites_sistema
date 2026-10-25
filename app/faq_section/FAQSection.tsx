'use client'
import FAQCard, {FAQItem} from "@/app/components/faqComponents/FAQCard";
import {useState} from "react";

type FAQSectionProps = {
    cardBg: string
    headingBg: string
};

// Addresses and contacts from rvt.lv, house rules from the dormitory administration
const faqItems: FAQItem[] = [
    {question: 'Kur atrodas RVT dienesta viesnīcas?', answer: "Rīgas Valsts tehnikumam ir divas dienesta viesnīcas Rīgā: Dārzciema ielā 64 un Ūnijas ielā 31A. Tavas istabas numurs ir redzams profila sadaļā."},
    {question: 'Cikos var ieiet un iziet no kopmītnēm?', answer: "Ieeja un izeja no dienesta viesnīcas ir atļauta katru dienu no 6:00 līdz 23:00. Ja zini, ka neatgriezīsies laikā, iepriekš brīdini dienesta viesnīcas vadītāju."},
    {question: 'Kad ir atvērta virtuve?', answer: "Virtuve ir atvērta katru dienu no 6:00 līdz 22:00. Pēc ēst gatavošanas sakop aiz sevis un nomazgā traukus."},
    {question: 'Kā notiek virtuves tīrīšana?', answer: "Virtuvi tīra pa istabām secīgi, pēc istabu numuru kārtības. Tavas istabas nākamās virtuves tīrīšanas datums ir redzams profila sadaļā logā „Nākamā virtuves tīrīšana”."},
    {question: 'Kad notiek istabu tīrīšana?', answer: "Istabu tīrīšana notiek katru trešdienu. Nākamās tīrīšanas datums ir redzams profila sadaļā."},
    {question: 'Kā pieteikt palikšanu brīvdienās?', answer: "Ja vēlies palikt dienesta viesnīcā brīvdienās, tas jāpiesaka iepriekš dienesta viesnīcas vadītājam, norādot palikšanas iemeslu."},
    {question: 'Kā tiek apmaksāti rēķini?', answer: "Rēķini par dzīvošanu dienesta viesnīcā tiek nosūtīti uz tavu e-pastu. Atlaide pienākas Goda ģimenes apliecības „3+ Ģimenes karte” īpašniekiem un personām ar trūcīgas personas statusu."},
    {question: 'Vai es varu atvest draugus?', answer: "Nē, viesi dienesta viesnīcā drīkst būt tikai ģimenes locekļi vai radinieki. Par viņu ierašanos iepriekš jāpaziņo dežurantam."},
    {question: 'Kā pieteikt remontu istabā?', answer: "Bojājumu vai nepieciešamo remontu apraksti sadaļā „Sūdzības” šajā lietotnē, norādot istabas numuru un problēmu. Ja bojājums ir steidzams, piemēram, ūdens noplūde, uzreiz informē dežurantu vai dienesta viesnīcas vadītāju."},
    {question: 'Kā atzīmēt gultas veļas maiņu?', answer: "Profila sadaļā atver logu „Pēdējā veļas maiņa” un nospied „Pieteikt”, kad esi nomainījis gultas veļu. Ja veļa ilgi nav mainīta, administrācija tev nosūtīs atgādinājumu."},
    {question: 'Ko darīt, ja pazaudēju atslēgu?', answer: "Nekavējoties paziņo dežurantam vai dienesta viesnīcas vadītājam, lai istabu varētu nodrošināt un izsniegt jaunu atslēgu."},
    {question: 'Kā sazināties ar dienesta viesnīcas vadītāju?', answer: "Dienesta viesnīcas vadītājs ir sasniedzams pa tālruni +371 20370857. Vispārīgos jautājumos vari rakstīt uz kanceleja@rvt.lv vai zvanīt +371 26128169."},
]

// The right column also holds the FAQ heading, so the left one takes more cards
const LEFT_COLUMN_COUNT = Math.ceil(faqItems.length / 2) + 1

export default function FAQSection({cardBg, headingBg}: FAQSectionProps) {
    const [openItems, setOpenItems] = useState<number[]>([])
    const toggleItem = (index: number) => setOpenItems((prev) => prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index])

    const renderCards = (items: FAQItem[], offset: number) => items.map((item, i) => (
        <FAQCard key={offset + i} item={item} bgImage={cardBg} expanded={openItems.includes(offset + i)} onToggle={() => toggleItem(offset + i)}/>
    ))

    return (
        <section id={"FAQSection"} className={`relative z-[5] w-full -mt-15 flex justify-center bg-white pt-[calc(60px+48px)] md:pt-[calc(60px+10vh)] pb-12 md:pb-[12vh]`}>
            <div className={`flex flex-col md:flex-row gap-4 md:gap-0 items-start justify-between w-[calc(100%-32px)] md:w-[82%]`}>
                <div className="contents md:flex flex-col w-[42%] gap-7">
                    {renderCards(faqItems.slice(0, LEFT_COLUMN_COUNT), 0)}
                </div>
                <div className="contents md:flex flex-col items-end w-[42%] gap-7">
                    <h2 style={{backgroundImage: `url('${headingBg}')`}} className={`order-first md:order-none w-full md:text-right text-[120px] md:text-[min(270px,15vw)] font-black leading-[0.8] tracking-tight bg-cover bg-center bg-clip-text text-transparent mb-4 md:mb-24`}>FAQ</h2>
                    {renderCards(faqItems.slice(LEFT_COLUMN_COUNT), LEFT_COLUMN_COUNT)}
                </div>
            </div>
        </section>
    )
}
