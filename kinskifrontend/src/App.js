
import './App.css';
import { useState } from 'react';
import SkiChart from './Components/SkiChart';
import Header from "./Components/Header"
import Footer from './Components/Footer';
import useToggle from './Hooks/useToggle';

function App() {

  const [darkMode, setDarkMode] = useToggle()
  const [selectedChart, setSelectedChart] = useState(0)

  function toggleChart(num){
    setSelectedChart(num)
  }

  return (
    <div className={`container ${darkMode ? "dark-mode" : null}`}>
      <Header toggleChart={toggleChart} darkMode={darkMode} setDarkMode={setDarkMode} />
      <SkiChart selectedChart={selectedChart} />
      <Footer />
    </div>
  );
}

export default App;
