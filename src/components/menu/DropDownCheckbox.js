import {React, useEffect, useState} from 'react';

import Checkbox from './Checkbox';

import './Menu.css';

export default function DropDownCheckbox({title,options}) {

    
    const [visible, setVisible] = useState(false);

    const [selectedOptions, setSelectedOptions] = useState(options);

    function toggleAll() {
        if (selectedOptions == options) {
            console.log("de selecting all");
            setSelectedOptions([]);
        }
        else {
            console.log("selecting all");
            setSelectedOptions(options);
        }
    }

    function toggleOption(option) {
        //console.log("selected options prima di toggle:");
        //console.log(selectedOptions);
        const index = selectedOptions.indexOf(option);
        //console.log(index);
        // se c'e'
        if (index > -1) {
            console.log("removing option " + option);
            setSelectedOptions([...selectedOptions.slice(0, index), ...selectedOptions.slice(index + 1)]);
        }
        // se non c'e'
        else {
            console.log("adding option " + option);
            setSelectedOptions([...selectedOptions, option]);
        }
        //console.log(selectedOptions);
    }

    return (
        <div className="dropdown-check-list" tabindex="100">
        <span className="anchor" onClick={() => {setVisible(!visible);}}>{title} ({selectedOptions.length}/{options.length})</span>
        {visible && <ul className="items">
            <Checkbox option={"Select all"} checked={selectedOptions == options} onClick={toggleAll}/>
            <hr/>
            {options.map((option, index) =>
                <Checkbox key={index} option={option} checked={selectedOptions.includes(option)} onClick={toggleOption}/>
            )}
        </ul>}
        </div>
    );
}