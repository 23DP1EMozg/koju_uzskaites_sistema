"use client"

import { useEffect, useState } from "react"
import { Application } from "../apply/Application"
import { acceptAndEditApplication, getUserApplications, rejectApplication } from "./actions"
import ApplicationCard from "./ApplicationCard"
import Modal from 'react-modal'
import { User } from "../types/User"

export default function AdminDashboard() {

    const [applications, setApplications] = useState<Application[]>([])
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false)
    const [editData, setEditData] = useState<User>()


    const getApplications = async () => {
        const appl = await getUserApplications()
        setApplications(appl)
    }
    useEffect( () => {
        getApplications()
        Modal.setAppElement("body")
        resetAcceptEditData()
    }, [])

    function resetAcceptEditData() {
        setEditData({
            id: 0,
            email: "",
            password: "",
            course: "",
            room_number: 0,
            social_security_number: "",
            name: "",
            phone_number: ""
        })
    }

    function handleAccept(application: Application) {
        setEditData({
            id: application.id!,
            name: application.name,
            email: application.email,
            phone_number: application.phone_number,
            social_security_number: application.social_security_number
        })
        setIsModalOpen(true)
    }

    async function handleReject(id: number) {
        await rejectApplication(id)
        getApplications()
    }


    return(
        <div>
            <Modal
            isOpen={isModalOpen}
            onRequestClose={() => {
                setIsModalOpen(false)
                resetAcceptEditData()
            }}
            >
                <div className="flex flex-col">
                    <input type="text" placeholder="email" value={editData?.email} onChange={e => {
                        setEditData(prev => ({
                            ...prev,
                            email: e.target.value
                        }))
                    }}/>
                    <input type="text" placeholder="course" value={editData?.course} onChange={e => {
                        setEditData(prev => ({
                            ...prev,
                            course: e.target.value
                        }))
                    }}/>
                    <input type="number" placeholder="room_number" value={editData?.room_number} onChange={e => {
                        setEditData(prev => ({
                            ...prev,
                            room_number: parseInt(e.target.value)
                        }))
                    }}/>
                    <input type="text" placeholder="social security number" value={editData?.social_security_number} onChange={e => {
                        setEditData(prev => ({
                            ...prev,
                            social_security_number: e.target.value
                        }))
                    }}/>
                    <input type="text" placeholder="name" value={editData?.name} onChange={e => {
                        setEditData(prev => ({
                            ...prev,
                            name: e.target.value
                        }))
                    }}/>
                    <button className="bg-green-400 cursor-pointer" onClick={() => {
                        acceptAndEditApplication(editData as User)
                        getApplications()
                        setIsModalOpen(false)
                    }}>submit</button>
                    <button className="bg-red-500 cursor-pointer" onClick={() => setIsModalOpen(false)}>Close</button>
                </div>
            </Modal>
            <div className="flex flex-col gap-5">
                {applications.map((a, i) => (
                    <ApplicationCard
                        data={a}
                        onAccept={() => {handleAccept(a)}}
                        onReject={() => handleReject(a.id!)}
                        key={i}
                    />
                ))}
            </div>
        </div>
    )
}
