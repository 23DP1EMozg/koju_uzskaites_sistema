'use client'
import FAQCard, {FAQItem} from "@/app/components/faqComponents/FAQCard";
import {useState} from "react";

type FAQSectionProps = {
    cardBg: string
    headingBg: string
};

const faqItems: FAQItem[] = [
    {question: 'Vai es varu atvest draugus?', answer: "Many desktop publishing packages and web page editors now use Lorem Ipsum as their default model text, and a search for 'lorem ipsum' will uncover many web sites still in their infancy."},
    {question: 'Cikos jāatgriežas kopmītnēs?', answer: "Many desktop publishing packages and web page editors now use Lorem Ipsum as their default model text."},
    {question: 'Kā pieteikt remontu istabā?', answer: "Many desktop publishing packages and web page editors now use Lorem Ipsum as their default model text, and a search for 'lorem ipsum' will uncover many web sites still in their infancy."},
    {question: 'Kur var izmazgāt veļu?', answer: "Many desktop publishing packages and web page editors now use Lorem Ipsum as their default model text."},
    {question: 'Vai drīkst turēt mājdzīvniekus?', answer: "Many desktop publishing packages and web page editors now use Lorem Ipsum as their default model text, and a search for 'lorem ipsum' will uncover many web sites still in their infancy."},
    {question: 'Kā nomainīt istabu?', answer: "Many desktop publishing packages and web page editors now use Lorem Ipsum as their default model text."},
    {question: 'Ko darīt, ja pazaudēju atslēgu?', answer: "Many desktop publishing packages and web page editors now use Lorem Ipsum as their default model text, and a search for 'lorem ipsum' will uncover many web sites still in their infancy."},
    {question: 'Kā pieteikt paliekšanu?', answer: "Many desktop publishing packages and web page editors now use Lorem Ipsum as their default model text."},
]

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
                    {renderCards(faqItems.slice(0, 4), 0)}
                </div>
                <div className="contents md:flex flex-col items-end w-[42%] gap-7">
                    <h2 style={{backgroundImage: `url('${headingBg}')`}} className={`order-first md:order-none w-full md:text-right text-[120px] md:text-[270px] font-black leading-[0.8] tracking-tight bg-cover bg-center bg-clip-text text-transparent mb-4 md:mb-24`}>FAQ</h2>
                    {renderCards(faqItems.slice(4), 4)}
                </div>
            </div>
        </section>
    )
}
