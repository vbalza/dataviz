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

    const subgroups = data.columns.slice(1)
    const groups = data.map(d => (d.year))

    let x = d3.scaleBand()
        .domain(groups)
        .range([ 0, width ])
        .padding([0.2]);
    
    let xAxisSettings = d3.axisBottom(x)
        .tickFormat(d3.format("d"))
        .tickSizeOuter(0)
    
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
  
    let color = d3.scaleOrdinal()
        .domain(subgroups)
        .range(["#bad0af", 
                "#488f31" ]);
  
    let stackedData = d3.stack()
        .keys(subgroups)
        (data)
    
    let barChart = svgThreats.append("g")
        .selectAll("g")
        .data(stackedData)
        .join("g")
        .attr("fill", d => color(d.key))
        .selectAll("rect")
        .data(d => d)
        .join("rect")
        .attr("x", d => x(d.data.year))
        .attr("y", d => y(d[1]))
        .attr("height", d => y(d[0]) - y(d[1]))
        .attr("width",x.bandwidth())
    
    svgThreats.append("line")
        .attr("x1", margin)
        .attr("x2", width)
        .attr("y1", y(0))
        .attr("y2", y(0))
        .style("stroke", "black")
        .style("stroke-width", "1.5px")

})
