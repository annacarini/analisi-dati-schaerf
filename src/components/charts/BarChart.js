import * as d3 from "d3";

import ColorUtilities from "../../utils/ColorUtilities";

import "./Charts.css";

export default class BarChart {

    animationDuration = 2000;


    constructor(svg, tooltip, margin, width, height, stacked, index) {
        this.svg = svg;
        this.margin = margin;
        this.width = width;
        this.height = height;
        this.stacked = stacked;
        this.index = index;

        this.data = [];
        this.xStart = 0;
        this.xEnd = 0;
        this.yLabel = "";
        this.xLabel = "";

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
        this.update(this.data, this.xStart, this.xEnd, this.stacked, this.yLabel, this.xLabel);
    }


    draw(vals, xStart, xEnd, stacked, yLabel, xLabel="Anno") {

        /*
        // vals e' cosi':
        vals = {
            ateneo: ateneo,
            max: max,
            color: color,
            data: [
                {
                    anno: anno,
                    somma: somma,
                    data: [
                        {
                            nome: nome,
                            valore: valore,
                            color: color,
                        },
                        ...
                    ]
                },
                ...
            ]
        }

        quindi se prendo vals.data[0].data ho countPerAnno, se prendo vals.data[0].max ho maxCount

        */

        this.data = vals;
        this.xStart = xStart;
        this.xEnd = xEnd;
        this.stacked = stacked;
        this.yLabel = yLabel;
        this.xLabel = xLabel;

        const countPerAnno = vals.data;


        // Prendi elemento svg
        this.svg.attr("width",this.width + this.margin.left + this.margin.right)
            .attr("height", this.height + this.margin.top + this.margin.bottom)
            .attr("id", `line-chart${this.index}`)             // assegno un id per i css
            .classed("line-chart", true);


        //scales
        const xScale = d3
            .scaleBand()
            .domain(countPerAnno.map(d => parseInt(d.anno)))
            .range([this.margin.left, this.width - this.margin.right])
            .padding(0.1);
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

        this.update(vals, xStart, xEnd, stacked, yLabel, xLabel);
    }


    setStacked(stacked) {
        this.stacked = stacked;
        this.update(this.data, this.xStart, this.xEnd, this.stacked, this.yLabel, this.xLabel);
    }


    update(vals, xStart, xEnd, stacked, yLabel, xLabel="Anno") {
        this.stacked = stacked;
        if (stacked) {
            this.updateStacked(vals, xStart, xEnd, yLabel, xLabel);
        }
        else {
            this.updateSimple(vals, xStart, xEnd, yLabel, xLabel);
        }
    }

