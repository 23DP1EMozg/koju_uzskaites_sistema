
type bulletBtnProps = {
    color: string
    invertArrow?: boolean
}
export default function BulletBtn ({color, invertArrow}:bulletBtnProps) {
    return (
        <div style={{background: color}} className="rounded-full size-11 shrink-0 flex flex-col items-center justify-center">
            <img className={`w-[45%] ${invertArrow ? 'invert' : ''}`} src={"/icons/Arrow.svg"} alt=""/>
        </div>
    )
}
