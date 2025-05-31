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
 const tooltip = d3.select("body") // Create tooltip
        .append("div")
        .attr("class", "tooltip")
        .style("position", "absolute")
        .style("visibility", "hidden")
        .style("background", "rgba(0, 0, 0, 0.7)")
        .style("color", "white")
        .style("padding", "10px")
        .style("border-radius", "5px")
        .style("font-size", "12px");

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

    const flattenedData = [];
    categories.forEach((yearMap, category) => {
        yearMap.forEach((count, year) => {
            flattenedData.push({ year, count, category });
        });
    });
    filteredFlattenedData = flattenedData.filter(d => d.category === "Fatal");
    console.log(filteredFlattenedData)
    // 4.a: PLOT DATA FOR CHART 1

    svg1.selectAll("path.data-line")
      .data([filteredFlattenedData]) // Bind the filtered data as a single line
      .enter()
      .append("path")
      .attr("class", "data-line")
      .attr("d", d3.line()
          .x(d => xScale(d.year))
          .y(d => yScale(d.count))
      )
      .style("stroke", "steelblue")
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

    

    
    svg1.selectAll(".data-point") // Create tooltip events
        .data(filteredFlattenedData) // Bind only the filtered STEM data
        // .data([selectedCategoryData]) // D7: Bind only to category selected by dropdown menu
        .enter()
        .append("circle")
        .attr("class", "data-point")
        .attr("cx", d => xScale(d.year))
        .attr("cy", d => yScale(d.count))
        .attr("r", 5)
        .style("fill", "steelblue")
        .style("opacity", 0)  // Make circles invisible by default
        .on("mouseover", function(event, d) {
            tooltip.style("visibility", "visible")
                .html(`<strong>Year:</strong> ${d.year} <br><strong>Incidents:</strong> ${d.count}`)
                .style("top", (event.pageY + 10) + "px") // Position relative to pointer
                .style("left", (event.pageX + 10) + "px");

            // Make the hovered circle visible
            d3.select(this).style("opacity", 1);  // Set opacity to 1 on hover

            // Create the large circle at the hovered point
            svg1.append("circle")
                .attr("class", "hover-circle")
                .attr("cx", xScale(d.year))  // Position based on the xScale (year)
                .attr("cy", yScale(d.count)) // Position based on the yScale (count)
                .attr("r", 6)  // Radius of the large circle
                .style("fill", "steelblue") // Circle color
                .style("stroke-width", 2);
        })
        .on("mousemove", function(event) {
            tooltip.style("top", (event.pageY + 10) + "px")
                .style("left", (event.pageX + 10) + "px");
        })
        .on("mouseout", function() {
            tooltip.style("visibility", "hidden");

            // Remove the hover circle when mouseout occurs
            svg1.selectAll(".hover-circle").remove();

            // Make the circle invisible again
            d3.select(this).style("opacity", 0);  // Reset opacity to 0 when not hovering
        });





    // 7.a: ADD INTERACTIVITY FOR CHART 1
    function updateChart(selectedCategory) {
        // D3.2: Filter the data based on the selected category
        var selectedCategoryData = flattenedData.filter(function(d) {
            return d.category === selectedCategory;
        }).sort((a, b) => a.year - b.year);

        // .3: Remove existing lines
        // D3.3: Remove existing lines
        svg1.selectAll("path.data-line").remove();
        svg1.selectAll(".data-point").remove();

        // .4: Redraw lines
        // D3.4: Redraw line based on selected category data
        svg1.selectAll("path.data-line")
            .data([selectedCategoryData])
            .enter()
            .append("path")
            .attr("class", "data-line")
            .attr("d", d3.line()
                .x(d => xScale(d.year))
                .y(d => yScale(d.count))
            )
            .style("stroke", colorScale(selectedCategory))
            .style("fill", "none")
            .style("stroke-width", 2);

      }

    updateChart("Fatal");
    // 5: EVENT LISTENERS
    d3.select("#categorySelect").on("change", function() {
        var selectedCategory = d3.select(this).property("value");
        updateChart(selectedCategory); // Update the chart based on the selected option
    });  

});