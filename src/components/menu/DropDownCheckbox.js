import {React, useEffect, useState} from 'react';

import './Menu.css';

export default function DropDownCheckbox({title,options}) {


    const [visible, setVisible] = useState(false);

    var selectedOptionsList = [...options];
    //const [selectedOptionsLength, setSelectedOptionsLength] = useState(selectedOptions.length);
    const [selectedOptions, setSelectedOptions] = useState(options);

    function toggleOption(option) {
        const index = selectedOptionsList.indexOf(option);
        // se c'e'
        if (index > -1) {
            selectedOptionsList.splice(index, 1); // 2nd parameter means remove one item only
        }
        // se non c'e'
        else {
            selectedOptionsList.push(option);
        }
        //setSelectedOptionsLength(selectedOptions.length);
        console.log(selectedOptionsList);
        setSelectedOptions(selectedOptionsList);
    }

    return (
        <div id="list1" class="dropdown-check-list" tabindex="100">
        <span class="anchor" onClick={() => {setVisible(!visible);}}>{title} ({selectedOptionsList.length})</span>
        {visible && <ul class="items">
            {options.map((option, index) =>
                <li><input type="checkbox" key={index} checked={selectedOptions.includes(option)} onChange={() => {toggleOption(option);}}/>{option}</li>
            )}
        </ul>}
        </div>
    );
}