    updateSimple(vals, xStart, xEnd, yLabel, xLabel="Anno") {

        this.data = vals;
        this.xStart = xStart;
        this.xEnd = xEnd;
        this.yLabel = yLabel;
        this.xLabel = xLabel;

        const maxCount = vals.max;
        const data = vals.data;

        if (data.length < 1) return;

        //scales
        const anni = data.map(d => parseInt(d.anno));
        const xScale = d3.scaleBand()
            .domain(anni)
            .range([this.margin.left, this.width - this.margin.right])
            .padding(0.1);
        const yScale = d3.scaleLinear()
            .domain([0, 1.1*maxCount])
            .range([this.height - this.margin.top, this.margin.bottom]);

        // axes
        const xAxis = d3.axisBottom(xScale)
            .ticks(data.length)
            .tickFormat(function (d) {
                return d;
            });
        const yAxis = d3.axisLeft(yScale)
            .ticks(10)
            .tickFormat(function (d) {
                return d.toLocaleString();
            });


        // Update the X axis:
        this.svg.select(`#x-axis${this.index}`).call(xAxis);

        // Update the Y axis
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
        this.svg.selectAll(".bars").remove();


        this.xScale = xScale;
        this.yScale = yScale;


        // me lo devo salvare qua perche' nelle funzioni anonime perdo il riferimento a "this" (con bind non funziona)
        const self = this;

        var color = vals.color;     // colore diverso per ogni ateneo - ma l'effetto e' brutto
        color = "steelblue";

        // per qualche motivo xScale mi restituisce undefined per il primo valore del dominio - non capisco come risolverlo ma questa funzione fixa il problema
        const getXPos = function(val) {
            var pos = xScale(val);
            if (pos) {
                return pos;
            }
            else {
                return xScale(xScale.domain()[0]);
            }
        }

        // Add a rect for each bar.
        this.svg.append("g")
            .attr("class","bars")
            .attr("fill", color)
            .selectAll("g")
            .data(data)
            .join("rect")
            //.attr("x", (d) => xScale(d.anno))
            .attr("x", (d) => getXPos(d.anno))
            .attr("y", (d) => yScale(d.somma))
            .attr("height", (d) => yScale(0) - yScale(d.somma))
            .attr("width", xScale.bandwidth())
            .on("mouseout",  this.closeTooltip.bind(this))
            .on("mousemove", function(event) { self.moveTooltip(self, event)})
            .on('mouseover', function(event, d) { self.openTooltipSimple(self, event, d)});
    }

    
    updateStacked(vals, xStart, xEnd, yLabel, xLabel="Anno") {

        this.data = vals;
        this.xStart = xStart;
        this.xEnd = xEnd;
        this.yLabel = yLabel;
        this.xLabel = xLabel;

        const maxCount = vals.max;
        const data = vals.data;

        if (data.length < 1) return;

        //scales
        const anni = data.map(d => parseInt(d.anno));
        const xScale = d3.scaleBand()
            .domain(anni)
            .range([this.margin.left, this.width - this.margin.right])
            .padding(0.1);
        const yScale = d3.scaleLinear()
            .domain([0, 1.1*maxCount])
            .range([this.height - this.margin.top, this.margin.bottom]);

        // axes
        const xAxis = d3.axisBottom(xScale)
            .ticks(data.length)
            .tickFormat(function (d) {
                return d;
            });
        const yAxis = d3.axisLeft(yScale)
            .ticks(10)
            .tickFormat(function (d) {
                return d.toLocaleString();
            });


        // Update the X axis:
        this.svg.select(`#x-axis${this.index}`).call(xAxis);

        // Update the Y axis
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
        this.svg.selectAll(".bars").remove();



        // prendi tutti i possibili nomi di grant e passali come domini
        const colorDomain = [];
        const colorRange = [];
        const dataNewFormat = [];

        for (const grantsPerYear of data) {

            const dict = {};
            dict["anno"] = grantsPerYear.anno;
    
            const yearData = grantsPerYear.data;

            for (const grant of yearData) {
                if (!colorDomain.includes(grant.nome)) {
                    colorDomain.push(grant.nome);
                    colorRange.push(grant.color);
                }
                dict[grant.nome] = grant.valore;
            }

            dataNewFormat.push(dict);
        }

        const color = d3.scaleOrdinal()
            .domain(colorDomain)
            .range(colorRange)
            .unknown("#ccc");

        
        const stack = d3.stack()
            .keys(colorDomain)
            //.order(d3.stackOrderDescending)
            .offset(d3.stackOffsetNone);

        const series = stack(dataNewFormat);
        //console.log(series);

        this.xScale = xScale;
        this.yScale = yScale;


        // me lo devo salvare qua perche' nelle funzioni anonime perdo il riferimento a "this" (con bind non funziona)
        const self = this;

        const onlyGetValidField = function(d) {
            for (const field of d) {
                //console.log(field);
                if (field && !isNaN(field[1])) {
                    return [field];
                }
            }
        }

        const getXPos = function(val) {
            var pos = xScale(val);
            if (pos) {
                return pos;
            }
            else {
                return xScale(xScale.domain()[0]);
            }
        }


         // Show the bars
        this.svg.append("g")
            .attr("class","bars")
            .selectAll("g")
            // Enter in the stack data = loop key per key = group per group
            .data(series)
            .enter().append("g")
            .attr("fill", function(d) { return color(d.key); })
            .selectAll("rect")
            // enter a second time = loop subgroup per subgroup to add all rectangles
            //.data(function(d) { console.log(d); return d; })
            .data(function(d) { return onlyGetValidField(d); })
            .enter()
            .append("rect")
                .attr("class","bars")
                .attr("x", function(d) { return getXPos(d.data.anno); })
                .attr("y", function(d) { return yScale(d[1]); })
                .attr("height", function(d) { return yScale(d[0]) - yScale(d[1]); })
                .attr("width", xScale.bandwidth())
                .attr("stroke", "grey")
            .on("mouseout",  this.closeTooltip.bind(this))
            .on("mousemove", function(event) { self.moveTooltip(self, event);})
            .on('mouseover', function(event, d) { self.openTooltipStacked(self, event, d.data)});

    }


    openTooltipSimple(self, event, d) {
        //console.log(d);

        self.tooltip
            .style('left', (event.pageX - 38) + 'px')     
            .style('top', (event.pageY - 28) + 'px');

        d3.select(`#toolTipDiv-title${self.index}`).html(d.anno);

        d3.select(`#toolTipDiv-content${self.index}`).html(`<div>Grants: ${d.data.length}</div><div>Tot: ${d.somma.toLocaleString()} €</div>`);

        self.tooltip.transition()        
            .duration(200)      
            .style('opacity', 1);     
    }

    
    openTooltipStacked(self, event, d) {
        //console.log(d);

        const keys = Object.keys(d);
        const nomi = [];
        for (const key of keys) {
            if (key != "anno") {
                nomi.push(key);
            }
        }

        self.tooltip
            .style('left', (event.pageX - 38) + 'px')     
            .style('top', (event.pageY - 28) + 'px');

        d3.select(`#toolTipDiv-title${self.index}`).html(d.anno);

        var content = "";

        for (let i = nomi.length - 1; i >= 0; i--) {
            const nome = nomi[i];

            const quadrati_style = `
                background-color:${ColorUtilities.stringToColor(nome)};
                width:15px;
                height:15px;
                border-radius:4px;
                margin-right:3px;
            `;

            content += `<div style="display:flex; align-items:center;">`;
            content += `<div style="${quadrati_style}"></div>`;
            content += `<div>${nome}: ${d[nome].toLocaleString()} €</div>`;
            content += "</div>";
        }
        d3.select(`#toolTipDiv-content${self.index}`).html(content);

        self.tooltip.transition()        
            .duration(200)      
            .style('opacity', 1);     
    }

    closeTooltip() {
        //console.log("closing tooltip");
        this.tooltip.style('opacity', 0);
    }
    
    moveTooltip(self, event) {
        console.log("moving tooltip");
        self.tooltip
            .style('left', (event.pageX - 38) + 'px')     
            .style('top', (event.pageY - 28) + 'px');
    }
}