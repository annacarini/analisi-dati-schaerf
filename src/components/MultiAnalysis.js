import {React, useEffect, useState, useRef} from 'react';

import * as d3 from "d3";

import Values from "../DB/Values";

import '../App.css';

export default function MultiAnalysis({dataset}) {

    const ref = useRef();

    var annoStart = 2000;
    var annoEnd = 2024;


    //var selectedAteneo = ['BOLOGNA', 'ROMA "Tor Vergata"'];
    var selectedAteneo = ['ROMA "La Sapienza"'];
    var selectedFacolta = ['Farmacia e Medicina', 'Ingegneria'];
    var selectedSC = Values.VALUES_SC;
    var selectedSSD = Values.VALUES_SSD;
    var selectedFascia = ['Ordinario'];
    
    useEffect(() => {
        LineChart();
        //countAmount();
    },[]);


    function getAnnoDatasetIndex(anno) {
        return anno-2000;
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
            (row[Values.FIELD_ATENEO] == ateneo) &&
            (selectedFacolta == Values.VALUES_FACOLTA || selectedFacolta.includes(row[Values.FIELD_FACOLTA])) &&
            (selectedFascia == Values.VALUES_FASCIA || selectedFascia.includes(row[Values.FIELD_FASCIA])) &&
            (selectedSC == Values.VALUES_SC || selectedSC.includes(row[Values.FIELD_SC])) &&
            (selectedSSD == Values.VALUES_SSD || selectedSSD.includes(row[Values.FIELD_SSD]))
        );
    }
    

    const LineChart = () => {

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


        var margin = {top: 10, right: 0, bottom: 30, left: 30};
        //var width = 1000 - margin.left - margin.right;
        var width = window.innerWidth - margin.left - margin.right;
        var height = 500 - margin.top - margin.bottom;


        // Prendi elemento svg
        const svg = d3.select(ref.current);
        svg.attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .attr("id", "line-chart")             // assegno un id per i css
            .attr("transform", `translate(${margin.left},${margin.top})`);
              

        //scales
        const xScale = d3.scaleLinear()
            .domain([annoStart, annoEnd])
            .range([margin.left, width - margin.right]);
    
        const yScale = d3.scaleLinear().domain([0, 1.1*maxCount]).range([height-margin.top, margin.bottom]);
    
        //axes
        const xAxis = d3.axisBottom(xScale).ticks(countPerAnno.length); //.tickSize(-height);
        //svg.select(".x-axis").style("transform", `translateY(${height} px)`).call(xAxis);
        svg.append("g")
            .attr("transform", `translate(0,${height})`)
            .attr("id", "x-axis")             // assegno un id per i css
            .call(xAxis);


        //const yAxis = d3.axisLeft(yScale).ticks(0, maxCount, 10);
        const yAxis = d3.axisLeft(yScale).ticks(10);
        svg.append("g")
            //.attr("transform", `translate(80,0)`)
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
            <div>
                <input type="text"/>
            </div>
            {/* Grafici */}
            <svg className="chart" ref={ref} />
        </div>
    )
}
