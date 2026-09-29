"use client"

import { useEffect, useState } from "react"
import { Application } from "../apply/Application"
import { acceptAndEditApplication, deleteTenant, getAllTenants, getTenantById, getUserApplications, rejectApplication } from "./actions"
import ApplicationCard from "./ApplicationCard"
import Modal from 'react-modal'
import { User } from "../types/User"
import TenantCard from "./TenantCard"

export default function AdminDashboard() {
    console.log("rendered")
    const [applications, setApplications] = useState<Application[]>([])
    const [tenants, setTenants] = useState<User[]>([])
    const [isApplicationModalOpen, setIsApplicationModalOpen] = useState<boolean>(false)
    const [isTenantModalOpen, setIsTenantModalOpen] = useState<boolean>(false)
    const [applicationEditData, setApplicationEditData] = useState<User>()
    const [tenantViewData, setTenantViewData] = useState<User | null>(null)


    const getApplications = async () => {
        try{
            const appl = await getUserApplications()
            setApplications(appl)
        } catch(error) {
            console.log(error)
        }
    }

    const getTenants = async () => {
        try {
            const data = await getAllTenants()
            setTenants(data)
            
        } catch (error) {
            console.error(error)
        }
    }

    useEffect( () => {
        getApplications()
        getTenants()
        Modal.setAppElement("body")
        resetAcceptEditData()
    }, [])

    function resetAcceptEditData() {
        setApplicationEditData({
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
        setApplicationEditData({
            id: application.id!,
            name: application.name,
            email: application.email,
            phone_number: application.phone_number,
            social_security_number: application.social_security_number
        })
        setIsApplicationModalOpen(true)
    }

    async function handleReject(id: number) {
        await rejectApplication(id)
        getApplications()
    }

    async function handleDeleteTenant(id: number) {
        try {
            await deleteTenant(id)
            getTenants()
        } catch (error) {
            console.error(error)
        }
    }

    async function handleViewTenant(id: number) {
        try {
            const data = await getTenantById(id)
            setTenantViewData(data)
            setIsTenantModalOpen(true)
        } catch (error) {
            console.error(error)
        }
    }

    function handleCloseTenantModal() {
        setTenantViewData(null)
        setIsTenantModalOpen(false)
    }

    return(
        <div>
            {/* Application modal */}
            <Modal
            isOpen={isApplicationModalOpen}
            onRequestClose={() => {
                setIsApplicationModalOpen(false)
                resetAcceptEditData()
            }}
            >
                <div className="flex flex-col">
                    <input type="text" placeholder="email" value={applicationEditData?.email} onChange={e => {
                        setApplicationEditData(prev => ({
                            ...prev,
                            email: e.target.value
                        }))
                    }}/>
                    <input type="text" placeholder="course" value={applicationEditData?.course} onChange={e => {
                        setApplicationEditData(prev => ({
                            ...prev,
                            course: e.target.value
                        }))
                    }}/>
                    <input type="number" placeholder="room_number" value={applicationEditData?.room_number} onChange={e => {
                        setApplicationEditData(prev => ({
                            ...prev,
                            room_number: parseInt(e.target.value)
                        }))
                    }}/>
                    <input type="text" placeholder="social security number" value={applicationEditData?.social_security_number} onChange={e => {
                        setApplicationEditData(prev => ({
                            ...prev,
                            social_security_number: e.target.value
                        }))
                    }}/>
                    <input type="text" placeholder="name" value={applicationEditData?.name} onChange={e => {
                        setApplicationEditData(prev => ({
                            ...prev,
                            name: e.target.value
                        }))
                    }}/>
                    <button className="bg-green-400 cursor-pointer" onClick={() => {
                        acceptAndEditApplication(applicationEditData as User)
                        getApplications()
                        setIsApplicationModalOpen(false)
                    }}>submit</button>
                    <button className="bg-red-500 cursor-pointer" onClick={() => setIsApplicationModalOpen(false)}>Close</button>
                </div>
            </Modal>


            <Modal
            isOpen={isTenantModalOpen}
            onRequestClose={() => {
            }}>
                <div>
                    <div className="flex flex-col gap-3">
                        <span>name: {tenantViewData?.name}</span>
                        <span>social security number: {tenantViewData?.social_security_number}</span>
                        <span>room number: {tenantViewData?.room_number}</span>
                        <span>course: {tenantViewData?.course}</span>
                        <span>email: {tenantViewData?.email}</span>
                        <span>phone number: {tenantViewData?.phone_number}</span>

                    </div>
                    <button className="bg-red-500 cursor-pointer" onClick={() => handleCloseTenantModal()}>Close</button>
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
            <h1>Tenants</h1>
            <div className="flex flex-col gap-5">
                {tenants.map((t, i) => (
                    <TenantCard
                     tenant={t}
                     key={i}
                     onView={() => handleViewTenant(t.id as number)}
                     onDelete={() => handleDeleteTenant(t.id as number)}
                    />
                ))}
            </div>
        </div>
    )
}
