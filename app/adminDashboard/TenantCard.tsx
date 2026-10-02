"use client"

import { User } from "../types/User"

type Props = {
    tenant: User
    onDelete: Function,
    onView: Function
}

export default function TenantCard({ tenant, onView, onDelete } : Props) {
    return(
        <div className="flex bg-gray-300 px-10 justify-between">
            <div className="flex flex-col">
                <span>Username: {tenant.name}</span>
                <span>Room: {tenant.room_number}</span>
            </div>
            <div className="flex gap-3">
                <button className="bg-green-400 cursor-pointer" onClick={() => onView()}>View</button>
                <button className="bg-red-500 cursor-pointer" onClick={() => onDelete()}>Delete</button>
            </div>
        </div>
    )
}