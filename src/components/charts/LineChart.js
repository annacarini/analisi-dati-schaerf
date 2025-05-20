export default class LineChart {

    constructor(svg, margin, width, height) {
        this.svg = svg;
        this.margin = margin;
        this.width = width;
        this.height = height;
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
        const xAxisTemp = d3.axisBottom(xScale).ticks(countPerAnno.length);
        this.svg.append("g")
            .attr("transform", `translate(0,${this.height})`)
            .attr("id", "x-axis")             // assegno un id per i css
            .call(xAxisTemp);

        const yAxisTemp = d3.axisLeft(yScale).ticks(10);
        this.svg.append("g")
            .attr("transform", `translate(${this.margin.left},0)`)
            .attr("id", "y-axis")             // assegno un id per i css
            .call(yAxisTemp);
        

        updateChartData(vals, xStart, xEnd);
    }


    
    updateChartData(vals, xStart, xEnd) {

        const maxCount = vals.max;
        const data = vals.data;

        //scales
        const xScale = d3.scaleLinear().range([this.margin.left, this.width - this.margin.right]);
        const yScale = d3.scaleLinear().range([this.height - this.margin.top, this.margin.bottom]);

        // axes
        const xAxis = d3.axisBottom(xScale).ticks(data.length);
        const yAxis = d3.axisLeft(yScale).ticks(10);

        // Update the X axis:
        xScale.domain([xStart, xEnd]);
        svg.selectAll("#x-axis").transition()
            .duration(3000)
            .call(xAxis);

        // Update the Y axis
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
    

}