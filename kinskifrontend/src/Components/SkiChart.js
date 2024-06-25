import React, {useEffect, useState} from 'react';
import SockJsClient from 'react-stomp';
import FirstChart from './FirstChart';
import SecondChart from './SecondChart';


export default function SkiChart({selectedChart}){

  const backendUrl = process.env.REACT_APP_API_URL;
  const [message,setMessage] = useState([]);
  const [curve,setCurve] = useState({});

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
    calculateCurveSimularityAndNumberOfTurns(msg);
  }

  const resetGraph = () => {
    setMessage([]);
    setCurve({});
  }

  function getAverage(array) {
    if (array.length === 0) {
        return 0;
    }

    let sum = array.reduce((accumulator, currentValue) => accumulator + currentValue, 0);
    
    let average = sum / array.length;
    
    return average;
}

function getSkiGrade(array) {
  const gradeField = array.map((value)=>{
    if(value >= 90) {
      return 0;
    }
    return -1.11*value + 100;
  });
  return getAverage(gradeField);
}

const calculateCurveSimularityAndNumberOfTurns = (data) => {
  const { timestamp, measurements, measurement_delay } = data;
  const { left_ski, right_ski } = measurements;
  let curvN = 0;
  let curvFieldAvg = [];
  let k = 0;
  while(k < left_ski.length) {
    if(left_ski[k]>=0 && right_ski[k]>=0) {
      let temp = [];
      ++curvN;
      let j = k;
      while(left_ski[j]>=0 && right_ski[j]>=0) {
      temp.push(Math.abs(left_ski[j] - right_ski[j]));
      ++j;
      k=j;
      }
      curvFieldAvg.push(getAverage(temp));
    } else if (left_ski[k]<=0 && right_ski[k]<=0) {
      let temp = [];
      ++curvN;
      let j = k;
      while(left_ski[j]<=0 && right_ski[j]<=0) {
      temp.push(Math.abs(left_ski[j] - right_ski[j]));
      ++j;
      k=j;
      }
      curvFieldAvg.push(getAverage(temp));
    }
    ++k;
  }

  let skiGrade = getSkiGrade(curvFieldAvg);
  setCurve({
    numberOfTurns:curvN,
    curvFieldAvg:curvFieldAvg,
    skiGrade:skiGrade.toFixed(2)
  });

}


  return (
      <div className="graph">
        <div className='graph__title'>Prikaz nagiba skija</div>
        <div className='graph__title'> Broj zavoja:{curve.numberOfTurns} Ocijena skijanja: {curve.skiGrade}</div>
        <div className='graph__container'>
              {selectedChart === 0 && <FirstChart message={message} />}
              {selectedChart === 1 && <SecondChart message={message} />}
        </div>
        <div>
          <SockJsClient
            url={`${backendUrl}/ws-message`}
            topics={['/topic/message']}
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