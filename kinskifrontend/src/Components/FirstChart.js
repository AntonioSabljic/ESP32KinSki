import React from "react";
import {Tooltip,YAxis,XAxis,CartesianGrid,LineChart,Legend,Line, ResponsiveContainer} from 'recharts'

export default function FirstChart({message}){

    return(
        <ResponsiveContainer height="100%" width="100%">
        <LineChart  
        data={message}
        margin={{
        top: 15,
        right: 30,
        left: 20,
        bottom: 5,
        }}
        className='line-chart'
        >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Line type="monotone" dataKey="right_ski" stroke="#8884d8" strokeWidth={3}/>
        <Line type="monotone" dataKey="left_ski" stroke="#82ca9d" strokeWidth={3} />
        </LineChart>
        </ResponsiveContainer>
    )
}