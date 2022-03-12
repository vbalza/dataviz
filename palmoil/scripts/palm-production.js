
let svgProd = d3.select("body")
    .select("#palm-production")
    .append("g")

d3.csv("data/topproducers_wide.csv").then(function(data) {
    console.log(data)

    let margin = {top: 60, right: 230, bottom: 50, left: 50};
    let width = 850 - margin.left - margin.right;
    let height = 500 - margin.top - margin.bottom;

    svgProd
        .attr("transform", `translate(${margin.left}, ${margin.top})`)
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)

    let x = d3.scaleLinear()
        .domain(d3.extent(data, function(d) { return d.year; }))
        .range([ 0, width ]);
    
    let xAxisSettings = d3.axisBottom(x)
        .tickValues([1961, 1970, 1980, 1990, 2000, 2010, 2018])
        .tickFormat(d3.format("d"))
        .tickPadding(10);
    
    let xAxis = svgProd.append("g")
        .attr("class", "x axis")
        .call(xAxisSettings)
        .attr("transform", `translate(0, ${height})`)

    svgProd.append("text")
        .attr("text-anchor", "end")
        .attr("x", width/2)
        .attr("y", height+60 )
        .text("Year");

    svgProd.append("text")
        .attr("text-anchor", "end")
        .attr("x", 0)
        .attr("y", -20 )
        .text("oil palm (million tonnes)")
        .attr("text-anchor", "start")

    let y = d3.scaleLinear()
        .domain([0, 70000000])
        .range([ height, 0 ]);
  
    let yAxisSettings = d3.axisLeft(y)
        .ticks(5)
        .tickFormat(function(d){return d/1000000})

    svgProd.append("g")
        .call(yAxisSettings)
  
    let keys = data.columns.slice(1)
  
    let color = d3.scaleOrdinal()
        .domain(keys)
        .range(["#ff6361", // Indonesia
                "#bc5090", // Malaysia
                "#ffa600" // Other
            ]);
  
    let stackedData = d3.stack()
        .keys(keys)
        (data)

    let baseline = svgProd.append("line")
        .attr("x1", margin)
        .attr("x2", width)
        .attr("y1", y(0))
        .attr("y2", y(0))
        .style("stroke", "black")
        .style("stroke-width", "1.5px")

    let clip = svgProd.append("defs").append("svg:clipPath")
        .attr("id", "clip")
        .append("svg:rect")
        .attr("width", width )
        .attr("height", height )
        .attr("x", 0)
        .attr("y", 0);

    let brush = d3.brushX()                 
        .extent( [ [0,0], [width,height] ] ) 
        .on("end", updateChart)

    let areaChart = svgProd.append('g')
        .attr("clip-path", "url(#clip)")

    let area = d3.area()
        .x(function(d) { return x(d.data.year); })
        .y0(function(d) { return y(d[0]); })
        .y1(function(d) { return y(d[1]); })
        // .curve(d3.curveBasis);

    areaChart
        .selectAll("mylayers")
        .data(stackedData)
        .join("path")
        .attr("class", function(d) { return "myArea " + d.key })
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
            return idleTimeout = setTimeout(idled, 350); // This allows to wait a little bit
            x.domain(d3.extent(data, function(d) { return d.year; }))
        } else{
            x.domain([ x.invert(extent[0]), x.invert(extent[1]) ])
            areaChart.select(".brush").call(brush.move, null) // This remove the grey brush area as soon as the selection has been done
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
    
    svgProd.selectAll("myrect")
        .data(keys)
        .join("rect")
        .attr("x", 600)
        .attr("y", function(d,i){ return 10 + i*(size+5)})
        .attr("width", size)
        .attr("height", size)
        .style("fill", function(d){ return color(d)})
        .on("mouseover", highlight)
        .on("mouseleave", noHighlight)

    svgProd.selectAll("mylabels")
        .data(keys)
        .join("text")
        .attr("x", 600 + size*1.2)
        .attr("y", function(d,i){ return 10 + i*(size+5) + (size/2)})
        .style("fill", "black")
        .text(function(d){ return d})
        .attr("text-anchor", "left")
        .style("alignment-baseline", "middle")
        .on("mouseover", highlight)
        .on("mouseleave", noHighlight)

})