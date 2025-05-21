import { useEffect, useState, useRef } from 'react';


import './Menu.css';

export default function DualRangeSlider({rangeStart, rangeEnd, initialStart, initialEnd, updateYears}) {

    const sliderColor = '#C6C6C6';
    const rangeColor = "rgb(29, 83, 163)";

    const [from, setFrom] = useState(initialStart);
    const [to, setTo] = useState(initialEnd);


    const toSliderRef = useRef(null);
    const fromSliderRef = useRef(null);
    const toInputRef = useRef(null);
    const fromInputRef = useRef(null);


    useEffect(() => {
        init();
    },[]);

    
    function fillSlider(from, to) {
        const rangeDistance = rangeEnd - rangeStart;
        const fromPosition = from - rangeStart;
        const toPosition = to - rangeStart;

        toSliderRef.current.style.background = `linear-gradient(to right,
          ${sliderColor} 0%,
          ${sliderColor} ${(fromPosition)/(rangeDistance)*100}%,
          ${rangeColor} ${(fromPosition)/(rangeDistance)*100}%,
          ${rangeColor} ${(toPosition)/(rangeDistance)*100}%, 
          ${sliderColor} ${(toPosition)/(rangeDistance)*100}%, 
          ${sliderColor} 100%)`;
    }
    
    
    

    function init() {
        fillSlider(from, to);
    }


    function handleFromChange(elem) {
        if (elem.value > to) {
          elem.value = to;
        }
        setFrom(elem.value);
        fillSlider(elem.value, to);

        updateYears(elem.value, to);
    }
    function handleToChange(elem) {
        if (elem.value < from) {
          elem.value = from;
        }
        setTo(elem.value);
        fillSlider(from, elem.value);

        updateYears(from, elem.value);
    }

    return (
        <div className="range_container">
            <div className="sliders_control">
                <input className="fromSlider" type="range" ref={fromSliderRef} onInput={() => {handleFromChange(fromSliderRef.current)}} value={from} min={rangeStart} max={rangeEnd}/>
                <input className="toSlider" type="range" ref={toSliderRef} onInput={() => {handleToChange(toSliderRef.current)}} value={to} min={rangeStart} max={rangeEnd}/>
            </div>
            <div className="form_control">
                <div className="form_control_container">
                    <input className="form_control_container__time__input fromInput" type="number" ref={fromInputRef} onInput={() => {handleFromChange(fromInputRef.current)}} value={from} min={rangeStart} max={rangeEnd}/>
                </div>
                <div className="form_control_container">
                    <input className="form_control_container__time__input toInput" type="number" ref={toInputRef} onInput={() => {handleToChange(toInputRef.current)}} value={to} min={rangeStart} max={rangeEnd}/>
                </div>
            </div>
            {/*<button onClick={() => {console.log("from " + from + " to " + to);}}>print</button>*/}
        </div>
    );
}