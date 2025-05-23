//written with help of class example

// 1: SET GLOBAL VARIABLES
const margin = { top: 50, right: 30, bottom: 60, left: 70 };
const width = 900 - margin.left - margin.right;
const height = 400 - margin.top - margin.bottom;

// Create SVG containers for both charts
const svg1 = d3.select("#lineChart1") // If you change this ID, you must change it in index.html too
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

// (If applicable) Tooltip element for interactivity
// const tooltip = ...

// 2.a: LOAD...
d3.csv("aircraft_incidents.csv").then(data => {
  console.log(data);

    // 2.b: ... AND TRANSFORM DATA
    const categories = d3.rollup(data, 
      v => d3.rollup(v,
        values => values.length,
        d => d.Accident_Year
      ),
      d => d.Injury_Severity_Clean
    )

    console.log(categories)


    // 3.a: SET SCALES FOR CHART 1
    const allYears = Array.from(categories.values())
      .flatMap(yearMap => Array.from(yearMap.keys()));
    const yearCounts = Array.from(categories.values())
      .map(categoryMap =>
        Array.from(categoryMap.values())
    );
    const maxCount = d3.max(yearCounts, yearValues => d3.max(yearValues));
   
    const xScale = d3.scaleLinear()
      .domain(d3.extent(allYears))
      .range([0, width]);
    const yScale = d3.scaleLinear()
      .domain([0, maxCount + 1])
      .range([height, 0]);
    const colorScale = d3.scaleOrdinal()
      .domain(Array.from(categories.keys()))
      .range(d3.schemeTableau10);


    // 4.a: PLOT DATA FOR CHART 1
    const line = d3.line()
      .x(d => xScale(d.year))
      .y(d => yScale(d.count));

    const dataArray = Array.from(categories.entries());

    svg1.selectAll("path")
      .data(dataArray)
      .enter()
      .append("path")
      .attr("d", d => {
        const yearMap = d[1];
        const values = Array.from(yearMap.entries())
            .map(([year, count]) => ({ year, count }))
            .sort((a, b) => a.year - b.year); //https://stackoverflow.com/questions/26067081/date-sorting-with-d3-js
        return line(values); 
      })
      .style("stroke", d => colorScale(d[0])) 
      .style("fill", "none")
      .style("stroke-width", 2);
    
    // 5.a: ADD AXES FOR CHART 1
    svg1.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(xScale)
          .tickFormat(d3.format("d")));
    
    svg1.append("g")
      .call(d3.axisLeft(yScale));

    // 6.a: ADD LABELS FOR CHART 1
    svg1.append("text")
      .attr("class", "axis-label")
      .attr("x", width / 2)
      .attr("y", height + margin.bottom - 10)
      .attr("text-anchor", "middle")
      .text("Year");

    svg1.append("text")
      .attr("class", "axis-label")
      .attr("transform", "rotate(-90)")
      .attr("y", -margin.left + 20)
      .attr("x", -height / 2)
      .attr("text-anchor", "middle")
      .text("Number of Incidents");

    const legend = svg1.selectAll(".legend")
      .data(Array.from(categories.entries()))
      .enter()
      .append("g")
      .attr("class", "legend")
      .attr("transform", (d, i) => `translate(${width - 150}, ${i * 20 - 30})`);

    legend.append("rect")
      .attr("x", 10)
      .attr("width", 10)
      .attr("height", 10)
      .style("fill", d => colorScale(d[0])); 
    
    legend.append("text")
      .attr("x", 30)
      .attr("y", 10)
      .attr("text-anchor", "start")
      .style("alignment-baseline", "middle")
      .text(d => d[0]); 

    // 7.a: ADD INTERACTIVITY FOR CHART 1
    
});