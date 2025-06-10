import {React, useEffect, useState, useRef} from 'react';

import * as d3 from "d3";

import DualRangeSlider from './menu/DualRangeSlider';
import DropDownCheckbox from './menu/DropDownCheckbox';
import ToggleSwitch from './menu/ToggleSwitch';

import Values from "../DB/Values";

import LineChart from './charts/LineChart';
import MultiLineChart from './charts/MultiLineChart';
import ChartLegend from './charts/ChartLegend';
import TableData from './TableData';

import ChartDataAtenei from '../models/ChartDataAtenei';
import ChartDataSingleAteneo from '../models/ChartDataSingleAteneo';
import ChartDataEntry from '../models/ChartDataEntry';

import '../App.css';

export default function MultiAnalysis({dataset, pesi}) {

    const refSVG = useRef();
    const refTooltip = useRef();

    const margin = {top: 15, right: 0, bottom: 30, left: 40};
    const WIDTH_PERCENTAGE = 0.75;
    const HEIGHT_PERCENTAGE = 0.6;

    // Range di anni
    const [annoStart, setAnnoStart] = useState(2000);
    const [annoEnd, setAnnoEnd] = useState(Values.YEAR_END);

    // Opzioni selezionate
    const [selectedAteneo, setSelectedAteneo] = useState(['ROMA "La Sapienza"','ROMA TRE', 'ROMA "Tor Vergata"']);
    const [selectedFacolta, setSelectedFacolta] = useState(Values.VALUES_FACOLTA);
    const [selectedArea, setSelectedArea] = useState(Values.VALUES_AREA);
    const [selectedSC, setSelectedSC] = useState(Values.VALUES_SC);
    const [selectedSSD, setSelectedSSD] = useState(Values.VALUES_SSD);
    const [selectedFascia, setSelectedFascia] = useState(Values.VALUES_FASCIA);
    

    const [lineChart, setLineChart] = useState(null);


    // Dati per il grafico
    const [dataCount, setDataCount] = useState(new ChartDataAtenei(0, []));         // conteggio professori
    const [dataPuntiOrg, setDataPuntiOrg] = useState(new ChartDataAtenei(0, []));   // conteggio punti organico


    // Per cambiare visualizzazione prof/punti
    const [showingCount, setShowingCount] = useState(true);
    const countYLabel = "Professori";
    const puntiYLabel = "Punti org"

    // Per cambiare visualizzazione grafico/tabella
    const [showingGraph, setShowingGraph] = useState(true);

    // Per il caricamento
    const [loadingData, setLoadingData] = useState(false);
    const [updateButtonEnabled, setUpdateButtonEnabled] = useState(false);


    useEffect(() => {
        initializeLineChart();
    },[]);

    
    async function initializeLineChart() {
        const svg = d3.select(refSVG.current);
        const tooltip = d3.select(refTooltip.current);
        var width = WIDTH_PERCENTAGE*window.innerWidth - margin.left - margin.right;
        var height = HEIGHT_PERCENTAGE*window.innerHeight - margin.top - margin.bottom;

        // Crea chart
        const lchart = new MultiLineChart(svg, tooltip, margin, width, height);
        setLineChart(lchart);

        const vals = await computeData();
        const valsCount = vals["count"];
        const valsPuntiOrg = vals["punti"];

        lchart.draw(valsCount, annoStart, annoEnd, countYLabel);

        window.addEventListener("resize", () => {onWindowResize(lchart);});
    }


    function onWindowResize(chart=lineChart) {
        console.log("resizing");
        var width = WIDTH_PERCENTAGE*window.innerWidth - margin.left - margin.right;
        var height = HEIGHT_PERCENTAGE*window.innerHeight - margin.top - margin.bottom;
        chart.updateSize(margin, width, height);
    }


    async function updateLineChart() {

        // controlla le selezioni
        if (annoStart > annoEnd) { alert("L'intervallo di date non è valido"); return; }
        if (selectedAteneo.length < 1) { alert("Seleziona almeno un ateneo"); return; }
        if (selectedFacolta.length < 1) { alert("Seleziona almeno una facoltà"); return; }
        if (selectedFascia.length < 1) { alert("Seleziona almeno una fascia"); return; }
        if (selectedArea.length < 1) { alert("Seleziona almeno un'area"); return; }
        if (selectedSC.length < 1) { alert("Seleziona almeno un SC"); return; }
        if (selectedSSD.length < 1) { alert("Seleziona almeno un SSD"); return; }

        console.log("updating chart");
        const vals = await computeData();
        const valsCount = vals["count"];
        const valsPuntiOrg = vals["punti"];
        if (showingCount) {
            lineChart.update(valsCount, annoStart, annoEnd, countYLabel);
        }
        else {
            lineChart.update(valsPuntiOrg, annoStart, annoEnd, puntiYLabel);
        }
        setUpdateButtonEnabled(false);
    }


    function updateYears(annoS, annoE) {
        setAnnoStart(annoS);
        setAnnoEnd(annoE);
        setUpdateButtonEnabled(true);
    }



    function getAnnoDatasetIndex(anno) {
        return anno-Values.YEAR_START;
    }



    async function computeData() {

        console.log("inizio compute data");
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

            // prendo gli ssd selezionati tramite area
            var selectedSSDViaArea = [];
            for (const area of selectedArea) {
                selectedSSDViaArea += Values.VALUES_SSD_PER_AREA[area];
            }

            // itero sulle righe del file
            for (const row of data) {
                // applico i filtri
                const rowOk = 
                    (selectedAteneo == Values.VALUES_ATENEO || selectedAteneoLowerCase.includes(row[Values.FIELD_ATENEO].toLowerCase())) &&
                    ( selectedFacolta == Values.VALUES_FACOLTA ||
                      (row[Values.FIELD_FACOLTA] != "" && selectedFacoltaLowerCase.includes(row[Values.FIELD_FACOLTA].toLowerCase())) ||
                      (row[Values.FIELD_STRUTTURA] != "" && selectedFacoltaLowerCase.includes(row[Values.FIELD_STRUTTURA].toLowerCase()))
                    ) &&
                    (selectedFascia == Values.VALUES_FASCIA || (row[Values.FIELD_FASCIA] != "" && selectedFascia.includes(row[Values.FIELD_FASCIA]))) &&
                    (selectedArea == Values.VALUES_AREA || (row[Values.FIELD_SSD] != "" && selectedSSDViaArea.includes(row[Values.FIELD_SSD]))) &&
                    (selectedSC == Values.VALUES_SC || (row[Values.FIELD_SC] != "" && selectedSC.includes(row[Values.FIELD_SC]))) &&
                    (selectedSSD == Values.VALUES_SSD || (row[Values.FIELD_SSD] != "" && selectedSSD.includes(row[Values.FIELD_SSD])));

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
        console.log("finito compute data");
        
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
        if (showingCount) return;
        lineChart.updateYValues(dataCount, countYLabel);
        setShowingCount(true);
    }
    function showPunti() {
        if (!showingCount) return;
        lineChart.updateYValues(dataPuntiOrg, puntiYLabel);
        setShowingCount(false);
    }

    function toggleShownData() {
        if (showingCount) {
            lineChart.updateYValues(dataPuntiOrg, puntiYLabel);
        }
        else {
            lineChart.updateYValues(dataCount, countYLabel);
        }
        setShowingCount(!showingCount);
    }


    return (
        <div className='page-container'>
            {/* Selezione campi */}
            <div className='menu-row-container'>
                <div className='section-title'>Filtri</div>
                <div id="menu-row">
                    <DualRangeSlider rangeStart={Values.YEAR_START} rangeEnd={Values.YEAR_END} initialStart={annoStart} initialEnd={annoEnd} updateYears={updateYears}/>
                    <DropDownCheckbox title={"Atenei"} options={Values.VALUES_ATENEO} initialSelection={selectedAteneo} updateSelection={setSelectedAteneo} enableUpdateButton={()=>{setUpdateButtonEnabled(true);}}/>
                    <DropDownCheckbox title={"Facoltà"} options={Values.VALUES_FACOLTA} initialSelection={selectedFacolta} updateSelection={setSelectedFacolta} enableUpdateButton={()=>{setUpdateButtonEnabled(true);}}/>
                    <DropDownCheckbox title={"Fascia"} options={Values.VALUES_FASCIA} initialSelection={selectedFascia} updateSelection={setSelectedFascia} enableUpdateButton={()=>{setUpdateButtonEnabled(true);}}/>
                    <DropDownCheckbox title={"Aree"} options={Values.VALUES_AREA} initialSelection={selectedArea} updateSelection={setSelectedArea} enableUpdateButton={()=>{setUpdateButtonEnabled(true);}}/>
                    <DropDownCheckbox title={"SC"} options={Values.VALUES_SC} initialSelection={selectedSC} updateSelection={setSelectedSC} enableUpdateButton={()=>{setUpdateButtonEnabled(true);}}/>
                    <DropDownCheckbox title={"SSD"} options={Values.VALUES_SSD} initialSelection={selectedSSD} updateSelection={setSelectedSSD} enableUpdateButton={()=>{setUpdateButtonEnabled(true);}}/>
                    <button id="update-chart-button" onClick={updateLineChart} disabled={!updateButtonEnabled}>Update</button>
                </div>
            </div>
            {/* Parte centrale con grafico/tabella e legenda */}
            <div className='central-section'>
                {/* Grafico */}
                <div style={{display: showingGraph ? 'block' : 'none'}}>
                    <svg className="chart" ref={refSVG}/>
                    {/* Tooltip */}
                    <div id="toolTipDiv" className='tooltip' ref={refTooltip}>
                        <div id="toolTipDiv-title"></div>
                        <hr id="toolTipDiv-line"/>
                        <div id="toolTipDiv-content"></div>
                    </div>
                </div>
                {/* Legenda */}
                <div style={{display: showingGraph ? 'block' : 'none'}} className='legend-container'>
                    <div className='legend-title'>Legenda</div>
                    <div className='legend'>
                        {dataCount.data.map((ateneo, index) =>
                            <ChartLegend key={index} text={ateneo.ateneo} color={ateneo.color}/>
                        )}
                    </div>
                </div>
                {/* Tabella */}
                <div style={{display: !showingGraph ? 'block' : 'none'}} className="table-data-container">
                    <TableData data={showingCount? dataCount : dataPuntiOrg} title={showingCount? countYLabel : puntiYLabel}/>
                </div>
            </div>
            {/* Opzioni di visualizzazione */}
            <div className='visualization-container'>
                <div className='section-title'>Visualizzazione</div>
                <div className="visualization-controls">
                    {/* Scelta asse y (conteggio professori / punti organico) */}
                    <div className="visualization-selection-conta-punti">
                        <div>
                            <input type="radio" name="visualization-selection-conta-punti" id="vis-sel-conta" onChange={showCount} checked={showingCount}/>
                            <label htmlFor="vis-sel-conta">Quantità professori</label>
                        </div>
                        <div>
                            <input type="radio" name="visualization-selection-conta-punti" id="vis-sel-punti" onChange={showPunti} checked={!showingCount}/>
                            <label htmlFor="vis-sel-punti">Punti organico</label>
                        </div>
                    </div>
                    <div className="visualization-controls-separator"/>
                    {/* Scelta grafico o tabella */}
                    <div className="visualization-selection-grafico-tabella">
                        <button className="visualization-selection-button" onClick={()=>{setShowingGraph(true);}} disabled={showingGraph}>
                            <i className="bi bi-graph-up"/>
                            <div className="visualization-selection-button-text">Grafico</div>
                        </button>
                        <button className="visualization-selection-button" onClick={()=>{setShowingGraph(false);}} disabled={!showingGraph}>
                            <i className="bi bi-table"/>
                            <div className="visualization-selection-button-text">Tabella</div>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
