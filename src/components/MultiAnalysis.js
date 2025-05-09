import {React, useEffect, useState, useRef} from 'react';

import * as d3 from "d3";

import DualRangeSlider from './menu/DualRangeSlider';
import DropDownCheckbox from './menu/DropDownCheckbox';
import Values from "../DB/Values";

import '../App.css';

export default function MultiAnalysis({dataset}) {

    const ref = useRef();

    // Range di anni
    const [annoStart, setAnnoStart] = useState(Values.YEAR_START);
    const [annoEnd, setAnnoEnd] = useState(Values.YEAR_END);

    // Opzioni selezionate
    const [selectedAteneo, setSelectedAteneo] = useState(['ROMA "La Sapienza"','BOLOGNA', 'ROMA "Tor Vergata"']);
    //var selectedFacolta = ['Farmacia e Medicina', 'Ingegneria'];
    var selectedFacolta = Values.VALUES_FACOLTA;
    var selectedSC = Values.VALUES_SC;
    var selectedSSD = Values.VALUES_SSD;
    var selectedFascia = ['Ordinario'];
    

    // CHART
    const [xScale, setXScale] = useState(null);
    const [yScale, setYScale] = useState(null);
    const [xAxis, setXAxis] = useState(null);
    const [yAxis, setYAxis] = useState(null);


    useEffect(() => {
        LineChart();
    },[]);


    function updateYears(annoS, annoE) {
        setAnnoStart(annoS);
        setAnnoEnd(annoE);
        console.log(annoS);
        
        // Aggiorna grafico
        //updateChartData(computeData());
    }

    function getAnnoDatasetIndex(anno) {
        return anno-Values.YEAR_START;
    }

    function countAmount() {
        // vedi quanti professori ci sono nel 2000 per gli atenei della lista
        let count = dataset[0].filter(row => filterRow(row)).length;
        console.log("conta dentro multianalysis: " + count)
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
    

    function updateChartData(vals) {

        const maxCount = vals.max;
        const data = vals.data;

        // Prendi elemento svg
        const svg = d3.select(ref.current);

        // Create the X axis:
        xScale.domain([annoStart, annoEnd]);
        svg.selectAll("#x-axis").transition()
            .duration(3000)
            .call(xAxis);

        // create the Y axis
        yScale.domain([0, 1.1*maxCount]);
        svg.selectAll("#y-axis")
            .transition()
            .duration(3000)
            .call(yAxis);


        //line generator
        const myLine = d3.line()
          .x((d, i) => xScale(d.anno))
          .y((d) => yScale(d.conta));
          //.curve(d3.curveCardinal);

        // Create a update selection: bind to the new data
        var u = svg.selectAll(".lineTest")
            .data([data], function(d){ return d.anno });

        // Updata the line
        u
            .enter()
            .append("path")
            .attr("class","lineTest")
            .merge(u)
            .transition()
            .duration(3000)
            .attr("d", myLine)
            .attr("fill", "none")
            .attr("stroke", "steelblue")
            .attr("stroke-width", 2.5)

    }


    function computeData() {
        // Per tenere traccia del valore Y massimo
        var maxCount = 0;

        // Conta per il primo ateneo quanti professori ci sono per ogni anno
        var ateneo = selectedAteneo[0];
        var countPerAnno = [];
        for (let anno = annoStart; anno <= annoEnd; anno++) {
            const data = dataset[getAnnoDatasetIndex(anno)];
            const count = data.filter(row => filterRowWithAteneo(row, ateneo)).length;
            if (count > maxCount) {
                maxCount = count;
            }
            countPerAnno.push({
                    'anno': anno,
                    'conta': count
                }
            );
        }
        console.log("ateneo: " + ateneo + ", conta per anno:");
        console.log(countPerAnno);

        return {"data": countPerAnno, "max": maxCount};
    }


    function LineChart() {

        const vals = computeData();


        const maxCount = vals.max;
        const countPerAnno = vals.data;


        var margin = {top: 10, right: 0, bottom: 30, left: 40};
        var width = 0.8*window.innerWidth - margin.left - margin.right;
        var height = 500 - margin.top - margin.bottom;


        // Prendi elemento svg
        const svg = d3.select(ref.current);
        svg.attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .attr("id", "line-chart");             // assegno un id per i css
            //.attr("transform", `translate(${margin.left},${margin.top})`);
        


        //scales
        const xScaleTemp = d3.scaleLinear().range([margin.left, width - margin.right]);
        setXScale(xScaleTemp);
        const yScaleTemp = d3.scaleLinear().range([height-margin.top, margin.bottom]);
        setYScale(yScaleTemp);
    
        //axes
        const xAxisTemp = d3.axisBottom(xScaleTemp).ticks(countPerAnno.length);
        setXAxis(xAxisTemp);
        svg.append("g")
            .attr("transform", `translate(0,${height})`)
            .attr("id", "x-axis")             // assegno un id per i css
            .call(xAxisTemp);


        //const yAxis = d3.axisLeft(yScale).ticks(0, maxCount, 10);
        const yAxisTemp = d3.axisLeft(yScaleTemp).ticks(10);
        setYAxis(yAxisTemp);
        svg.append("g")
            .attr("transform", `translate(${margin.left},0)`)
            .attr("id", "y-axis")             // assegno un id per i css
            .call(yAxisTemp);


        updateChartData(vals);
    }


    function LineChart2() {

        // Per tenere traccia del valore Y massimo
        var maxCount = 0;

        // Conta per il primo ateneo quanti professori ci sono per ogni anno
        var ateneo = selectedAteneo[0];
        var countPerAnno = [];
        for (let anno = annoStart; anno <= annoEnd; anno++) {
            const data = dataset[getAnnoDatasetIndex(anno)];
            const count = data.filter(row => filterRowWithAteneo(row, ateneo)).length;
            if (count > maxCount) {
                maxCount = count;
            }
            countPerAnno.push({
                    'anno': anno,
                    'conta': count
                }
            );
        }
        console.log("ateneo: " + ateneo + ", conta per anno:");
        console.log(countPerAnno);


        var margin = {top: 10, right: 0, bottom: 30, left: 40};
        //var width = 1000 - margin.left - margin.right;
        var width = 0.8*window.innerWidth - margin.left - margin.right;
        var height = 500 - margin.top - margin.bottom;


        // Prendi elemento svg
        const svg = d3.select(ref.current);
        svg.attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .attr("id", "line-chart");             // assegno un id per i css
            //.attr("transform", `translate(${margin.left},${margin.top})`);
              

        //scales
        const xScale = d3.scaleLinear()
            .domain([annoStart, annoEnd])
            .range([margin.left, width - margin.right]);
    
        const yScale = d3.scaleLinear().domain([0, 1.1*maxCount]).range([height-margin.top, margin.bottom]);
    
        //axes
        setXAxis(d3.axisBottom(xScale).ticks(countPerAnno.length)); //.tickSize(-height);
        //svg.select(".x-axis").style("transform", `translateY(${height} px)`).call(xAxis);
        svg.append("g")
            .attr("transform", `translate(0,${height})`)
            .attr("id", "x-axis")             // assegno un id per i css
            .call(xAxis);


        //const yAxis = d3.axisLeft(yScale).ticks(0, maxCount, 10);
        setYAxis(d3.axisLeft(yScale).ticks(10));
        svg.append("g")
            .attr("transform", `translate(${margin.left},0)`)
            .attr("id", "y-axis")             // assegno un id per i css
            .call(yAxis);


        //line generator
        const myLine = d3.line()
          .x((d, i) => xScale(d.anno))
          .y((d) => yScale(d.conta));
          //.curve(d3.curveCardinal);
        
        //drawing the line
        svg
          .selectAll(".line")
          .data([countPerAnno])
          .join("path")
          .attr("class", "line")
          .attr("d", myLine);
    }

 


    return (
        <div>
            multi analysis
            {/* Selezione campi */}
            <div className="flex-row">
                <DualRangeSlider rangeStart={Values.YEAR_START} rangeEnd={Values.YEAR_END} updateYears={updateYears}/>
                <DropDownCheckbox title={"Atenei"} options={Values.VALUES_ATENEO} />
                <DropDownCheckbox title={"Facoltà"} options={Values.VALUES_FACOLTA} />
                <DropDownCheckbox title={"SC"} options={Values.VALUES_SC} />
                <DropDownCheckbox title={"SSD"} options={Values.VALUES_SSD} />
                <button onClick={() => {updateChartData(computeData());}}>update chart</button>
            </div>
            {/* Grafici */}
            <svg className="chart" ref={ref} />
        </div>
    )
}
