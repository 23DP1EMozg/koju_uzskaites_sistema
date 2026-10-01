
type bulletBtnProps = {
    color: string
}
export default function BulletBtn ({color}:bulletBtnProps) {
    return (
        <div style={{background: color}} className="rounded-full w-[1.2vw] h-[2.2vh] flex flex-col items-center justify-center">
            <img className={`w-1/2`} src={"/icons/Arrow.svg"} alt=""/>
        </div>
    )
}