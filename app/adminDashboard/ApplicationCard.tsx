import { Application } from "../apply/Application"

type Props = {
    onAccept: Function,
    onReject: Function
    data: Application
}

export default function ApplicationCard({onAccept, onReject ,data} : Props) {
    return(
        <div className="flex justify-between bg-gray-200">
            <div className="flex flex-col">
                <span>name: {data.name}</span>
                <span>social security number: {data.social_security_number}</span>
                <span>phone number: {data.phone_number}</span>
                <span>email: {data.email}</span>
            </div>
            <div className="flex gap-3">
                <button className="bg-red-500 cursor-pointer" onClick={(e) => onReject(e)}>Reject</button>
                <button className="bg-green-400 cursor-pointer" onClick={() => onAccept(data.id)}>Accept and edit</button>
            </div>
        </div>
    )
}
