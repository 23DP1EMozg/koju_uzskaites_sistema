import ReportInputField from "@/app/components/reportComponents/ReportInputField";
import ReportTextArea from "@/app/components/reportComponents/ReportTextArea";

type ReportSectionProps = {
    bgImage: string
};

export default function ReportSection({bgImage}: ReportSectionProps) {
    return (
        <section id={"ReportSection"} className={`relative z-[5] w-full flex justify-center bg-white px-4 pb-4`}>
            <div style={{backgroundImage: `url('${bgImage}')`}} className={`w-full min-h-screen flex flex-row items-center justify-between rounded-[28px] md:rounded-[40px] px-5 md:px-0 pt-24 pb-28 md:py-0 bg-cover bg-center bg-no-repeat overflow-hidden`}>
                <h2 className={`hidden md:block w-min text-white font-black text-[10vw] leading-[0.95] tracking-tight drop-shadow-[0_4px_12px_rgba(0,0,0,0.25)]`}>Kaut kas nepatīk?</h2>
                <form className={`flex flex-col w-full md:w-[38%] gap-5 md:mr-[8%]`}>
                    <h3 className={`text-white font-extralight text-[34px] leading-none`}>Sūdzība</h3>
                    <div className={`flex flex-row gap-4 w-full`}>
                        <ReportInputField id={"reportName"} name={"name"} label={"Vārds"} className={`w-1/2`} required/>
                        <ReportInputField id={"reportSurname"} name={"surname"} label={"Uzvārds"} className={`w-1/2`} required/>
                    </div>
                    <ReportTextArea id={"reportDescription"} name={"description"} label={"Apraksts"} required/>
                    <button type={"submit"} className={`self-center bg-white text-black rounded-[18px] w-50 h-13 text-[17px] mt-6 cursor-pointer`}>
                        Nosūtīt
                    </button>
                </form>
            </div>
        </section>
    )
}
