import {useEffect, useState} from 'react';

import './Menu.css';

export default function ToggleSwitch({label, checked, onChange}) {

    return (
        <div className="switch-container">
            <label className="switch">
                <input type="checkbox" onChange={onChange}/>
                <span className="switch-slider round"></span>
            </label> 
            <span className="switch-label">{label}</span>
        </div>
    );
}