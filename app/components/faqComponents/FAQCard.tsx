import BulletBtn from "@/app/components/BulletBtn";

export type FAQItem = {
    question: string
    answer: string
}

type FAQCardProps = {
    item: FAQItem
    bgImage: string
    expanded: boolean
    onToggle: () => void
}

export default function FAQCard ({item, bgImage, expanded, onToggle}: FAQCardProps) {
    return (
        <div style={{backgroundImage: `url('${bgImage}')`}} className="relative w-full overflow-hidden rounded-[18px] md:rounded-[22px] bg-cover bg-center text-white">
            <span className={`absolute inset-0 bg-black transition-opacity duration-500 ${expanded ? 'opacity-0' : 'opacity-100'}`}/>
            <div className={`relative flex flex-col pt-3 md:pt-3.5 pl-5 md:pl-8 pr-3 md:pr-4 pb-6 md:pb-9`}>
                <div className={`flex flex-row items-start justify-between gap-3 w-full`}>
                    <p className={`text-lg md:text-[22px] leading-tight pt-2 md:pt-4`}>{item.question}</p>
                    <button onClick={onToggle} aria-expanded={expanded} className={`cursor-pointer transition-transform duration-500 ${expanded ? 'rotate-90' : ''}`}>
                        <BulletBtn color={"#FFFFFF"} size={"size-10 md:size-13"}/>
                    </button>
                </div>
                <span style={{backgroundImage: `url('${bgImage}')`}} className={`relative block w-[65%] h-1 mt-5 md:mt-7 ml-1.5 rounded-full bg-cover bg-center overflow-hidden`}>
                    <span className={`absolute inset-0 bg-white transition-opacity duration-500 ${expanded ? 'opacity-100' : 'opacity-0'}`}/>
                </span>
                <div className={`grid transition-[grid-template-rows] duration-500 ${expanded ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
                    <div className={`overflow-hidden`}>
                        <p className={`text-[15px] md:text-[17px] leading-snug pt-4 md:pt-5 pr-2 md:pr-14`}>{item.answer}</p>
                    </div>
                </div>
            </div>
        </div>
    )
}
