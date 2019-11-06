  const formatTemp = temp => {
    return temp > 0 ? `+${temp}°C` : `${temp}°C`;
  };
const MONTHS = ['January',
             'February',
             'March',
             'April',
             'May',
             'June',
             'July',
             'August',
             'September',
             'October',
             'November',
             'December'];

const buildChart = async () => {
  const json = await d3.json(             "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json"
  );
  const datasource = json.monthlyVariance;
  const baseTemp = json.baseTemperature;
  const years = datasource.map(d => d.year);
  const maxYear = Math.max(...years);
  const minYear = Math.min(...years);
  const yearRange = maxYear - minYear;
  const variances = datasource.map(d => d.variance);
  const minVariance = Math.min(...variances);
  const maxVariance = Math.max(...variances);

  const padding = { top: 100, bottom: 50, left: 100, right: 300 };
  const baseWidth = 900;
  const baseHeight = 500;
  const cellHeight = baseHeight / 12;
  const cellWidth = baseWidth / (yearRange + 1);

  const width = baseWidth + padding.left + padding.right;

  const height = baseHeight + padding.top + padding.bottom;


  const div = d3
    .select("body")
    .append("div")
    .attr("id", "tooltip")
    .attr("class", "tooltip")
    .style("opacity", 0)
    .attr('data-month','')
    .attr('data-year', '')
    .attr('data-temp', "");

  const myColor = d3
    .scaleSequential()
    .interpolator(d3.interpolateRdYlBu)
    .domain([maxVariance, minVariance]);



  const colorLegend = d3
    .legendColor()
    .labelFormat(d3.format(".1f"))
    .scale(myColor)
    .title("Degrees above / below Base Temp")
    .titleWidth(120)
    .shapePadding(0)
    .shapeWidth(30)
    .shapeHeight(30)
    .labels(options => {
      if (options.i === 0) {
        return `≥ ${formatTemp(options.generatedLabels[options.i])}`;
      }
      if (options.i === options.generatedLabels.length - 1) {
        return `≤ ${formatTemp(options.generatedLabels[options.i])}`;
      }
      return `${formatTemp(options.generatedLabels[options.i])} to ${formatTemp(
        options.generatedLabels[options.i - 1]
      )}`;
    })
    .labelOffset(10)
    .cells(15);

  const svg = d3
    .select(".chart-container")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

  svg
    .append("g")
    .attr("class", "legend")
    .attr('id','legend')
    .attr("transform", `translate(${baseWidth + padding.left + 20},${padding.top})`);
  svg.select(".legend").call(colorLegend);

  const xScale = d3
    .scaleLinear()
    .domain([minYear, maxYear])
    .range([padding.left, baseWidth + padding.left]);
  const yScale = d3
    .scaleBand()
    .domain(MONTHS)
    .range([padding.top, baseHeight + padding.top ]);

  svg
    .selectAll("rect")
    .data(datasource)
    .enter()
    .append("rect")
    .attr("class", "cell")
    .attr('data-month',d=>d.month - 1)
    .attr('data-year', d=>d.year)
    .attr('data-temp', d=>d.variance)
    .attr("x", d => (d.year - minYear) * cellWidth + padding.left)
    .attr("y", d => (d.month - 1) * cellHeight + padding.top)
    .attr("width", cellWidth)
    .attr("height", cellHeight)
    .attr("fill", d => myColor(d.variance))
    
    .on('mouseover', d => {
    div.transition()
    .duration(0)
    .style('opacity', 1);
    div.html(`${MONTHS[d.month-1]} ${d.year}<br>
${d.variance > 0 ? '+' : ''}${Math.round(baseTemp + d.variance * 100) / 100}°C`)
     .attr('data-month',MONTHS[d.month-1])
    .attr('data-year',d.year )
    .attr('data-temp',d.variance)
    .style('left', (d3.event.pageX + 15) + 'px')
    .style('top', d3.event.pageY + 'px')
  })
  .on('mouseout', d => {
    div.transition()
    .duration(750)
    .style('opacity', 0)
  });

    const xAxis = d3.axisBottom(xScale)
    .ticks(15)
    .tickFormat(d=>d.toString());
    svg
      .append("g")
      .attr("id", "x-axis")
      .attr("transform", `translate(0,${baseHeight + padding.top})`)
      .call(xAxis);
    const yAxis = d3.axisLeft(yScale);
    svg
      .append("g")
      .attr("id", "y-axis")
      .attr("transform", `translate(${padding.left },0)`)
      .call(yAxis);

    svg
      .append("text")
       .attr('id','title')
.text('Global Land Temperatures')
      .style("text-anchor", "middle")
      .attr("x", width / 2)
      .attr("y", 50)
      .attr("font-size", "30px");

   svg
      .append("text")
  .attr('id','description')
      .text('Degrees Celcius above / below base temp ')
      .style("text-anchor", "middle")
      .attr("x", width / 2)
      .attr("y", 80)
      .attr("font-size", "20px");
  
    svg.append('text')
    .text('Month')
    .attr('transform','rotate(-90)')
    .attr('x',0 - height / 2)
    .attr('y', 50)
    .style('text-anchor','middle')
      .attr("font-size", "20px");

    svg.append('text')
    .text('Year')
    .attr('x', baseWidth / 2 + padding.left)
    .attr('y', height )
    .style('text-anchor','middle')
      .attr("font-size", "20px");
};

document.addEventListener("DOMContentLoaded", buildChart);
