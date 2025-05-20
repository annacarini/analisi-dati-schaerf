import {React, useEffect, useState} from 'react';

import Values from '../../DB/Values';

import './Menu.css';

export default function DualRangeSlider({rangeStart, rangeEnd, updateYears}) {

    const sliderColor = '#C6C6C6';
    const rangeColor = "rgb(29, 83, 163)";          // #25daa5

    const [from, setFrom] = useState(rangeStart);
    const [to, setTo] = useState(rangeEnd);

    const controlSliderId = '#toSlider';

    useEffect(() => {
        init();
    },[]);

    
    function fillSlider() {
        const rangeDistance = rangeEnd - rangeStart;
        const fromPosition = from - rangeStart;
        const toPosition = to - rangeStart;
        const controlSlider = document.querySelector(controlSliderId);
        controlSlider.style.background = `linear-gradient(to right,
          ${sliderColor} 0%,
          ${sliderColor} ${(fromPosition)/(rangeDistance)*100}%,
          ${rangeColor} ${(fromPosition)/(rangeDistance)*100}%,
          ${rangeColor} ${(toPosition)/(rangeDistance)*100}%, 
          ${sliderColor} ${(toPosition)/(rangeDistance)*100}%, 
          ${sliderColor} 100%)`;
        
    }
    
    function setToggleAccessible(currentTarget) {
      const toSlider = document.querySelector('#toSlider');
      if (Number(currentTarget.value) <= 0 ) {
        toSlider.style.zIndex = 2;
      } else {
        toSlider.style.zIndex = 0;
      }
    }
    

    function init() {
        fillSlider();
        setToggleAccessible(document.querySelector('#toSlider'));
    }


    function handleFromChange(id) {
        const elem = document.querySelector(id);
        if (elem.value > to) {
          elem.value = to;
        }
        setFrom(elem.value);
        fillSlider();

        updateYears(elem.value, to);
    }
    function handleToChange(id) {
        const elem = document.querySelector(id);
        if (elem.value < from) {
          elem.value = from;
        }
        setTo(elem.value);
        fillSlider();

        updateYears(from, elem.value);
    }

    return (
        <div className="range_container">
            <div className="sliders_control">
                <input id="fromSlider" type="range" onInput={() => {handleFromChange('#fromSlider')}} value={from} min={rangeStart} max={rangeEnd}/>
                <input id="toSlider" type="range" onInput={() => {handleToChange('#toSlider')}} value={to} min={rangeStart} max={rangeEnd}/>
            </div>
            <div className="form_control">
                <div className="form_control_container">
                    <input className="form_control_container__time__input" type="number" id="fromInput" onInput={() => {handleFromChange('#fromInput')}} value={from} min={rangeStart} max={rangeEnd}/>
                </div>
                <div className="form_control_container">
                    <input className="form_control_container__time__input" type="number" id="toInput" onInput={() => {handleToChange('#toInput')}} value={to} min={rangeStart} max={rangeEnd}/>
                </div>
            </div>
            {/*<button onClick={() => {console.log("from " + from + " to " + to);}}>print</button>*/}
        </div>
    );
}