import {React, useEffect, useState} from 'react';

import RadioButton from './RadioButton';
import Checkbox from './Checkbox';

import './Menu.css';

export default function DropDownRadio({title, options, initialSelection, updateSelection, enableUpdateButton}) {

    
    const [visible, setVisible] = useState(false);

    const [selectedOption, setSelectedOption] = useState(initialSelection);


    function selectOption(option) {
        //console.log(option);
        setSelectedOption(option);
        updateSelection(option);
        enableUpdateButton();
    }


    return (
        <div className="dropdown-check-list" tabIndex="100">
        <span className="anchor" onClick={() => {setVisible(!visible);}}>{title}: {selectedOption.slice(0, 25)}</span>
        {visible && <ul className="items">
            {options.map((option, index) =>
                <RadioButton key={index} option={option} checked={selectedOption === option} onClick={selectOption}/>
            )}
        </ul>}
        </div>
    );
}