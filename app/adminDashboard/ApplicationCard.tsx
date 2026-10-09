import { Application } from "../apply/Application"

type Props = {
    onAccept: () => void,
    onReject: () => void,
    data: Application
}

function Detail({ label, value }: { label: string, value: string }) {
    return (
        <div className="flex min-w-0 flex-col">
            <span className="text-sm text-white/60 lg:text-base">{label}</span>
            <span className="truncate text-lg text-white lg:text-xl">{value}</span>
        </div>
    )
}

export default function ApplicationCard({ onAccept, onReject, data }: Props) {
    return (
        <article className="flex flex-col gap-6 rounded-[28px] border border-[#a23a32]/40 bg-[linear-gradient(155deg,#141414_0%,#151111_45%,#3a1210_75%,#a23a32_110%)] p-6 lg:p-11">
            <h3 className="text-3xl font-extrabold italic leading-tight tracking-tight text-white lg:text-[2.6rem]">
                {data.name}
            </h3>

            <div className="grid grid-cols-1 gap-x-12 gap-y-4 border-l-2 border-[#a23a32] pl-6 sm:grid-cols-[auto_auto] sm:justify-start">
                <Detail label="Personas kods" value={data.social_security_number} />
                <Detail label="Tel. numurs" value={data.phone_number} />
                <div className="sm:col-span-2">
                    <Detail label="E-pasts" value={data.email} />
                </div>
            </div>

            <div className="mt-2 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <button
                    type="button"
                    onClick={onReject}
                    className="cursor-pointer rounded-full border border-white/80 py-4 text-lg text-white transition hover:bg-white/10 lg:py-5 lg:text-xl"
                >
                    Noraidīt
                </button>
                <button
                    type="button"
                    onClick={onAccept}
                    className="cursor-pointer rounded-full bg-white py-4 text-lg text-black transition hover:bg-white/85 lg:py-5 lg:text-xl"
                >
                    Apstiprināt un rediģēt
                </button>
            </div>
        </article>
    )
}
