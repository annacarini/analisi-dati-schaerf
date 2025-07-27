import {React, useEffect, useState, useRef} from 'react';

import * as d3 from "d3";

import DualRangeSlider from './menu/DualRangeSlider';
import DropDownCheckbox from './menu/DropDownCheckbox';
import DropDownRadio from './menu/DropDownRadio';
import ToggleSwitch from './menu/ToggleSwitch';

import Values from "../DB/Values";

import MultiLineChart from './charts/MultiLineChart';
import ChartLegend from './charts/ChartLegend';
import TableData from './TableData';

import ChartDataAtenei from '../models/ChartDataAtenei';
import ChartDataSingleAteneo from '../models/ChartDataSingleAteneo';
import ChartDataEntry from '../models/ChartDataEntry';
import GrantsPerYear from '../models/GrantsPerYear';
import Grant from '../models/Grant';

import '../App.css';
import BarChart from './charts/BarChart';

export default function GrantsAnalysis({grants}) {


    const refSVG = useRef();
    const refTooltip = useRef();

    const margin = {top: 15, right: 0, bottom: 30, left: 70};
    const WIDTH_PERCENTAGE = 0.75;
    const HEIGHT_PERCENTAGE = 0.6;

    // Range di anni
    const [annoStart, setAnnoStart] = useState(2000);
    const [annoEnd, setAnnoEnd] = useState(Values.YEAR_END);


    // Opzioni selezionate
    const [selectedAteneo, setSelectedAteneo] = useState('ROMA "La Sapienza"');     // non un array
    /*
    const [selectedFacolta, setSelectedFacolta] = useState(Values.VALUES_FACOLTA);
    const [selectedArea, setSelectedArea] = useState(Values.VALUES_AREA);
    const [selectedSC, setSelectedSC] = useState(Values.VALUES_SC);
    const [selectedSSD, setSelectedSSD] = useState(Values.VALUES_SSD);
    const [selectedFascia, setSelectedFascia] = useState(Values.VALUES_FASCIA);
    */

    const [barChart, setBarChart] = useState(null);


    // Dati per il grafico
    const [dataGrants, setDataGrants] = useState(new ChartDataSingleAteneo(selectedAteneo, [], 0));         // conteggio grant

    const yLabel = "Grants (€)";

    // Per cambiare visualizzazione grafico/tabella
    const [showingGraph, setShowingGraph] = useState(true);

    // Per cambiare bande    simple/stacked
    const [barsStacked, setbarsStacked] = useState(false);

    // Per il caricamento
    const [loadingData, setLoadingData] = useState(false);
    const [updateButtonEnabled, setUpdateButtonEnabled] = useState(false);



    useEffect(() => {
        initializeBarChart();
    },[]);


    async function initializeBarChart() {

        const svg = d3.select(refSVG.current);
        const tooltip = d3.select(refTooltip.current);
        var width = WIDTH_PERCENTAGE*window.innerWidth - margin.left - margin.right;
        var height = HEIGHT_PERCENTAGE*window.innerHeight - margin.top - margin.bottom;

        // Crea chart
        const bchart = new BarChart(svg, tooltip, margin, width, height, barsStacked, 3);
        setBarChart(bchart);

        const vals = await computeData();

        bchart.draw(vals, annoStart, annoEnd, barsStacked, yLabel);

        window.addEventListener("resize", () => {onWindowResize(bchart);});
    }


    function onWindowResize(chart=barChart) {
        //console.log("resizing");
        var width = WIDTH_PERCENTAGE*window.innerWidth - margin.left - margin.right;
        var height = HEIGHT_PERCENTAGE*window.innerHeight - margin.top - margin.bottom;
        chart.updateSize(margin, width, height);
    }


    async function updateBarChart() {
        // controlla le selezioni
        if (annoStart > annoEnd) { alert("L'intervallo di date non è valido"); return; }
        if (selectedAteneo.length < 1) { alert("Seleziona almeno un ateneo"); return; }

        console.log("updating chart");
        const vals = await computeData();
        barChart.update(vals, annoStart, annoEnd, barsStacked, yLabel);
        setUpdateButtonEnabled(false);
    }



    async function computeData() {
        console.log("inizio compute data grants");
        let startTime = performance.now();
        setLoadingData(true);

        var totalCount = {};

        // inizializzo per ogni anno un dizionario dove mettere i vari grants
        for (let anno = annoStart; anno <= annoEnd; anno++) {
            totalCount[anno] = new GrantsPerYear(anno, []);
        }

        // metto la selezione in lowercase
        const selectedAteneoLowerCase = selectedAteneo.toLowerCase();
        
        // itero sulle righe del file
        for (const row of grants) {

            // controlla se l'ateneo e' quello scelto
            var rowOk = selectedAteneoLowerCase == row[Values.FIELD_ATENEO].toLowerCase();

            // controlla se l'anno e' nel range
            const anno = parseInt(row[Values.FIELD_YEAR]);
            rowOk = rowOk && (anno >= annoStart && anno <= annoEnd);

            // se la riga rispetta i filtri allora aggiungo il conteggio all'ateneo corrispondente
            if (rowOk) {

                const nome = row[Values.GRANTS_FIELD_ACRONIMO];
                var valore = parseFloat(row[Values.GRANTS_FIELD_VALORE])/parseInt(row[Values.GRANTS_FIELD_NUMERO_ORGANIZZAZIONI]);
                // arrotonda valore a una cifra decimale
                valore = Math.round(valore * 10) / 10;

                // crea oggetto Grant
                const grant = new Grant(nome, valore);

                // aggiungi il grant all'array di quell'anno
                totalCount[anno].data.push(grant);

                // aggiorna la somma totale di quell'anno
                totalCount[anno].somma += valore;
            }
        }

        // Metti i dati nel formato giusto

        var totalCountNewFormat = [];
        var maxCount = 0;

        // ora totalCount e' del tipo: {"2000":grantsPerYear1, "2001":grantsPerYear2, ...}
        for (let anno = annoStart; anno <= annoEnd; anno++) {
            totalCountNewFormat.push(totalCount[anno]);
            maxCount = Math.max(maxCount, totalCount[anno].somma);
        }
        
        const count = new ChartDataSingleAteneo(selectedAteneo, totalCountNewFormat, maxCount);

        setDataGrants(count);
        

        let endTime = performance.now();
        console.log("finito compute data grants, durata: " + (endTime - startTime));
        //console.log(count);
        
        setLoadingData(false);

        return count;
    }




    function updateYears(annoS, annoE) {
        setAnnoStart(annoS);
        setAnnoEnd(annoE);
        setUpdateButtonEnabled(true);
    }



    function togglebarsStackedStacked() {
        barChart.setStacked(!barsStacked);
        setbarsStacked(!barsStacked);
    }


    return (
        <div className='page-container'>
            {/* Selezione campi */}
            <div className='menu-row-container'>
                <div className='section-title'>Filtri</div>
                <div id="menu-row">
                    <DualRangeSlider rangeStart={Values.YEAR_START} rangeEnd={Values.YEAR_END} initialStart={annoStart} initialEnd={annoEnd} updateYears={updateYears}/>
                    <DropDownRadio title={"Ateneo"} options={Values.VALUES_ATENEO} initialSelection={selectedAteneo} updateSelection={setSelectedAteneo} enableUpdateButton={()=>{setUpdateButtonEnabled(true);}}/>
                    {/*
                    <DropDownCheckbox title={"Facoltà"} options={Values.VALUES_FACOLTA} initialSelection={selectedFacolta} updateSelection={setSelectedFacolta} enableUpdateButton={()=>{setUpdateButtonEnabled(true);}}/>
                    <DropDownCheckbox title={"Fascia"} options={Values.VALUES_FASCIA} initialSelection={selectedFascia} updateSelection={setSelectedFascia} enableUpdateButton={()=>{setUpdateButtonEnabled(true);}}/>
                    <DropDownCheckbox title={"Aree"} options={Values.VALUES_AREA} initialSelection={selectedArea} updateSelection={setSelectedArea} enableUpdateButton={()=>{setUpdateButtonEnabled(true);}}/>
                    <DropDownCheckbox title={"SC"} options={Values.VALUES_SC} initialSelection={selectedSC} updateSelection={setSelectedSC} enableUpdateButton={()=>{setUpdateButtonEnabled(true);}}/>
                    <DropDownCheckbox title={"SSD"} options={Values.VALUES_SSD} initialSelection={selectedSSD} updateSelection={setSelectedSSD} enableUpdateButton={()=>{setUpdateButtonEnabled(true);}}/>
                    
                    */}
                    <button id="update-chart-button" onClick={updateBarChart} disabled={!updateButtonEnabled}>{!loadingData ? "Update" : "Loading"}</button>
                </div>
            </div>
            {/* Parte centrale con grafico/tabella e legenda */}
            <div className='central-section'>
                {/* Grafico */}
                <div style={{display: showingGraph ? 'block' : 'none'}}>
                    <svg className="chart" ref={refSVG}/>
                    {/* Tooltip */}
                    <div id="toolTipDiv3" className='tooltip' ref={refTooltip}>
                        <div id="toolTipDiv-title3" className='tooltip-title'></div>
                        <hr id="toolTipDiv-line3" className='tooltip-line'/>
                        <div id="toolTipDiv-content3" className='tooltip-content'></div>
                    </div>
                </div>
                {/* Legenda */}
                <div style={{display: showingGraph ? 'block' : 'none'}} className='legend-container'>
                    <div className='legend-title'>Legenda</div>
                    <div className='legend'>
                        {dataGrants.data.map((campo, index) =>
                            <ChartLegend key={index} text={campo.ateneo} color={campo.color}/>
                        )}
                    </div>
                </div>
                {/* Tabelle */}
                <div style={{display: !showingGraph ? 'block' : 'none'}} className="table-data-container">
                    {/* Tabella grants */}
                    {/*<TableData data={dataGrants} title={"Grants"}/>*/}
                </div>
            </div>
            {/* Opzioni di visualizzazione */}
            <div className='visualization-container'>
                <div className='section-title'>Visualizzazione</div>
                <div className="visualization-controls">
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
                    {/* Toggle bandi */}
                    <div>
                        <ToggleSwitch label={barsStacked ? "Nascondi singoli grants" : "Mostra singoli grants"} checked={barsStacked} onChange={togglebarsStackedStacked}/>
                    </div>
                    <div className="visualization-controls-separator"/>
                    <div className='analysis-title'>Analisi ateneo {selectedAteneo}</div>
                </div>
            </div>
        </div>
    )
}