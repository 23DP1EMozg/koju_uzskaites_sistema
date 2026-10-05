
type bulletBtnProps = {
    color: string
}
export default function BulletBtn ({color}:bulletBtnProps) {
    return (
        <div style={{background: color}} className="rounded-full size-11 shrink-0 flex flex-col items-center justify-center">
            <img className={`w-[45%]`} src={"/icons/Arrow.svg"} alt=""/>
        </div>
    )
}
