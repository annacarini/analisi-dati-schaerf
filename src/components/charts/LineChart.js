import * as d3 from "d3";

import "./Charts.css";

export default class LineChart {

    animationDuration = 2000;


    constructor(svg, margin, width, height, color="steelblue") {
        this.svg = svg;
        this.margin = margin;
        this.width = width;
        this.height = height;
        this.color = color;

        d3.selectAll(".tooltip").remove();
        d3.select('body').append('div')
            .attr("id", "toolTipDiv")   
            .attr('class', 'tooltip')               
            .style('opacity', 0)
            .style('position', "absolute");
    }




    draw(vals, xStart, xEnd) {
        const countPerAnno = vals.data;

        // Prendi elemento svg
        this.svg.attr("width",this. width + this.margin.left + this.margin.right)
            .attr("height", this.height + this.margin.top + this.margin.bottom)
            .attr("id", "line-chart");             // assegno un id per i css
            //.attr("transform", `translate(${margin.left},${margin.top})`);
        

        //scales
        const xScale = d3.scaleLinear().range([this.margin.left, this.width - this.margin.right]);
        const yScale = d3.scaleLinear().range([this.height - this.margin.top, this.margin.bottom]);
    
        //axes
        const xAxis = d3.axisBottom(xScale).ticks(countPerAnno.length);
        this.svg.append("g")
            .attr("transform", `translate(0,${this.height})`)
            .attr("id", "x-axis")             // assegno un id per i css
            .call(xAxis);

        const yAxis = d3.axisLeft(yScale).ticks(10);
        this.svg.append("g")
            .attr("transform", `translate(${this.margin.left},0)`)
            .attr("id", "y-axis")             // assegno un id per i css
            .call(yAxis);
        



        this.update(vals, xStart, xEnd, false);
    }

    /*
    createsGrid(data) {
       var grid = gridLine.selectAll("line.horizontalGrid").data(scaleY.ticks());

       grid.enter()
       .append("line")
       .attr("class","horizontalGrid");

       grid.exit().remove();

       grid.attr({
               "x1":0,
               "x2": width,
               "y1": function (d) { return scaleY(d); },
               "y2": function (d) { return scaleY(d); }
                });
    }
    */

    
    update(vals, xStart, xEnd, withAnimation=true) {

        const maxCount = vals.max;
        const data = vals.data;

        //scales
        const xScale = d3.scaleLinear().range([this.margin.left, this.width - this.margin.right]);
        const yScale = d3.scaleLinear().range([this.height - this.margin.top, this.margin.bottom]);

        // axes
        const xAxis = d3.axisBottom(xScale)
            .ticks(data.length)
            .tickFormat(function (d) {
                return d;
            });
        const yAxis = d3.axisLeft(yScale).ticks(10);



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
        }
        else {
            // Update the X axis:
            xScale.domain([xStart, xEnd]);
            this.svg.selectAll("#x-axis").call(xAxis);

            // Update the Y axis
            yScale.domain([0, 1.1*maxCount]);
            this.svg.selectAll("#y-axis").call(yAxis);
        }



        /*
        var grid = this.svg.selectAll("line.horizontalGrid")
            .data(yScale.ticks())
            .enter()
            .append("line")
            .attr("class","horizontalGrid")
            .attr({
                "x1":0,
                "x2": this.width,
                "y1": function (d) { return yScale(d); },
                "y2": function (d) { return yScale(d); }
                    });

        
        grid.exit().remove();

        grid.attr({
                "x1":0,
                "x2": this.width,
                "y1": function (d) { return yScale(d); },
                "y2": function (d) { return yScale(d); }
                    });
        */




        //line generator
        const myLine = d3.line()
            .x((d, i) => xScale(d.anno))
            .y((d) => yScale(d.conta));
            //.curve(d3.curveCardinal);


        // Create a update selection: bind to the new data
        var u = this.svg.selectAll(".lineTest").data([data], function(d){ return d.anno });

        // rimuovi i cerchi precedenti (senza "data" non funziona)
        this.svg.selectAll(".myCircles").data(data).exit().remove();

        var c = this.svg.selectAll(".myCircles");


        var toolTipDiv = d3.select('#toolTipDiv');


        if (withAnimation) {
            u
                .enter()                // dynamically creates placeholder references corresponding to the number of data values
                .append("path")         // The output of enter() can be fed to append() method and append() will create DOM elements for which there are no corresponding DOM elements on the page
                    .attr("class","lineTest")
                    .merge(u)
                    .transition()
                    .duration(this.animationDuration)
                    .attr("d", myLine)
                    .attr("fill", "none")
                    .attr("stroke", this.color)
                    .attr("stroke-width", 2.5);


            c   .data(data)
                .enter()
                .append("circle")
                    .attr("class","myCircles")
                    .attr("fill", this.color)
                    .style("stroke","transparent")
                    .style("stroke-width","15px")
                    .merge(c)
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
                    .attr("class","lineTest")
                    .merge(u)
                    .attr("d", myLine)
                    .attr("fill", "none")
                    .attr("stroke", "steelblue")
                    .attr("stroke-width", 2.5);

            c   .data(data)
                .enter()
                .append("circle")
                    .attr("class","myCircles")
                    .attr("fill", this.color)
                    .style("stroke","transparent")
                    .style("stroke-width","15px")
                    .attr("cx", function(d) { return xScale(d.anno) })
                    .attr("cy", function(d) { return yScale(d.conta) })
                    .attr("r", 3);
        }


        // me li devo salvare qua perche' sotto perde il riferimento a "this"
        const closeTooltipFunc = this.closeTooltip;
        const openTooltipFunc = this.openTooltip;

        // Tooltip on mouseover
        c
            //.on("mouseleave", function(event, d) { closeTooltipFunc(toolTipDiv); })
            .on("mouseout", function(event, d) { closeTooltipFunc(toolTipDiv); })
            //.on('mouseover', function(event, d) { openTooltipFunc(toolTipDiv, event, d); })
            .on('mouseenter', function(event, d) { openTooltipFunc(toolTipDiv, event, d); });

    }


    
    openTooltip(tooltip, event, d) {
        //console.log(d); 
        tooltip.html('<div>Anno: ' + d.anno + '</div><div>Tot: ' + d.conta + '</div>')  
            .style('left', (event.pageX) + 'px')     
            .style('top', (event.pageY - 28) + 'px');
        tooltip.transition()        
            .duration(200)      
            .style('opacity', 1);     
    }

    closeTooltip(tooltip) {
        //console.log("closing tooltip");
        tooltip.style('opacity', 0);
    }
    

}