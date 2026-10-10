
type bulletBtnProps = {
    color: string
    invertArrow?: boolean
    size?: string
}
export default function BulletBtn ({color, invertArrow, size = 'size-11'}:bulletBtnProps) {
    return (
        <div style={{background: color}} className={`rounded-full ${size} shrink-0 flex flex-col items-center justify-center`}>
            <img className={`w-[45%] ${invertArrow ? 'invert' : ''}`} src={"/icons/Arrow.svg"} alt=""/>
        </div>
    )
}
