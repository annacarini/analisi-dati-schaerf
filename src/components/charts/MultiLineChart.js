import * as d3 from "d3";

import ColorUtilities from "../../utils/ColorUtilities";
import Colors from "../../utils/Colors";

import "./Charts.css";

export default class MultiLineChart {

    animationDuration = 2000;


    constructor(svg, margin, width, height) {
        this.svg = svg;
        this.margin = margin;
        this.width = width;
        this.height = height;

        d3.selectAll(".tooltip").remove();
        const toolTipDiv = d3.select('body').append('div')
            .attr("id", "toolTipDiv")   
            .attr('class', 'tooltip')               
            .style('opacity', 0)
            .style('position', "absolute");

        toolTipDiv.append("div")
            .attr("id", "toolTipDiv-title");

        toolTipDiv.append("hr")
            .attr("id", "toolTipDiv-line");
        
        toolTipDiv.append("div")
            .attr("id", "toolTipDiv-content");

        const closeTooltipFunc = this.closeTooltip;
        svg.on('mouseover', function(event, d) { closeTooltipFunc(toolTipDiv); })
    }




    draw(vals, xStart, xEnd) {

        /*
        // vals e' cosi':
        vals = {
            max: max, 
            data: [
             {
                ateneo: ateneo,
                data: [
                  {
                    anno: anno,
                    conta: conta
                  }, ...
                ],
                max: max
             }, ...
            ]
        }

        quindi se prendo vals.data[0].data ho countPerAnno, se prendo vals.data[0].max ho maxCount

        */


        const countPerAteneo = vals.data;
        const countPerAnno = vals.data[0].data;


        // Prendi elemento svg
        this.svg.attr("width",this.width + this.margin.left + this.margin.right)
            .attr("height", this.height + this.margin.top + this.margin.bottom)
            .attr("id", "line-chart");             // assegno un id per i css


        //scales
        const xScale = d3.scaleLinear().range([this.margin.left, this.width - this.margin.right]);
        const yScale = d3.scaleLinear().range([this.height - this.margin.top, this.margin.bottom]);
    
        //axes
        d3.select("#x-axis").remove();
        const xAxis = d3.axisBottom(xScale).ticks(countPerAnno.length);
        this.svg.append("g")
            .attr("transform", `translate(0,${this.height})`)
            .attr("id", "x-axis")             // assegno un id per i css
            .call(xAxis);

        d3.select("#y-axis").remove();
        const yAxis = d3.axisLeft(yScale).ticks(10);
        this.svg.append("g")
            .attr("transform", `translate(${this.margin.left},0)`)
            .attr("id", "y-axis")             // assegno un id per i css
            .call(yAxis);
        

        // Grid
        const yGrid = d3.axisLeft()
            .scale(yScale)
            .tickFormat('')
            .ticks(10)
            .tickSizeInner(-this.width + this.margin.left + this.margin.right);

        this.svg.append('g')
            .attr('class', 'y-grid')
            .attr('transform', `translate(${this.margin.left}, 0)`)
            .call(yGrid).call(g => g.select(".domain").remove());



        this.update(vals, xStart, xEnd, false);
    }


    
    update(vals, xStart, xEnd, withAnimation=false) {

        const maxCount = vals.max;
        const data = vals.data;

        //scales
        const xScale = d3.scaleLinear().range([this.margin.left, this.width - this.margin.right]);
        const yScale = d3.scaleLinear().range([this.height - this.margin.top, this.margin.bottom]);

        // axes
        const xAxis = d3.axisBottom(xScale)
            .ticks(data[0].data.length)
            .tickFormat(function (d) {
                return d;
            });
        const yAxis = d3.axisLeft(yScale).ticks(10);


        /*
        if (withAnimation) {
            // Update the X axis:
            xScale.domain([xStart, xEnd]);
            this.svg.selectAll("#x-axis").transition()
                .duration(this.animationDuration)
                .call(xAxis);

            // Update the Y axis
            yScale.domain([0, 1.1*maxCount]);
            this.svg.selectAll("#y-axis")
                .transition()
                .duration(this.animationDuration)
                .call(yAxis);
        }*/


        // Update the X axis:
        xScale.domain([xStart, xEnd]);
        this.svg.selectAll("#x-axis").call(xAxis);

        // Update the Y axis
        yScale.domain([0, 1.1*maxCount]);
        this.svg.selectAll("#y-axis").call(yAxis);

        // aggiorna grid
        const yGrid = d3.axisLeft()
            .scale(yScale)
            .tickFormat('')
            .ticks(10)
            .tickSizeInner(-this.width + this.margin.left + this.margin.right);
        this.svg.selectAll(".y-grid").call(yGrid).call(g => g.select(".domain").remove());
        
        
        //line generator
        const myLine = d3.line()
            .x((d, i) => xScale(d.anno))
            .y((d) => yScale(d.conta));
        


        // Create a update selection: bind to the new data
        this.svg.selectAll(".lineTest").remove();

        // rimuovi i cerchi precedenti (senza "data" non funziona)
        this.svg.selectAll(".myCircles").remove();




        for (let i = 0; i < data.length; i++) {
            this.drawLine(data[i].ateneo, i, data[i].data, myLine, xScale, yScale, data[i].color);
        }
    }


