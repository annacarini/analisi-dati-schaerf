import {React, useEffect, useState, useRef} from 'react';

import * as d3 from "d3";

import DualRangeSlider from './menu/DualRangeSlider';
import DropDownCheckbox from './menu/DropDownCheckbox';
import DropDownRadio from './menu/DropDownRadio';
import Values from "../DB/Values";

import LineChart from './charts/LineChart';
import MultiLineChart from './charts/MultiLineChart';
import ChartLegend from './charts/ChartLegend';
import TableData from './TableData';

import ChartDataAtenei from '../models/ChartDataAtenei';
import ChartDataSingleAteneo from '../models/ChartDataSingleAteneo';
import ChartDataEntry from '../models/ChartDataEntry';


export default function SingleAnalysis({dataset, pesi}) {

    const refSVG = useRef();
    const refTooltip = useRef();

    const margin = {top: 15, right: 0, bottom: 30, left: 40};
    const WIDTH_PERCENTAGE = 0.75;
    const HEIGHT_PERCENTAGE = 0.6;

    // Range di anni
    const [annoStart, setAnnoStart] = useState(2000);
    const [annoEnd, setAnnoEnd] = useState(Values.YEAR_END);

    // Opzioni selezionate
    const [selectedAteneo, setSelectedAteneo] = useState('ROMA "La Sapienza"');     // non un array stavolta
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
    

    // Campo su cui fare il confronto
    const [selectedFieldName, setSelectedFieldName] = useState(Values.FIELD_AREA);


    async function initializeLineChart() {
        const svg = d3.select(refSVG.current);
        const tooltip = d3.select(refTooltip.current);
        var width = WIDTH_PERCENTAGE*window.innerWidth - margin.left - margin.right;
        var height = HEIGHT_PERCENTAGE*window.innerHeight - margin.top - margin.bottom;

        // Crea chart
        const lchart = new MultiLineChart(svg, tooltip, margin, width, height, 2);
        setLineChart(lchart);

        const vals = await computeData(selectedFieldName);
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

    async function updateLineChart(_selectedFieldName) {

        console.log("updating chart, field name: " + _selectedFieldName);

        // controlla le selezioni
        if (annoStart > annoEnd) { alert("L'intervallo di date non è valido"); return; }
        if (selectedFacolta.length < 1) { alert("Seleziona almeno una facoltà"); return; }
        if (selectedFascia.length < 1) { alert("Seleziona almeno una fascia"); return; }
        if (selectedArea.length < 1) { alert("Seleziona almeno un'area"); return; }
        if (selectedSC.length < 1) { alert("Seleziona almeno un SC"); return; }
        if (selectedSSD.length < 1) { alert("Seleziona almeno un SSD"); return; }

        console.log("updating chart");
        const vals = await computeData(_selectedFieldName);
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


    function getAreaBySSD(ssd) {
        for (const area of Values.VALUES_AREA) {
            if (Values.VALUES_SSD_PER_AREA[area].includes(ssd)) {
                return area;
            }
        }
        return "";
    }


    function getFieldByFieldName(fieldName) {
        var field = [];
        switch(fieldName) {
            case Values.FIELD_AREA:
                field = selectedArea; break;
            case Values.FIELD_FACOLTA:
                field = selectedFacolta; break;
            case Values.FIELD_FASCIA:
                field = selectedFascia; break;
            default:
                break;
        }
        return field;
    }


    async function computeData(_selectedFieldName) {

        console.log("inizio compute data single analysis");
        let startTime = performance.now();

        setLoadingData(true);

        var totalCount = {};
        var totalPuntiOrg = {};

        console.log("getting field of field name: " + _selectedFieldName);
        const _selectedField = getFieldByFieldName(_selectedFieldName);
        console.log("selected field:");
        console.log(_selectedField);

        // inizializzo la struttura dati
        for (const campo of _selectedField) {
            totalCount[campo] = {};
            totalPuntiOrg[campo] = {};
        }

        // itero sugli anni perche' per ogni anno ho un file diverso
        for (let anno = annoStart; anno <= annoEnd; anno++) {
            
            // inizializzo per ogni campo la conta per ogni anno
            for (const campo of _selectedField) {
                totalCount[campo][anno] = 0;
                totalPuntiOrg[campo][anno] = 0;
            }

            // metto le selezioni in lowercase
            const selectedAteneoLowerCase = selectedAteneo.toLowerCase();
            const selectedFacoltaLowerCase = selectedFacolta.map((str) => str.toLowerCase());

            // prendo il file di quell'anno
            const data = dataset[getAnnoDatasetIndex(anno)];

            // prendo gli ssd selezionati tramite area
            var selectedSSDViaArea = [];
            if (selectedArea != Values.VALUES_AREA) {
                for (const area of selectedArea) {
                    selectedSSDViaArea += Values.VALUES_SSD_PER_AREA[area];
                }
            }
            else {
                selectedSSDViaArea = Values.VALUES_SSD;
            }
            
            // itero sulle righe del file
            for (const row of data) {

                // applico i filtri
                const rowOk = 
                    (selectedAteneoLowerCase == row[Values.FIELD_ATENEO].toLowerCase()) &&
                    ( selectedFacolta == Values.VALUES_FACOLTA ||
                        (row[Values.FIELD_FACOLTA] != "" && selectedFacoltaLowerCase.includes(row[Values.FIELD_FACOLTA].toLowerCase())) ||
                        (row[Values.FIELD_STRUTTURA] != "" && selectedFacoltaLowerCase.includes(row[Values.FIELD_STRUTTURA].toLowerCase()))
                    ) &&
                    (selectedFascia == Values.VALUES_FASCIA || (row[Values.FIELD_FASCIA] != "" && selectedFascia.includes(row[Values.FIELD_FASCIA]))) &&
                    (selectedArea == Values.VALUES_AREA || (row[Values.FIELD_SSD] != "" && selectedSSDViaArea.includes(row[Values.FIELD_SSD]))) &&
                    (selectedSC == Values.VALUES_SC || (row[Values.FIELD_SC] != "" && selectedSC.includes(row[Values.FIELD_SC]))) &&
                    (selectedSSD == Values.VALUES_SSD || (row[Values.FIELD_SSD] != "" && selectedSSD.includes(row[Values.FIELD_SSD])));

                
                // se la riga rispetta i filtri allora aggiungo il conteggio al campo corrispondente
                if (rowOk && (row[_selectedFieldName] != _selectedFieldName)) {

                    // se il campo scelto e' l'area bisogna ottenere il valore dallo ssd, se esiste
                    var currentField = "";
                    if (_selectedFieldName == Values.FIELD_AREA && row[Values.FIELD_SSD] != "") {
                        currentField = getAreaBySSD(row[Values.FIELD_SSD]);
                        if (currentField in totalCount) {
                            totalCount[currentField][anno] += 1;
                            let peso = 0;
                            if (row[Values.FIELD_FASCIA] in pesi) {
                                peso = pesi[row[Values.FIELD_FASCIA]];
                            }
                            totalPuntiOrg[currentField][anno] += peso;
                        }
                    }
                    else if (_selectedFieldName != Values.FIELD_AREA && row[_selectedFieldName] in totalCount && row[_selectedFieldName] in totalPuntiOrg) {
                        totalCount[row[_selectedFieldName]][anno] += 1;
                        let peso = 0;
                        if (row[Values.FIELD_FASCIA] in pesi) {
                            peso = pesi[row[Values.FIELD_FASCIA]];
                        }
                        totalPuntiOrg[row[_selectedFieldName]][anno] += peso;
                    }
                }
            }

        }

        
        // Metti i dati nel formato giusto

        var totalCountNewFormat = [];
        var maxCount = 0;

        var totalPuntiOrgNewFormat = [];
        var maxPuntiOrg = 0;

        // ora totalCount e' del tipo: {"sapienza":{2000:100, 2001:124, ...}, "roma tre":{...}, ...}
        for (var campo in totalCount) {

            var maxCountCampo = 0;
            var maxPuntiOrgCampo = 0;

            var countPerAnno = [];
            var puntiOrgPerAnno = [];

            for (let anno = annoStart; anno <= annoEnd; anno++) {

                // arrotonda punti org perche' sono float
                totalPuntiOrg[campo][anno] = Math.round(totalPuntiOrg[campo][anno] * 100) / 100;

                maxCountCampo = Math.max(totalCount[campo][anno], maxCountCampo);
                maxPuntiOrgCampo = Math.max(totalPuntiOrg[campo][anno], maxPuntiOrgCampo);

                countPerAnno.push(new ChartDataEntry(anno, totalCount[campo][anno]));
                puntiOrgPerAnno.push(new ChartDataEntry(anno, totalPuntiOrg[campo][anno]));
            }

            totalCountNewFormat.push(new ChartDataSingleAteneo(campo, countPerAnno, maxCountCampo));
            totalPuntiOrgNewFormat.push(new ChartDataSingleAteneo(campo, puntiOrgPerAnno, maxPuntiOrgCampo));

            maxCount = Math.max(maxCount, maxCountCampo);
            maxPuntiOrg = Math.max(maxPuntiOrg, maxPuntiOrgCampo);
        }


        let endTime = performance.now();
        console.log(endTime - startTime); //in ms 
        console.log("finito compute data single analysis");
        
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



    function updateYears(annoS, annoE) {
        setAnnoStart(annoS);
        setAnnoEnd(annoE);
        setUpdateButtonEnabled(true);
    }


    function getAnnoDatasetIndex(anno) {
        return anno-Values.YEAR_START;
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



    return (
        <div className='page-container'>
            {/* Selezione campi */}
            <div className='menu-row-container'>
                <div className='section-title'>Filtri</div>
                <div id="menu-row">
                    <DualRangeSlider rangeStart={Values.YEAR_START} rangeEnd={Values.YEAR_END} initialStart={annoStart} initialEnd={annoEnd} updateYears={updateYears}/>
                    <DropDownRadio title={"Ateneo"} options={Values.VALUES_ATENEO} initialSelection={selectedAteneo} updateSelection={setSelectedAteneo} enableUpdateButton={()=>{setUpdateButtonEnabled(true);}}/>
                    <DropDownCheckbox title={"Facoltà"} options={Values.VALUES_FACOLTA} initialSelection={selectedFacolta} updateSelection={setSelectedFacolta} enableUpdateButton={()=>{setUpdateButtonEnabled(true);}}/>
                    <DropDownCheckbox title={"Fascia"} options={Values.VALUES_FASCIA} initialSelection={selectedFascia} updateSelection={setSelectedFascia} enableUpdateButton={()=>{setUpdateButtonEnabled(true);}}/>
                    <DropDownCheckbox title={"Aree"} options={Values.VALUES_AREA} initialSelection={selectedArea} updateSelection={setSelectedArea} enableUpdateButton={()=>{setUpdateButtonEnabled(true);}}/>
                    <DropDownCheckbox title={"SC"} options={Values.VALUES_SC} initialSelection={selectedSC} updateSelection={setSelectedSC} enableUpdateButton={()=>{setUpdateButtonEnabled(true);}}/>
                    <DropDownCheckbox title={"SSD"} options={Values.VALUES_SSD} initialSelection={selectedSSD} updateSelection={setSelectedSSD} enableUpdateButton={()=>{setUpdateButtonEnabled(true);}}/>
                    <button id="update-chart-button" onClick={() => {updateLineChart(selectedFieldName);}} disabled={!updateButtonEnabled}>{!loadingData ? "Update" : "Loading"}</button>
                </div>
            </div>
            {/* Parte centrale con grafico/tabella e legenda */}
            <div className='central-section'>
                {/* Grafico */}
                <div style={{display: showingGraph ? 'block' : 'none'}}>
                    <svg className="chart" ref={refSVG}/>
                    {/* Tooltip */}
                    <div id="toolTipDiv2" className='tooltip' ref={refTooltip}>
                        <div id="toolTipDiv-title2" className='tooltip-title'></div>
                        <hr id="toolTipDiv-line2" className='tooltip-line'/>
                        <div id="toolTipDiv-content2" className='tooltip-content'></div>
                    </div>
                </div>
                {/* Legenda */}
                <div style={{display: showingGraph ? 'block' : 'none'}} className='legend-container'>
                    <div className='legend-title'>Legenda</div>
                    <div className='legend'>
                        {dataCount.data.map((campo, index) =>
                            <ChartLegend key={index} text={campo.ateneo} color={campo.color}/>
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
                            <input type="radio" name="visualization-selection-conta-punti2" id="vis-sel-conta2" onChange={showCount} checked={showingCount}/>
                            <label htmlFor="vis-sel-conta2">Quantità professori</label>
                        </div>
                        <div>
                            <input type="radio" name="visualization-selection-conta-punti2" id="vis-sel-punti2" onChange={showPunti} checked={!showingCount}/>
                            <label htmlFor="vis-sel-punti2">Punti organico</label>
                        </div>
                    </div>
                    <div className="visualization-controls-separator"/>
                    {/* Scelta campo su cui fare il confronto */}
                    <div className="visualization-selection-campo-confronto">
                        <div>
                            <input type="radio" name="visualization-selection-campo-confronto" id="vis-sel-campo-area"
                                onClick={() => {setSelectedFieldName(Values.FIELD_AREA); updateLineChart(Values.FIELD_AREA);}} checked={selectedFieldName == Values.FIELD_AREA}/>
                            <label htmlFor="vis-sel-campo-area">Area</label>
                        </div>
                        <div>
                            <input type="radio" name="visualization-selection-campo-confronto" id="vis-sel-campo-fascia"
                                onClick={() => {setSelectedFieldName(Values.FIELD_FASCIA); updateLineChart(Values.FIELD_FASCIA);}} checked={selectedFieldName == Values.FIELD_FASCIA}/>
                            <label htmlFor="vis-sel-campo-fascia">Fascia</label>
                        </div>
                        <div>
                            <input type="radio" name="visualization-selection-campo-confronto" id="vis-sel-campo-facolta"
                                onClick={() => {setSelectedFieldName(Values.FIELD_FACOLTA); updateLineChart(Values.FIELD_FACOLTA);}} checked={selectedFieldName == Values.FIELD_FACOLTA}/>
                            <label htmlFor="vis-sel-campo-facolta">Facoltà</label>
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
                    <div className="visualization-controls-separator"/>
                    <div className='analysis-title'>Analisi ateneo {selectedAteneo}, confronto per {selectedFieldName}</div>
                </div>
            </div>
        </div>
    )
}