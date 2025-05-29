import {React, useEffect, useState, useRef} from 'react';

import * as d3 from "d3";

import DualRangeSlider from './menu/DualRangeSlider';
import DropDownCheckbox from './menu/DropDownCheckbox';
import ToggleSwitch from './menu/ToggleSwitch';

import Values from "../DB/Values";

import LineChart from './charts/LineChart';
import MultiLineChart from './charts/MultiLineChart';
import ChartLegend from './charts/ChartLegend';

import ChartDataAtenei from '../models/ChartDataAtenei';
import ChartDataSingleAteneo from '../models/ChartDataSingleAteneo';
import ChartDataEntry from '../models/ChartDataEntry';

import '../App.css';

export default function MultiAnalysis({dataset, pesi}) {

    const refSVG = useRef();

    const margin = {top: 10, right: 0, bottom: 30, left: 40};
    const WIDTH_PERCENTAGE = 0.8;
    const HEIGHT_PERCENTAGE = 0.6;

    // Range di anni
    const [annoStart, setAnnoStart] = useState(2000);
    const [annoEnd, setAnnoEnd] = useState(Values.YEAR_END);

    // Opzioni selezionate
    const [selectedAteneo, setSelectedAteneo] = useState(['ROMA "La Sapienza"','ROMA TRE', 'ROMA "Tor Vergata"']);
    const [selectedFacolta, setSelectedFacolta] = useState(Values.VALUES_FACOLTA);
    const [selectedSC, setSelectedSC] = useState(Values.VALUES_SC);
    const [selectedSSD, setSelectedSSD] = useState(Values.VALUES_SSD);
    const [selectedFascia, setSelectedFascia] = useState(Values.VALUES_FASCIA);
    

    const [lineChart, setLineChart] = useState(null);


    // Dati per il grafico
    const [dataCount, setDataCount] = useState(new ChartDataAtenei(0, []));         // conteggio professori
    const [dataPuntiOrg, setDataPuntiOrg] = useState(new ChartDataAtenei(0, []));   // conteggio punti organico

    // Per cambiare visualizzazione
    const [showingCount, setShowingCount] = useState(true);

    // Per il caricamento
    const [loadingData, setLoadingData] = useState(false);


    useEffect(() => {
        initializeLineChart();
    },[]);

    
    async function initializeLineChart() {
        const svg = d3.select(refSVG.current);
        var width = WIDTH_PERCENTAGE*window.innerWidth - margin.left - margin.right;
        var height = HEIGHT_PERCENTAGE*window.innerHeight - margin.top - margin.bottom;

        // Crea chart
        const lchart = new MultiLineChart(svg, margin, width, height);
        setLineChart(lchart);

        const vals = await computeData();
        const valsCount = vals["count"];
        const valsPuntiOrg = vals["punti"];

        lchart.draw(valsCount, annoStart, annoEnd);
    }


    async function updateLineChart() {
        console.log("updating chart");
        const vals = await computeData();
        const valsCount = vals["count"];
        const valsPuntiOrg = vals["punti"];
        lineChart.update(valsCount, annoStart, annoEnd);
    }



    function updateYears(annoS, annoE) {
        setAnnoStart(annoS);
        setAnnoEnd(annoE);
    }



    function getAnnoDatasetIndex(anno) {
        return anno-Values.YEAR_START;
    }



    async function computeData() {

        console.log("inizio compute data 2");
        let startTime = performance.now();

        setLoadingData(true);
    
        var totalCount = {};
        var totalPuntiOrg = {};

        // inizializzo la struttura dati
        for (const ateneo of selectedAteneo) {
            totalCount[ateneo] = {};
            totalPuntiOrg[ateneo] = {};
        }

        // itero sugli anni perche' per ogni anno ho un file diverso
        for (let anno = annoStart; anno <= annoEnd; anno++) {

            // inizializzo per ogni ateneo la conta per ogni anno
            for (const ateneo of selectedAteneo) {
                totalCount[ateneo][anno] = 0;
                totalPuntiOrg[ateneo][anno] = 0;
            }

            // metto le selezioni in lowercase
            const selectedAteneoLowerCase = selectedAteneo.map((str) => str.toLowerCase());
            const selectedFacoltaLowerCase = selectedFacolta.map((str) => str.toLowerCase());

            // prendo il file di quell'anno
            const data = dataset[getAnnoDatasetIndex(anno)];

            // itero sulle righe del file
            for (const row of data) {
                // applico i filtri
                const rowOk = 
                    (selectedAteneo == Values.VALUES_ATENEO || selectedAteneoLowerCase.includes(row[Values.FIELD_ATENEO].toLowerCase())) &&
                    ( selectedFacolta == Values.VALUES_FACOLTA ||
                      selectedFacoltaLowerCase.includes(row[Values.FIELD_FACOLTA].toLowerCase()) ||
                      selectedFacoltaLowerCase.includes(row[Values.FIELD_STRUTTURA].toLowerCase())
                    ) &&
                    (selectedFascia == Values.VALUES_FASCIA || selectedFascia.includes(row[Values.FIELD_FASCIA])) &&
                    (selectedSC == Values.VALUES_SC || selectedSC.includes(row[Values.FIELD_SC])) &&
                    (selectedSSD == Values.VALUES_SSD || selectedSSD.includes(row[Values.FIELD_SSD]));

                // se la riga rispetta i filtri allora aggiungo il conteggio all'ateneo corrispondente
                if (rowOk && (row[Values.FIELD_ATENEO] != Values.FIELD_ATENEO)) {
                    totalCount[row[Values.FIELD_ATENEO]][anno] += 1;
                    let peso = 0;
                    if (row[Values.FIELD_FASCIA] in pesi) {
                        peso = pesi[row[Values.FIELD_FASCIA]];
                    }
                    totalPuntiOrg[row[Values.FIELD_ATENEO]][anno] += peso;
                }
            }
        }

        // Metti i dati nel formato giusto

        var totalCountNewFormat = [];
        var maxCount = 0;

        var totalPuntiOrgNewFormat = [];
        var maxPuntiOrg = 0;

        // ora totalCount e' del tipo: {"sapienza":{2000:100, 2001:124, ...}, "roma tre":{...}, ...}
        for (var ateneo in totalCount) {

            var maxCountAteneo = 0;
            var maxPuntiOrgAteneo = 0;

            var countPerAnno = [];
            var puntiOrgPerAnno = [];

            for (let anno = annoStart; anno <= annoEnd; anno++) {

                // arrotonda punti org perche' sono float
                totalPuntiOrg[ateneo][anno] = Math.round(totalPuntiOrg[ateneo][anno] * 100) / 100;


                maxCountAteneo = Math.max(totalCount[ateneo][anno], maxCountAteneo);
                maxPuntiOrgAteneo = Math.max(totalPuntiOrg[ateneo][anno], maxPuntiOrgAteneo);

                countPerAnno.push(new ChartDataEntry(anno, totalCount[ateneo][anno]));
                puntiOrgPerAnno.push(new ChartDataEntry(anno, totalPuntiOrg[ateneo][anno]));
            }

            totalCountNewFormat.push(new ChartDataSingleAteneo(ateneo, countPerAnno, maxCountAteneo));
            totalPuntiOrgNewFormat.push(new ChartDataSingleAteneo(ateneo, puntiOrgPerAnno, maxPuntiOrgAteneo));

            maxCount = Math.max(maxCount, maxCountAteneo);
            maxPuntiOrg = Math.max(maxPuntiOrg, maxPuntiOrgAteneo);
        }


        let endTime = performance.now();
        console.log(endTime - startTime); //in ms 
        console.log("finito compute data 2");
        
        const count = new ChartDataAtenei(maxCount, totalCountNewFormat);
        const punti = new ChartDataAtenei(maxPuntiOrg, totalPuntiOrgNewFormat)

        setDataCount(count);
        setDataPuntiOrg(punti);

        setLoadingData(false);

        return {
            "count": count,
            "punti": punti
        };
    }




    function showCount() {
        lineChart.update(dataCount, annoStart, annoEnd);
        setShowingCount(true);
    }
    function showPunti() {
        lineChart.update(dataPuntiOrg, annoStart, annoEnd);
        setShowingCount(false);
    }

    function toggleShownData() {
        if (showingCount) {
            lineChart.update(dataPuntiOrg, annoStart, annoEnd);
        }
        else {
            lineChart.update(dataCount, annoStart, annoEnd);
        }
        setShowingCount(!showingCount);
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
                <button id="update-chart-button" onClick={updateLineChart} disabled={loadingData}>Update</button>
            </div>
            {/* Scelta asse y e visualizzazione grafico/tabella */}
            {/*<div id="graph-choice-row">
                <ToggleSwitch label={"Punti organico"} onChange={toggleShownData}/>
            </div>*/}
            <div id="graph-choice-row">
                <div id="count-punti-selection">
                    <div>
                        <input type="radio" id="count" name="count" value="count" onClick={showCount} checked={showingCount}/>
                        <label for="count">Quantità professori</label>
                    </div>
                    <div>
                        <input type="radio" id="punti" name="punti" value="punti" onClick={showPunti} checked={!showingCount}/>
                        <label for="punti">Punti organico</label>
                    </div>
                </div>
            </div>
            {/* Grafici */}
            <svg className="chart" ref={refSVG}/>
            {/* Legenda */}
            <div className='legend'>
                {dataCount.data.map((ateneo, index) =>
                    <ChartLegend key={index} text={ateneo.ateneo} color={ateneo.color}/>
                )}
            </div>
        </div>
    )
}
