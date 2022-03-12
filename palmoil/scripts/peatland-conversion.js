let svgPeat = d3.select("body")
    .select("#peatland-conversion")
    .append("g")

let margin = {top: 60, right: 230, bottom: 50, left: 50};
let width = 850 - margin.left - margin.right;
let height = 500 - margin.top - margin.bottom;

svgPeat
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

svgPeat.append("text")
    .attr("text-anchor", "end")
    .attr("x", 0)
    .attr("y", -20 )
    .text("tonnes per hectare per year")
    .attr("text-anchor", "start")
    
const co2 = [
    {group: "Forest (Rs)", value: 50.904},
    {group: "Drained", value: 88.492},
    {group: "Young Oil Palm", value: 81.374},
    {group: "Mature Oil Palm", value: 54.41} ];
         
const methane = [
    {group: "Forest (Rs)", value: 14.8778},
    {group: "Drained", value: 0.5242},
    {group: "Young Oil Palm", value: 2.6774},
    {group: "Mature Oil Palm", value: 7.6752} ];

const nitrous = [
    {group: "Forest (Rs)", value: 14.22},
    {group: "Drained", value: 48.018},
    {group: "Young Oil Palm", value: 174.486},
    {group: "Mature Oil Palm", value: 35.278} ];

let x = d3.scaleBand()
    .range([ 0, width ])
    .domain(co2.map(d => d.group))
    .padding(0.2);
    
svgPeat.append("g")
    .attr("class", "x axis")
    .attr("transform", `translate(0,${height})`)
    .call(d3.axisBottom(x))

let y = d3.scaleLinear()
    .domain([0, 180])
    .range([ height, 0]);

let yAxisSettings = d3.axisLeft(y)
    .tickValues([20, 60, 100, 140, 180])

    svgPeat.append("g")
    .attr("class", "yaxis")
    .call(yAxisSettings);

let baseline = svgPeat.append("line")
    .attr("x1", margin)
    .attr("x2", width)
    .attr("y1", y(0))
    .attr("y2", y(0))
    .style("stroke", "black")
    .style("stroke-width", "1px")
      
function update(data) {
        
    var u = svgPeat.selectAll("rect")
        .data(data)
      
    u.join("rect")
        .transition()
        .duration(1000)
        .attr("x", d => x(d.group))
        .attr("y", d => y(d.value))
        .attr("width", x.bandwidth())
        .attr("height", d => height - y(d.value))
        .attr("fill", "#5499C7")
      }
    
function functionName(data){
    update(data);
    };

update(co2)
