import logo from './logo.svg';
import './App.css';

import { useState, useEffect } from 'react'
function App() {

    const [color, setColor] =  useState('#2A9D8F');
    const click = color => {
        setColor(color)
    }
    /* This is where we actually
       change background color */
    useEffect(() => {
        document.body.style.backgroundColor = color
    }, [color])
    /* Display clickable
        button */
    if(color.valueOf() == "#2A9D8F"){
        return (<div className = "App">
            <button onClick = {
                () => click("#F4A261")
            }>Change BG Color</button>
        </div>)
    } else if(color.valueOf() == "#F4A261"){
        return (<div className = "App">
            <button onClick = {
                () => click("#2A9D8F")
            }>Change BG Color</button>
        </div>)
    }

}
export default App;
