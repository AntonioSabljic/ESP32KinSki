import React, {useEffect, useState} from 'react';
import SockJsClient from 'react-stomp';
import FirstChart from './FirstChart';
import SecondChart from './SecondChart';


export default function SkiChart({selectedChart}){

  const backendUrl = process.env.REACT_APP_API_URL;
  const [message,setMessage] = useState([]);

  const transformData = (data) => {
    const { timestamp, measurements, measurement_delay } = data;
    const { left_ski, right_ski } = measurements;

    const baseTime = new Date(timestamp).getTime();

    const result = left_ski.map((leftValue, index) => {
        const rightValue = right_ski[index];
        const time = new Date(baseTime + index * measurement_delay);
        const adjustedTime = time.toISOString().split('T')[1].replace('Z', '');
        return {
            name: adjustedTime,
            left_ski: leftValue,
            right_ski: rightValue
        };
    });
    return result;
  };


  const onMessageReceived = (msg) => {

    const transformedData = transformData(msg);
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
            url={`${backendUrl}/ws-message`}
            topics={['/topic/message']}
            onConnect={console.log("Connected!!")}
            onDisconnect={console.log("Disconnected!")}
            onMessage={msg => onMessageReceived(msg)}
            debug={false}
            onConnectFailure={(err) => console.error("Connection failed:", err)}
            onStompError={(err) => console.error("STOMP error:", err)}
          />
          <button className='graph__button' onClick={resetGraph}>Reset</button>
        </div>
      </div>
    )
}