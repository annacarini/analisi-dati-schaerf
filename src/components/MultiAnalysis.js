import {React, useEffect, useState, useRef} from 'react';

import * as d3 from "d3";

import DualRangeSlider from './menu/DualRangeSlider';
import DropDownCheckbox from './menu/DropDownCheckbox';
import Values from "../DB/Values";

import LineChart from './charts/LineChart';
import MultiLineChart from './charts/MultiLineChart';

import ChartDataAtenei from '../models/ChartDataAtenei';
import ChartDataSingleAteneo from '../models/ChartDataSingleAteneo';
import ChartDataEntry from '../models/ChartDataEntry';

import '../App.css';

export default function MultiAnalysis({dataset}) {

    const ref = useRef();

    const margin = {top: 10, right: 0, bottom: 30, left: 40};

    // Range di anni
    const [annoStart, setAnnoStart] = useState(2006);
    const [annoEnd, setAnnoEnd] = useState(Values.YEAR_END);

    // Opzioni selezionate
    const [selectedAteneo, setSelectedAteneo] = useState(['ROMA "La Sapienza"','BOLOGNA', 'ROMA "Tor Vergata"']);
    //var selectedFacolta = ['Farmacia e Medicina', 'Ingegneria'];
    const [selectedFacolta, setSelectedFacolta] = useState(Values.VALUES_FACOLTA);
    const [selectedSC, setSelectedSC] = useState(Values.VALUES_SC);
    const [selectedSSD, setSelectedSSD] = useState(Values.VALUES_SSD);
    const [selectedFascia, setSelectedFascia] = useState(['Ordinario']);
    

    const [lineChart, setLineChart] = useState(null);

    //const [xAxis, setXAxis] = useState(null);
    //const [yAxis, setYAxis] = useState(null);


    useEffect(() => {
        initializeLineChart();
    },[]);

    
    function initializeLineChart() {
        const svg = d3.select(ref.current);
        var width = 0.8*window.innerWidth - margin.left - margin.right;
        var height = 500 - margin.top - margin.bottom;

        // Crea chart
        const lchart = new MultiLineChart(svg, margin, width, height);
        setLineChart(lchart);

        const vals = computeData();

        lchart.draw(vals, annoStart, annoEnd);
    }


    function updateLineChart() {
        console.log("updating chart");
        const vals = computeData();
        lineChart.update(vals, annoStart, annoEnd);
    }



    function updateYears(annoS, annoE) {
        setAnnoStart(annoS);
        setAnnoEnd(annoE);
    }



    function getAnnoDatasetIndex(anno) {
        return anno-Values.YEAR_START;
    }


    function filterRow(row) {
        return (
            (selectedAteneo == Values.VALUES_ATENEO || selectedAteneo.includes(row[Values.FIELD_ATENEO])) &&
            (selectedFacolta == Values.VALUES_FACOLTA || selectedFacolta.includes(row[Values.FIELD_FACOLTA])) &&
            (selectedFascia == Values.VALUES_FASCIA || selectedFascia.includes(row[Values.FIELD_FASCIA])) &&
            (selectedSC == Values.VALUES_SC || selectedSC.includes(row[Values.FIELD_SC])) &&
            (selectedSSD == Values.VALUES_SSD || selectedSSD.includes(row[Values.FIELD_SSD]))
        );
    }

    function filterRowWithAteneo(row, ateneo) {
        return (
            (row[Values.FIELD_ATENEO].toLowerCase() == ateneo.toLowerCase()) &&
            (  selectedFacolta == Values.VALUES_FACOLTA ||
               selectedFacolta.map((str) => str.toLowerCase()).includes(row[Values.FIELD_FACOLTA].toLowerCase()) ||
               selectedFacolta.map((str) => str.toLowerCase()).includes(row[Values.FIELD_STRUTTURA].toLowerCase())
            ) &&
            (selectedFascia == Values.VALUES_FASCIA || selectedFascia.includes(row[Values.FIELD_FASCIA])) &&
            (selectedSC == Values.VALUES_SC || selectedSC.includes(row[Values.FIELD_SC])) &&
            (selectedSSD == Values.VALUES_SSD || selectedSSD.includes(row[Values.FIELD_SSD]))
        );
    }

    function computeData() {
        //var ateneo = selectedAteneo[0];
        var data = [];
        var currentMax = 0;

        selectedAteneo.map( ateneo => {
            const ateneoData = computeDataAteneo(ateneo);
            data.push(ateneoData);
            if (ateneoData.max > currentMax) {
                currentMax = ateneoData.max;
            }
        });

        return new ChartDataAtenei(currentMax, data);
    }
    

    function computeDataAteneo(ateneo) {

        // Per tenere traccia del valore Y massimo
        var maxCount = 0;

        // Conta per l'ateneo quanti professori ci sono per ogni anno
        var countPerAnno = [];
        for (let anno = annoStart; anno <= annoEnd; anno++) {
            const data = dataset[getAnnoDatasetIndex(anno)];
            const count = data.filter(row => filterRowWithAteneo(row, ateneo)).length;
            if (count > maxCount) {
                maxCount = count;
            }
            countPerAnno.push(new ChartDataEntry(anno, count));
        }
        console.log("ateneo: " + ateneo + ", conta per anno:");
        console.log(countPerAnno);

        return new ChartDataSingleAteneo(ateneo, countPerAnno, maxCount);
    }



    return (
        <div className='page-container'>
            {/* Selezione campi */}
            <div id="menu-row">
                <DualRangeSlider rangeStart={Values.YEAR_START} rangeEnd={Values.YEAR_END} initialStart={annoStart} initialEnd={annoEnd} updateYears={updateYears}/>
                <DropDownCheckbox title={"Atenei"} options={Values.VALUES_ATENEO} initialSelection={selectedAteneo} updateSelection={setSelectedAteneo}/>
                <DropDownCheckbox title={"Facoltà"} options={Values.VALUES_FACOLTA} initialSelection={selectedFacolta} updateSelection={setSelectedFacolta}/>
                <DropDownCheckbox title={"SC"} options={Values.VALUES_SC} initialSelection={selectedSC} updateSelection={setSelectedSC}/>
                <DropDownCheckbox title={"SSD"} options={Values.VALUES_SSD} initialSelection={selectedSSD} updateSelection={setSelectedSSD}/>
                <DropDownCheckbox title={"Fascia"} options={Values.VALUES_FASCIA} initialSelection={selectedFascia} updateSelection={setSelectedFascia}/>
                <button onClick={updateLineChart}>update chart</button>
            </div>
            {/* Grafici */}
            <svg className="chart" ref={ref} />
        </div>
    )
}
