import React, { useState } from "react"
import useToggle from "../Hooks/useToggle"
import imgOne from "../Images/Chart1.jpg"
import imgTwo from "../Images/Chart2.jpg"



export default function Header({darkMode, setDarkMode, toggleChart}){

    const [isOpen, toggleOpen] = useToggle()

    const images= [
        {
            img: imgOne,
            name: "CHART LINE"
        },
        {
            img: imgTwo,
            name: "BAR LINE"
        }
    ]
    const imgElements = images.map((item,index) => {
        return(
            <div className="header__images-container">
                <img 
                    className="header__images-img" src={item.img}
                    onClick={() => toggleChart(index)}
                    role="button"
                />
                <p className="header__images-text">{item.name}</p>
            </div>
        )
    })

    return(
        <header className="header">
            <div 
                onClick={toggleOpen}
                className={`hamburger ${isOpen ? "open" : null}`}
            >
                <div className="hamburger__line"></div>
                <div className="hamburger__line"></div>
                <div className="hamburger__line"></div>
            </div>
            <div className={`header__menu ${isOpen ? "open" : null}`}>
                <div className="header__images">
                    {imgElements}
                </div>
            </div>
            <h2 className="header__title">SKI SLOPE CHART</h2>
            <button 
                onClick={setDarkMode} 
                className={`header__toggle ${darkMode ? "active" : null}`}
                aria-pressed={darkMode}
                aria-label="dark and light mode switch"
            >
                <div className="header__circle"></div>
            </button>
        </header>
    ) 
}