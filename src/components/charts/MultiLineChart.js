import * as d3 from "d3";

import ColorUtilities from "../../utils/ColorUtilities";

import "./Charts.css";

export default class MultiLineChart {

    animationDuration = 2000;


    constructor(svg, dashedGroup, tooltip, margin, width, height, index) {
        this.svg = svg;
        this.dashedGroup = dashedGroup;
        this.margin = margin;
        this.width = width;
        this.height = height;
        this.index = index;

        this.data = [];
        this.dashedData = [];
        this.xStart = 0;
        this.xEnd = 0;
        this.yLabel = "";
        this.xLabel = "";
        this.withAnimation = false;

        this.tooltip = tooltip;

        svg.on('mouseover', this.closeTooltip.bind(this))
    }


    updateSize(margin, width, height) {
        this.margin = margin;
        this.width = width;
        this.height = height;

        // cambia misure svg
        this.svg.attr("width",this.width + this.margin.left + this.margin.right)
            .attr("height", this.height + this.margin.top + this.margin.bottom);

        // aggiorna posiz asse x     
        this.svg.select(`#x-axis${this.index}`).attr("transform", `translate(0,${this.height})`);

        // aggiorna grafico
        this.update(this.data, this.dashedData, this.xStart, this.xEnd, this.yLabel, this.xLabel, this.withAnimation);
    }


