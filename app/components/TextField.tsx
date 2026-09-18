
type Props = {
    label: string,
    placeholder: string
}

export default function TextField(props: Props){
    return(
        <div className="flex flex-col">
            <label>{props.label}</label>
            <input type="text" placeholder={props.placeholder} className="border border-black border-solid p-3"/>            
        </div>
    )
}
