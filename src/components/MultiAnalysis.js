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

export default function MultiAnalysis({dataset, pesi, bandi}) {

    const refSVG = useRef();
    const refSVGDashedLines = useRef();
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
    const [dataBandi, setDataBandi] = useState(new ChartDataAtenei(0, []));   // conteggio bandi


    // Per cambiare visualizzazione prof/punti
    const [showingCount, setShowingCount] = useState(true);
    const countYLabel = "Professori";
    const puntiYLabel = "Punti org"

    // Per cambiare visualizzazione grafico/tabella
    const [showingGraph, setShowingGraph] = useState(true);

    // Per mostrare/nascondere i dati sui bandi
    const [showingBandi, setShowingBandi] = useState(false);

    // Per il caricamento
    const [loadingData, setLoadingData] = useState(false);
    const [updateButtonEnabled, setUpdateButtonEnabled] = useState(false);


    useEffect(() => {
        initializeLineChart();
    },[]);


    
    async function initializeLineChart() {
        const svg = d3.select(refSVG.current);
        const dashedGroup = d3.select(refSVGDashedLines.current);
        const tooltip = d3.select(refTooltip.current);
        var width = WIDTH_PERCENTAGE*window.innerWidth - margin.left - margin.right;
        var height = HEIGHT_PERCENTAGE*window.innerHeight - margin.top - margin.bottom;

        // Crea chart
        const lchart = new MultiLineChart(svg, dashedGroup, tooltip, margin, width, height, 1);
        setLineChart(lchart);

        const vals = await computeData();
        const valsCount = vals["count"];
        const valsPuntiOrg = vals["punti"];
        const valsBandi = await computeDataBandi();

        lchart.draw(valsCount, valsBandi, annoStart, annoEnd, countYLabel);

        window.addEventListener("resize", () => {onWindowResize(lchart);});
    }


    function onWindowResize(chart=lineChart) {
        //console.log("resizing");
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
        const valsBandi = await computeDataBandi();
        if (showingCount) {
            lineChart.update(valsCount, valsBandi, annoStart, annoEnd, countYLabel);
        }
        else {
            lineChart.update(valsPuntiOrg, valsBandi, annoStart, annoEnd, puntiYLabel);
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


    async function computeDataBandi() {
        console.log("inizio compute data bandi");
        let startTime = performance.now();
        setLoadingData(true);

        var totalCount = {};

        // inizializzo la struttura dati
        for (const ateneo of selectedAteneo) {
            totalCount[ateneo] = {};
            // inizializzo per ogni ateneo la conta per ogni anno
            for (let anno = annoStart; anno <= annoEnd; anno++) {
                totalCount[ateneo][anno] = 0;
            }
        }

        // metto le selezioni in lowercase
        const selectedAteneoLowerCase = selectedAteneo.map((str) => str.toLowerCase());
        const selectedAreaLowerCase = selectedArea.map((str) => str.toLowerCase());
        

        // itero sulle righe del file
        for (const row of bandi) {

            // controlla se c'e' l'anno
            var rowOk = row[Values.FIELD_YEAR] != "";

            // visto che non ho info su SSD e facolta', se sono applicati quei filtri metti direttamente tutti i bandi a zero
            rowOk = rowOk && (selectedFacolta.length == Values.VALUES_FACOLTA.length) && (selectedSSD.length == Values.VALUES_SSD.length)

            // filtri: ateneo
            rowOk = rowOk && selectedAteneoLowerCase.includes(row[Values.FIELD_ATENEO].toLowerCase());

            // filtri: fascia
            const rowFascia = row[Values.FIELD_FASCIA]; 
            rowOk = rowOk && rowFascia != "" && selectedFascia.filter(fascia => Values.VALUES_FASCIA_BANDI[rowFascia].includes(fascia)).length > 0;

            // filtri: area
            rowOk = rowOk && (selectedArea.length == Values.VALUES_AREA.length || (row[Values.FIELD_AREA] != "" && selectedAreaLowerCase.includes(row[Values.FIELD_AREA].toLowerCase())));
                
            // filtri: SC
            rowOk = rowOk && (selectedSC.length == Values.VALUES_SC.length || (row[Values.FIELD_SC] != "" && selectedSC.includes(row[Values.FIELD_SC])));
                
            // se la riga rispetta i filtri allora aggiungo il conteggio all'ateneo corrispondente
            if (rowOk) {
                // controlla se l'anno e' nel range
                const anno = parseInt(row[Values.FIELD_YEAR]);
                if (anno >= annoStart && anno <= annoEnd) {
                    var numero_di_posti = 1;
                    if (row[Values.BANDI_FIELD_POSTI] != "") {
                        numero_di_posti = parseInt(row[Values.BANDI_FIELD_POSTI]);
                    }
                    totalCount[row[Values.FIELD_ATENEO]][anno] += numero_di_posti;
                }
            }
        }


        // Metti i dati nel formato giusto

        var totalCountNewFormat = [];
        var maxCount = 0;

        // ora totalCount e' del tipo: {"sapienza":{2000:100, 2001:124, ...}, "roma tre":{...}, ...}
        for (var ateneo in totalCount) {

            var maxCountAteneo = 0;
            var countPerAnno = [];

            for (let anno = annoStart; anno <= annoEnd; anno++) {
                maxCountAteneo = Math.max(totalCount[ateneo][anno], maxCountAteneo);
                countPerAnno.push(new ChartDataEntry(anno, totalCount[ateneo][anno]));
            }
            
            totalCountNewFormat.push(new ChartDataSingleAteneo(ateneo, countPerAnno, maxCountAteneo));
            maxCount = Math.max(maxCount, maxCountAteneo);
        }

        const count = new ChartDataAtenei(maxCount, totalCountNewFormat);

        setDataBandi(count);

        let endTime = performance.now();
        console.log("finito compute data bandi, durata: " + (endTime - startTime));
        console.log(count);
        
        setLoadingData(false);

        return count;
    }


    async function computeData() {

        console.log("inizio compute data");
        let startTime = performance.now();

        setLoadingData(true);

        // await new Promise(r => setTimeout(r, 2000)); // per testare se e' asincrona
    
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
            const selectedAreaLowerCase = selectedArea.map((str) => str.toLowerCase());

            // prendo il file di quell'anno
            const data = dataset[getAnnoDatasetIndex(anno)];


            // itero sulle righe del file
            for (const row of data) {
                // applico i filtri
                const rowOk = 
                    (selectedAteneo.length == Values.VALUES_ATENEO.length || selectedAteneoLowerCase.includes(row[Values.FIELD_ATENEO].toLowerCase())) &&
                    ( selectedFacolta.length == Values.VALUES_FACOLTA.length ||
                      (row[Values.FIELD_FACOLTA] != "" && selectedFacoltaLowerCase.includes(row[Values.FIELD_FACOLTA].toLowerCase())) ||
                      (row[Values.FIELD_STRUTTURA] != "" && selectedFacoltaLowerCase.includes(row[Values.FIELD_STRUTTURA].toLowerCase()))
                    ) &&
                    (selectedFascia.length == Values.VALUES_FASCIA.length || (row[Values.FIELD_FASCIA] != "" && selectedFascia.includes(row[Values.FIELD_FASCIA]))) &&
                    (selectedArea.length == Values.VALUES_AREA.length || (row[Values.FIELD_AREA] != "" && selectedAreaLowerCase.includes(row[Values.FIELD_AREA].toLowerCase()))) &&
                    (selectedSC.length == Values.VALUES_SC.length || (row[Values.FIELD_SC] != "" && selectedSC.includes(row[Values.FIELD_SC]))) &&
                    (selectedSSD.length == Values.VALUES_SSD.length || (row[Values.FIELD_SSD] != "" && selectedSSD.includes(row[Values.FIELD_SSD])));

                // se la riga rispetta i filtri allora aggiungo il conteggio all'ateneo corrispondente
                if (rowOk) {
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
        console.log("finito compute data, durata: " + (endTime - startTime));
        
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
                    <button id="update-chart-button" onClick={updateLineChart} disabled={!updateButtonEnabled}>{!loadingData ? "Update" : "Loading"}</button>
                </div>
            </div>
            {/* Parte centrale con grafico/tabella e legenda */}
            <div className='central-section'>
                {/* Grafico */}
                <div style={{display: showingGraph ? 'block' : 'none'}}>
                    <svg className="chart" ref={refSVG}>
                        {/* Gruppo dove metto le linee dei bandi, cosi' scelgo se mostrarle o nasconderle */}
                        {/*<g className="chart-dashed-group" ref={refSVGDashedLines} style={{visbility: showingBandi ? 'visible' : 'hidden'}}/>*/}
                        <g className="chart-dashed-group" ref={refSVGDashedLines} style={{visibility: showingBandi ? 'visible' : 'hidden'}}/>
                    </svg>
                    {/* Tooltip */}
                    <div id="toolTipDiv1" className='tooltip' ref={refTooltip}>
                        <div id="toolTipDiv-title1" className='tooltip-title'></div>
                        <hr id="toolTipDiv-line1" className='tooltip-line'/>
                        <div id="toolTipDiv-content1" className='tooltip-content'></div>
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
                {/* Tabelle */}
                <div style={{display: !showingGraph ? 'block' : 'none'}} className="table-data-container">
                    {/* Tabella prof/punti */}
                    <TableData data={showingCount? dataCount : dataPuntiOrg} title={showingCount? countYLabel : puntiYLabel}/>
                    {/* Tabella bandi */}
                    <div style={{display: showingBandi ? 'block' : 'none' }}>
                        <TableData data={dataBandi} title={"Bandi"}/>
                    </div>
                </div>
            </div>
            {/* Opzioni di visualizzazione */}
            <div className='visualization-container'>
                <div className='section-title'>Visualizzazione</div>
                <div className="visualization-controls">
                    {/* Scelta asse y (conteggio professori / punti organico) */}
                    <div className="visualization-selection-conta-punti">
                        <div>
                            <input type="radio" name="visualization-selection-conta-punti" id="vis-sel-conta" onClick={showCount} checked={showingCount}/>
                            <label htmlFor="vis-sel-conta">Quantità professori</label>
                        </div>
                        <div>
                            <input type="radio" name="visualization-selection-conta-punti" id="vis-sel-punti" onClick={showPunti} checked={!showingCount}/>
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
                    <div className="visualization-controls-separator"/>
                    {/* Toggle bandi */}
                    <div>
                        <ToggleSwitch label={"Mostra bandi"} checked={showingBandi} onChange={() => {setShowingBandi(!showingBandi);}}/>
                        <div className="legenda-linee-bandi">
                            <div className='legenda-bandi-riga'>
                                <div className='legenda-bandi-quadrato colore-pieno'/>{showingCount? countYLabel : puntiYLabel}
                            </div>
                            <div className='legenda-bandi-riga'>
                                <div className='legenda-bandi-quadrato colore-trattini'/>Bandi
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
