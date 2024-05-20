import React from "react";
import {Tooltip,BarChart, Bar, YAxis,XAxis,CartesianGrid,Legend, ResponsiveContainer} from 'recharts'

export default function SecondChart({message}){

    return(
        <ResponsiveContainer height="100%" width="100%">
            <BarChart width={730} height={250} data={message}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="left_ski" fill="#8884d8" />
                <Bar dataKey="right_ski" fill="#82ca9d" />
            </BarChart>
        </ResponsiveContainer>
    )
}