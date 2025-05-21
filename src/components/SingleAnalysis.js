import {React, useEffect, useState, useRef} from 'react';

import * as d3 from "d3";

import DualRangeSlider from './menu/DualRangeSlider';
import DropDownCheckbox from './menu/DropDownCheckbox';
import DropDownRadio from './menu/DropDownRadio';
import Values from "../DB/Values";

import LineChart from './charts/LineChart';
import MultiLineChart from './charts/MultiLineChart';
import ChartLegend from './charts/ChartLegend';

import ChartDataAtenei from '../models/ChartDataAtenei';
import ChartDataSingleAteneo from '../models/ChartDataSingleAteneo';
import ChartDataEntry from '../models/ChartDataEntry';


export default function SingleAnalysis() {


    // Range di anni
    const [annoStart, setAnnoStart] = useState(2000);
    const [annoEnd, setAnnoEnd] = useState(Values.YEAR_END);

    // Opzioni selezionate
    const [selectedAteneo, setSelectedAteneo] = useState('ROMA "La Sapienza"');     // NON UN ARRAY STAVOLTA
    const [selectedFacolta, setSelectedFacolta] = useState(Values.VALUES_FACOLTA);
    const [selectedSC, setSelectedSC] = useState(Values.VALUES_SC);
    const [selectedSSD, setSelectedSSD] = useState(Values.VALUES_SSD);
    const [selectedFascia, setSelectedFascia] = useState(Values.VALUES_FASCIA);

    // Per il caricamento
    const [loadingData, setLoadingData] = useState(false);


    function updateYears(annoS, annoE) {
        setAnnoStart(annoS);
        setAnnoEnd(annoE);
    }


    function getAnnoDatasetIndex(anno) {
        return anno-Values.YEAR_START;
    }


    async function updateLineChart() {
        console.log("updating chart");
    }

    return (
        <div className='page-container'>
            {/* Selezione campi */}
            <div id="menu-row">
                <DualRangeSlider rangeStart={Values.YEAR_START} rangeEnd={Values.YEAR_END} initialStart={annoStart} initialEnd={annoEnd} updateYears={updateYears}/>
                <DropDownRadio title={"Ateneo"} options={Values.VALUES_ATENEO} initialSelection={selectedAteneo} updateSelection={setSelectedAteneo}/>
                <DropDownCheckbox title={"Facoltà"} options={Values.VALUES_FACOLTA} initialSelection={selectedFacolta} updateSelection={setSelectedFacolta}/>
                <DropDownCheckbox title={"SC"} options={Values.VALUES_SC} initialSelection={selectedSC} updateSelection={setSelectedSC}/>
                <DropDownCheckbox title={"SSD"} options={Values.VALUES_SSD} initialSelection={selectedSSD} updateSelection={setSelectedSSD}/>
                <DropDownCheckbox title={"Fascia"} options={Values.VALUES_FASCIA} initialSelection={selectedFascia} updateSelection={setSelectedFascia}/>
                <button id="update-chart-button" onClick={updateLineChart} disabled={loadingData}>Update</button>
            </div>
        </div>
    )
}