    draw(vals, dashedVals, xStart, xEnd, yLabel, xLabel="Anno") {

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
                max: max,
                color: color
             }, ...
            ]
        }

        quindi se prendo vals.data[0].data ho countPerAnno, se prendo vals.data[0].max ho maxCount

        */

        this.data = vals;
        this.dashedData = dashedVals;
        this.xStart = xStart;
        this.xEnd = xEnd;
        this.yLabel = yLabel;
        this.xLabel = xLabel;

        const countPerAteneo = vals.data;
        const countPerAnno = vals.data[0].data;


        // Prendi elemento svg
        this.svg.attr("width",this.width + this.margin.left + this.margin.right)
            .attr("height", this.height + this.margin.top + this.margin.bottom)
            .attr("id", `line-chart${this.index}`)             // assegno un id per i css
            .classed("line-chart", true);


        //scales
        const xScale = d3.scaleLinear().range([this.margin.left, this.width - this.margin.right]);
        const yScale = d3.scaleLinear().range([this.height - this.margin.top, this.margin.bottom]);

        //axes
        d3.select(`#x-axis${this.index}`).remove();
        const xAxis = d3.axisBottom(xScale).ticks(countPerAnno.length);
        this.svg.append("g")
            .attr("transform", `translate(0,${this.height})`)
            .attr("id", `x-axis${this.index}`)             // assegno un id per i css
            .classed("x-axis", true)
            .call(xAxis);

        d3.select(`#y-axis${this.index}`).remove();
        const yAxis = d3.axisLeft(yScale).ticks(10);
        this.svg.append("g")
            .attr("transform", `translate(${this.margin.left},0)`)
            .attr("id", `y-axis${this.index}`)             // assegno un id per i css
            .classed("y-axis", true)
            .call(yAxis);
        

        this.xScale = xScale;
        this.yScale = yScale;

        this.update(vals, dashedVals, xStart, xEnd, yLabel, xLabel, false);
    }


    // per quando switchi visualizzazione
    updateYValues(vals, yLabel) {
        this.update(vals, this.dashedData, this.xStart, this.xEnd, yLabel, "Anno", false);
    }
    
    update(vals, dashedVals, xStart, xEnd, yLabel, xLabel="Anno", withAnimation=false) {

        this.data = vals;
        this.dashedData = dashedVals;
        this.xStart = xStart;
        this.xEnd = xEnd;
        this.yLabel = yLabel;
        this.xLabel = xLabel;
        this.withAnimation = withAnimation;

        const maxCount = Math.max(vals.max, dashedVals.max);
        const data = vals.data;
        const dashedData = dashedVals.data;

        if (data.length < 1) return;

        //scales
        const xScale = d3.scaleLinear().range([this.margin.left, this.width - this.margin.right]);
        const yScale = d3.scaleLinear().range([this.height - this.margin.top, this.margin.bottom]);

        // axes
        const xAxis = d3.axisBottom(xScale)
            .ticks(data[0].data.length)
            .tickFormat(function (d) {
                return d;
            });
        const yAxis = d3.axisLeft(yScale)
            .ticks(10)
            .tickFormat(function (d) {
                return d;
            });


        // Update the X axis:
        xScale.domain([xStart, xEnd]);
        this.svg.select(`#x-axis${this.index}`).call(xAxis);

        // Update the Y axis
        yScale.domain([0, 1.1*maxCount]);
        this.svg.select(`#y-axis${this.index}`).call(yAxis);
        
        // Grid
        this.svg.select(`#y-grid${this.index}`).remove();
        const yGrid = d3.axisLeft()
            .scale(yScale)
            .tickFormat('')
            .ticks(10)
            .tickSizeInner(-this.width + this.margin.left + this.margin.right);
        this.svg.append('g')
            .attr('id', `y-grid${this.index}`)
            .classed("y-grid", true)
            .attr('transform', `translate(${this.margin.left}, 0)`)
            .call(yGrid).call(g => g.select(".domain").remove());

        
        // rimuovi label
        this.svg.select(`#x-axis-label${this.index}`).remove();
        this.svg.select(`#y-axis-label${this.index}`).remove();


        // Add X axis label:
        this.svg.append("text")
            .attr("text-anchor", "end")
            .attr("id", `x-axis-label${this.index}`)
            .classed("axis-label x-axis-label", true)
            .attr("x", this.width + this.margin.left - 20)
            .attr("y", this.height + this.margin.top + 20)
            .text(xLabel);

        // Y axis label:
        this.svg.append("text")
            .attr("text-anchor", "end")
            .attr("id", `y-axis-label${this.index}`)
            .classed("axis-label y-axis-label", true)
            .attr("x", this.margin.left + 25)
            .attr("y", this.margin.top + 5)
            .text(yLabel)


        // rimuovi linee precedenti
        this.svg.selectAll(".lineTest").remove();

        // rimuovi i cerchi precedenti
        this.svg.selectAll(".myCircles").remove();


        //line generator
        const myLine = d3.line()
            .x((d, i) => xScale(d.anno))
            .y((d) => yScale(d.conta));
        

        this.xScale = xScale;
        this.yScale = yScale;
        
        // disegna nuove linee
        for (let i = 0; i < data.length; i++) {
            this.drawLine(data[i].ateneo, i, data[i].data, myLine, data[i].color);
        }

        // disegna nuove linee tratteggiate
        for (let i = 0; i < dashedData.length; i++) {
            this.drawLine(dashedData[i].ateneo, i, dashedData[i].data, myLine, dashedData[i].color, true);
        }
    }



    drawLine(ateneo, index, data, lineGenerator, color="steelblue", dashed=false) {

        //console.log("drawing line for ateneo " + ateneo);

        var dashedText = "";
        if (dashed) {
            dashedText = "dashed-";
        }

        // se dashed, aggiungi le line a dashedGroup
        if (dashed) {
            var group = this.dashedGroup.append("g");
            // Create a update selection: bind to the new data
            var u = this.dashedGroup.selectAll(`.lineTest-${dashedText}${index}`).data([data], function(d){ return d.anno });
        }
        // altrimenti crea un gruppo normale
        else {
            var group = this.svg.append("g");  
            // Create a update selection: bind to the new data
            var u = this.svg.selectAll(`.lineTest-${dashedText}${index}`).data([data], function(d){ return d.anno });
        }

        // me lo devo salvare qua perche' nelle funzioni anonime perdo il riferimento a "this" (con bind non funziona)
        const self = this;

        const applyDashedStyle = (elem) => {
            if (dashed) {
                return elem.style("stroke-dasharray", ("5, 5"));
            }
            return elem;
        }

        applyDashedStyle(
            u.enter()
            .append("path")
            .attr("class",`lineTest lineTest-${dashedText}${index} ${dashedText}`)
            .merge(u)
        )
            .attr("d", lineGenerator)
            .attr("fill", "none")
            .attr("stroke", color)
            .attr("stroke-width", 2.5)
            .on("mouseout",  this.closeTooltip.bind(this))
            .on('mouseover', function(event, d) { self.openTooltipNoData(self, ateneo, color, event);});

                
        group
            .attr("class","myCircles")
            .selectAll(`.myCircles-${dashedText}${index}`)
            .data(data)
            .enter()
            .append("circle")
            .attr("class",`myCircles-${dashedText}${index} ${dashedText}`)
            .attr("fill", color)
            .style("stroke","transparent")
            .style("stroke-width","10px")
            .attr("cx", function(d) { return self.xScale(d.anno) })
            .attr("cy", function(d) { return self.yScale(d.conta) })
            .attr("r", 3)
            .on("mouseout", this.closeTooltip.bind(this))
            .on('mouseover', function(event, d) { self.openTooltip(self, ateneo, color, event, d);})
    }

    

    drawDashedLines(vals) {

        const data = vals.data;
        this.dashedData = vals;
        
        //line generator
        const myLine = d3.line()
            .x((d, i) => this.xScale(d.anno))
            .y((d) => this.yScale(d.conta));

        // disegna linee
        for (let i = 0; i < data.length; i++) {
            console.log("ateeo: " + data[i].ateneo)
            this.drawLine(data[i].ateneo, i, data[i].data, myLine, data[i].color, true);
        }
    }

    
    openTooltip(self, ateneo, color, event, d) {
        //console.log(d); 
        self.tooltip
            .style('left', (event.pageX - 38) + 'px')     
            .style('top', (event.pageY - 28) + 'px');

        d3.select(`#toolTipDiv-title${self.index}`).html(ateneo);
        d3.select(`#toolTipDiv-line${self.index}`).style("background-color", color);
        d3.select(`#toolTipDiv-content${self.index}`).html('<div>Anno: ' + d.anno + '</div><div>Tot: ' + d.conta + '</div>');

        self.tooltip.transition()        
            .duration(200)      
            .style('opacity', 1);     
    }
        
    openTooltipNoData(self, ateneo, color, event) {
        //console.log(d); 
        self.tooltip
            .style('left', (event.pageX - 38) + 'px')     
            .style('top', (event.pageY - 28) + 'px');

        d3.select(`#toolTipDiv-title${self.index}`).html(ateneo);
        d3.select(`#toolTipDiv-line${self.index}`).style("background-color", color);
        d3.select(`#toolTipDiv-content${self.index}`).html('');

        self.tooltip.transition()        
            .duration(200)      
            .style('opacity', 1);     
    }

    closeTooltip() {
        //console.log("closing tooltip");
        this.tooltip.style('opacity', 0);
    }
    

}