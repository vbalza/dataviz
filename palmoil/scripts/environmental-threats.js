let svgThreats = d3.select("body")
    .select("#environmental-threats")
    .append("g")

d3.csv("data/deforestation.csv").then(function(data) {

    let margin = {top: 60, right: 230, bottom: 50, left: 50};
    let width = 850 - margin.left - margin.right;
    let height = 500 - margin.top - margin.bottom;

    svgThreats
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .attr("transform", `translate(${margin.left}, ${margin.top})`);

    let x = d3.scaleLinear()
        .domain(d3.extent(data, function(d) { return d.year; }))
        .range([ 0, width ]);
    
    let xAxisSettings = d3.axisBottom(x)
        .tickValues([2001, 2003, 2005, 2007, 2009, 2011, 2013, 2015])
        .tickFormat(d3.format("d"))
        .tickPadding(10);
    
    let xAxis = svgThreats.append("g")
        .attr("class", "x axis")
        .call(xAxisSettings)
        .attr("transform", `translate(0, ${height})`)

    svgThreats.append("text")
        .attr("text-anchor", "end")
        .attr("x", width/2)
        .attr("y", height+60 )
        .text("Year");

    svgThreats.append("text")
        .attr("text-anchor", "end")
        .attr("x", 0)
        .attr("y", -20 )
        .text("thousand hectares")
        .attr("text-anchor", "start")

    let y = d3.scaleLinear()
        .domain([0, 3000])
        .range([ height, 0 ]);
  
    let yAxisSettings = d3.axisLeft(y)
        .ticks(5)

    svgThreats.append("g")
        .call(yAxisSettings)
  
    let keys = data.columns.slice(1)
  
    let color = d3.scaleOrdinal()
        .domain(keys)
        .range(["#bad0af", 
                "#488f31" ]);
  
    let stackedData = d3.stack()
        .keys(keys)
        (data)

    svgThreats.append("line")
        .attr("x1", margin)
        .attr("x2", width)
        .attr("y1", y(0))
        .attr("y2", y(0))
        .style("stroke", "black")
        .style("stroke-width", "1.5px")

    let clip = svgThreats.append("defs").append("svg:clipPath")
        .attr("id", "clip")
        .append("svg:rect")
        .attr("width", width )
        .attr("height", height )
        .attr("x", 0)
        .attr("y", 0);

    let brush = d3.brushX()                 
        .extent( [ [0,0], [width,height] ] ) 
        .on("end", updateChart)

    let areaChart = svgThreats.append('g')
        .attr("clip-path", "url(#clip)")

    let area = d3.area()
        .x(function(d) { return x(d.data.year); })
        .y0(function(d) { return y(d[0]); })
        .y1(function(d) { return y(d[1]); })
        .curve(d3.curveMonotoneX);

    areaChart
        .selectAll("mylayers")
        .data(stackedData)
        .join("path")
        .attr("class", function(d) { return "myArea" + d.key })
        .style("fill", function(d) { return color(d.key); })
        .attr("d", area)

    areaChart
        .append("g")
        .attr("class", "brush")
        .call(brush);

    let idleTimeout
    function idled() { idleTimeout = null; }

    function updateChart(event,d) {
        extent = event.selection

        if(!extent){
            if (!idleTimeout) 
            return idleTimeout = setTimeout(idled, 350);
            x.domain(d3.extent(data, function(d) { return d.year; }))
        } else{
            x.domain([ x.invert(extent[0]), x.invert(extent[1]) ])
            areaChart.select(".brush").call(brush.move, null)
        }

      xAxis.transition()
          .duration(1000)
          .call(d3.axisBottom(x).ticks(5).tickFormat(d3.format("d")))

      areaChart
          .selectAll("path")
          .transition().duration(1000)
          .attr("d", area)
    }

    let highlight = function(event, d){
        d3.selectAll(".myArea").style("opacity", .1)
        d3.select("."+d).style("opacity", 1)
    }

    let noHighlight = function(event,d){
        d3.selectAll(".myArea").style("opacity", 1)
    }

    let size = 20
    
    svgThreats.selectAll("myrect")
        .data(keys)
        .join("rect")
        .attr("x", 600)
        .attr("y", function(d, i){ return 10 + i*(size+5)})
        .attr("width", size)
        .attr("height", size)
        .style("fill", function(d){ return color(d) })
        .on("mouseover", highlight)
        .on("mouseleave", noHighlight)

    svgThreats.selectAll("mylabels")
        .data(keys)
        .join("text")
        .attr("x", 600 + size*1.2)
        .attr("y", function(d, i){ return 10 + i*(size+5) + (size/2)})
        .style("fill", "black")
        .text(function(d){ return d})
        .attr("text-anchor", "left")
        .style("alignment-baseline", "middle")
        .on("mouseover", highlight)
        .on("mouseleave", noHighlight)

})