    /*
    drawLineWithAnimation(ateneo, index, data, lineGenerator, xScale, yScale, withAnimation, color="steelblue") {

        console.log("drawing line for ateneo " + ateneo);


        // Create a update selection: bind to the new data
        var u = this.svg.selectAll(".lineTest-" + index).data([data], function(d){ return d.anno });

        // rimuovi i cerchi precedenti (senza "data" non funziona)
        this.svg.selectAll(".myCircles-" + index).data(data).exit().remove();

        var c = this.svg.selectAll(".myCircles-" + index); //.append("g");  // append g non funziona, da rivedere


        var toolTipDiv = d3.select('#toolTipDiv');


        if (withAnimation) {
            u
                .enter()                // dynamically creates placeholder references corresponding to the number of data values
                .append("path")         // The output of enter() can be fed to append() method and append() will create DOM elements for which there are no corresponding DOM elements on the page
                    .attr("class","lineTest lineTest-" + index)
                    .merge(u)
                    .transition()
                    .duration(this.animationDuration)
                    .attr("d", lineGenerator)
                    .attr("fill", "none")
                    .attr("stroke", color)
                    .attr("stroke-width", 2.5);


            c   .data(data)
                .enter()
                .append("circle")
                    .attr("class","myCircles myCircles-" + index)
                    .merge(c)
                    .attr("fill", color)
                    .style("stroke","transparent")
                    .style("stroke-width","10px")
                    .transition()
                    .duration(this.animationDuration)
                    .attr("cx", function(d) { return xScale(d.anno) })
                    .attr("cy", function(d) { return yScale(d.conta) })
                    .attr("r", 3);
        }

        else {
            u
                .enter()
                .append("path")
                    .attr("class","lineTest lineTest-" + index)
                    .merge(u)
                    .attr("d", lineGenerator)
                    .attr("fill", "none")
                    .attr("stroke", color)
                    .attr("stroke-width", 2.5);

            c   .data(data)
                .enter()
                .append("circle")
                    .attr("class","myCircles myCircles-" + index)
                    .merge(c)
                    .attr("fill", color)
                    .style("stroke","transparent")
                    .style("stroke-width","10px")
                    .attr("cx", function(d) { return xScale(d.anno) })
                    .attr("cy", function(d) { return yScale(d.conta) })
                    .attr("r", 3);
        }
    
        // me li devo salvare qua perche' sotto perde il riferimento a "this"
        const closeTooltipFunc = this.closeTooltip;
        const openTooltipFunc = this.openTooltip;
        const openTooltipNoDataFunc = this.openTooltipNoData;

        // Tooltip on mouseover
        c
            .attr("z-index", "3")
            //.on("mouseleave", function(event, d) { closeTooltipFunc(toolTipDiv); })
            .on("mouseout", function(event, d) { closeTooltipFunc(toolTipDiv); })
            .on('mouseover', function(event, d) { openTooltipFunc(toolTipDiv, ateneo, color, event, d); })
            //.on('mouseenter', function(event, d) { openTooltipFunc(toolTipDiv, event, d); });

        u
            .on("mouseout", function(event, d) { closeTooltipFunc(toolTipDiv); })
            .on('mouseover', function(event, d) { openTooltipNoDataFunc(toolTipDiv, ateneo, color, event); })
    }
    */


    drawLine(ateneo, index, data, lineGenerator, xScale, yScale, color="steelblue") {

        console.log("drawing line for ateneo " + ateneo);


        var toolTipDiv = d3.select('#toolTipDiv');
        // me li devo salvare qua perche' sotto perde il riferimento a "this"
        const closeTooltipFunc = this.closeTooltip;
        const openTooltipFunc = this.openTooltip;
        const openTooltipNoDataFunc = this.openTooltipNoData;

        // Create a update selection: bind to the new data
        var u = this.svg.selectAll(".lineTest-" + index).data([data], function(d){ return d.anno });
        var group = this.svg.append("g");  

        u.enter()
            .append("path")
            .attr("class","lineTest lineTest-" + index)
            .merge(u)
            .attr("d", lineGenerator)
            .attr("fill", "none")
            .attr("stroke", color)
            .attr("stroke-width", 2.5)
            .on("mouseout", function(event, d) { closeTooltipFunc(toolTipDiv); })
            .on('mouseover', function(event, d) { openTooltipNoDataFunc(toolTipDiv, ateneo, color, event); });
                
        group
            .attr("class","myCircles")
            .selectAll(".myCircles-" + index)
            .data(data)
            .enter()
            .append("circle")
            .attr("class","myCircles-" + index)
            .attr("fill", color)
            .style("stroke","transparent")
            .style("stroke-width","10px")
            .attr("cx", function(d) { return xScale(d.anno) })
            .attr("cy", function(d) { return yScale(d.conta) })
            .attr("r", 3)
            .on("mouseout", function(event, d) { closeTooltipFunc(toolTipDiv); })
            .on('mouseover', function(event, d) { openTooltipFunc(toolTipDiv, ateneo, color, event, d); });
    }


    
    openTooltip(tooltip, ateneo, color, event, d) {
        //console.log(d); 
        tooltip
            .style('left', (event.pageX) + 'px')     
            .style('top', (event.pageY - 28) + 'px');

        d3.select("#toolTipDiv-title").html(ateneo);
        d3.select("#toolTipDiv-line").style("background-color", color);
        d3.select("#toolTipDiv-content").html('<div>Anno: ' + d.anno + '</div><div>Tot: ' + d.conta + '</div>');

        tooltip.transition()        
            .duration(200)      
            .style('opacity', 1);     
    }
        
    openTooltipNoData(tooltip, ateneo, color, event) {
        //console.log(d); 
        tooltip
            .style('left', (event.pageX) + 'px')     
            .style('top', (event.pageY - 28) + 'px');

        d3.select("#toolTipDiv-title").html(ateneo);
        d3.select("#toolTipDiv-line").style("background-color", color);
        d3.select("#toolTipDiv-content").html('');

        tooltip.transition()        
            .duration(200)      
            .style('opacity', 1);     
    }

    closeTooltip(tooltip) {
        //console.log("closing tooltip");
        tooltip.style('opacity', 0);
    }
    

}