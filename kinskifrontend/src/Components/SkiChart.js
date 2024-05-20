import React, {useEffect, useState} from 'react';
import SockJsClient from 'react-stomp';
import {ResponsiveContainer} from 'recharts'
import FirstChart from './FirstChart';
import SecondChart from './SecondChart';


export default function SkiChart({selectedChart}){

  const SOCKET_URL = 'http://localhost:8080/ws-message';


  const initialData = [
    {
      name: '2024-04-23T18:40:50',
      left_ski: 0,
      right_ski: 0
    },
    {
      name: '2024-04-23T18:40:55',
      left_ski: 30,
      right_ski: 20
    },
    {
      name: '2024-04-23T18:40:55',
      left_ski: 10,
      right_ski: 30
    },
    
  ];

  const [message,setMessage] = useState(initialData);

  const transformData = (data) => {
    const { timestamp, measurements, measurement_delay } = data;
    const { left_ski, right_ski } = measurements;

    const baseTime = new Date(timestamp).getTime();

    const result = left_ski.map((leftValue, index) => {
        const rightValue = right_ski[index];
        const newTimestamp = new Date(baseTime + index * measurement_delay * 10).toISOString();
        return {
            name: newTimestamp,
            left_ski: leftValue,
            right_ski: rightValue
        };
    });
    return result;
  };


  const onMessageReceived = (msg) => {

    const transformedData = transformData(msg);
    console.log("Transformed data",transformedData)
    setMessage(transformedData);
  }

  const resetGraph = () => {
    setMessage([]);
  }


  return (
      <div className="graph">
        <div className='graph__title'>Prikaz nagiba skija</div>
        <div className='graph__container'>
              {selectedChart === 0 && <FirstChart message={message} />}
              {selectedChart === 1 && <SecondChart message={message} />}
        </div>
        <div>
          <SockJsClient
            url={SOCKET_URL}
            topics={['/topic/message']}
            onConnect={console.log("Connected!!")}
            onDisconnect={console.log("Disconnected!")}
            onMessage={msg => onMessageReceived(msg)}
            debug={false}
          />
          <button className='graph__button' onClick={resetGraph}>Reset</button>
        </div>
      </div>
    )
}