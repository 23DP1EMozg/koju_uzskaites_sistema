
type Props = {
    label: string,
    placeholder: string,
    callback: Function
}

export default function TextField(props: Props){
    return(
        <div className="flex flex-col">
            <label>{props.label}</label>
            <input type="text" placeholder={props.placeholder} className="border border-black border-solid p-3" onChange={(e) => props.callback(e.target.value)}/>            
        </div>
    )
}
