"use client";

import { useState } from "react";
import { Application } from "../types/Application";
import { apply } from "./actions";

export default function Apply() {
    const [data, setData] = useState<Application>({
        name: "",
        social_security_number: "",
        course: ""
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
            <input type="text" placeholder="course" value={data.course} onChange={(e) => {
                setData(prev => ({
                    ...prev,
                    course: e.target.value
                }))
            }}/>
            <button onClick={() => apply(data)}>Submit</button>
        </div>
    )
}
