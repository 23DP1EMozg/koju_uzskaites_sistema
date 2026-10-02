"use client";

import { useState } from "react";
import { Application } from "./Application";
import { apply } from "./actions";

export default function Apply() {
    const [data, setData] = useState<Application>({
        id: null,
        name: "",
        social_security_number: "",
        email: "",
        phone_number: ""
    })

    return(
        <div className="flex flex-col">
            <input type="text" placeholder="name" value={data.name} onChange={(e) => {
                setData(prev => ({
                    ...prev,
                    name: e.target.value
                }))
            }}/>
            <input type="text" placeholder="personas kods" value={data.social_security_number} onChange={(e) => {
                setData(prev => ({
                    ...prev,
                    social_security_number: e.target.value
                }))
            }}/>
            <input type="text" placeholder="email" value={data.email} onChange={(e) => {
                setData(prev => ({
                    ...prev,
                    email: e.target.value
                }))
            }}/>
            <input type="text" placeholder="phone number" value={data.phone_number} onChange={(e) => {
                setData(prev => ({
                    ...prev,
                    phone_number: e.target.value
                }))
            }}/>
            <button onClick={() => apply(data)}>Submit</button>
        </div>
    )
}
