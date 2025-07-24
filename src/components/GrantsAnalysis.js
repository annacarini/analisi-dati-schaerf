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

import '../App.css';

export default function GrantsAnalysis({grants}) {


    const refSVG = useRef();
    const refTooltip = useRef();

    const margin = {top: 15, right: 0, bottom: 30, left: 40};
    const WIDTH_PERCENTAGE = 0.75;
    const HEIGHT_PERCENTAGE = 0.6;

    // Range di anni
    const [annoStart, setAnnoStart] = useState(2000);
    const [annoEnd, setAnnoEnd] = useState(Values.YEAR_END);


    // Opzioni selezionate
    const [selectedAteneo, setSelectedAteneo] = useState('ROMA "La Sapienza"');     // non un array
    const [selectedFacolta, setSelectedFacolta] = useState(Values.VALUES_FACOLTA);
    const [selectedArea, setSelectedArea] = useState(Values.VALUES_AREA);
    const [selectedSC, setSelectedSC] = useState(Values.VALUES_SC);
    const [selectedSSD, setSelectedSSD] = useState(Values.VALUES_SSD);
    const [selectedFascia, setSelectedFascia] = useState(Values.VALUES_FASCIA);
    

    const [barChart, setBarChart] = useState(null);


    // Dati per il grafico
    const [dataGrants, setDataGrants] = useState(new ChartDataAtenei(0, []));         // conteggio grant - DA CAMBIARE CLASSE


    // Per cambiare visualizzazione grafico/tabella
    const [showingGraph, setShowingGraph] = useState(true);


    // Per il caricamento
    const [loadingData, setLoadingData] = useState(false);
    const [updateButtonEnabled, setUpdateButtonEnabled] = useState(false);



    useEffect(() => {
        initializeBarChart();
    },[]);


    async function initializeBarChart() {

    }


    async function updateBarChart() {

    }


    function updateYears(annoS, annoE) {
        setAnnoStart(annoS);
        setAnnoEnd(annoE);
        setUpdateButtonEnabled(true);
    }


    function getAnnoDatasetIndex(anno) {
        return anno-Values.YEAR_START;
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
                    <button id="update-chart-button" onClick={updateBarChart} disabled={!updateButtonEnabled}>{!loadingData ? "Update" : "Loading"}</button>
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
                        {dataGrants.data.map((campo, index) =>
                            <ChartLegend key={index} text={campo.ateneo} color={campo.color}/>
                        )}
                    </div>
                </div>
                {/* Tabelle */}
                <div style={{display: !showingGraph ? 'block' : 'none'}} className="table-data-container">
                    {/* Tabella grants */}
                    <TableData data={dataGrants} title={"Grants"}/>
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
                    <div className='analysis-title'>Analisi ateneo {selectedAteneo}</div>
                </div>
            </div>
        </div>
    )
}