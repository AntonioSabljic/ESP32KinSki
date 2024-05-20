import React from "react";

export default function useToggle(){
    const [on, setOn] = React.useState(false)

    function toggleOn(){
        setOn(prev => !prev)
    }

    return [on, toggleOn]
}