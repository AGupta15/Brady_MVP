var data;
var svg5, x5, y5;
var graphHeight5, graphWidth5, margin5;
var tooltip5;
var maxWPA, minWPA;

/*==========Plot===========*/
function plotWPA(graphType, width, height) {

  var id = graphType.viz_id;
  var passers = graphType.passers;
  var data = graphType.data;

  console.assert(passers.size <= 3, "More than 3 passers");

  var passer_array = Array.from(passers);
  passer_array.sort(function(a, b){return a - b});

  margin5 = {top: 50, right: 50, bottom: 50, left: 50};
  graphWidth5 = width - margin5.left - margin5.right;
  graphHeight5 = height - margin5.top - margin5.bottom;

  var innerGraphPadding = 30;

  var font_size = 11;

  // Return true for countries without start/end values
  missing = function(d) { return !d.start || !d.end; },

  // Format values for labels
  label_format = function(value) { return d3.format(".2f")(value); }

  svg5 = d3.select(id)
  .append("svg")
  .attr("width", width)
  .attr("height", height)
  .append("g")
  .attr("transform",
  "translate(" + margin5.left + "," + margin5.top + ")");

  tooltip5 = d3.tip()
  .attr('class', 'd3-tip')
  .offset([-10, 0]);

  svg5.call(tooltip5);

  // key
  d3.selectAll(id + "key")
  .html(keyHtml(data.filter(function(d){return passers.has(parseInt(d.passerid))})));

  // Scales and positioning
  var slope = d3.scale.linear()
  .domain([minWPA, maxWPA])
  .range([20, graphHeight5-20]);

  //Go through the list of countries in order, adding additional space as necessary.
  var min_h_spacing = 1.2 * font_size, // 1.2 is standard font height:line space ratio
  previousY = 0,
  thisY,
  additionalSpacing;
  //Preset the Y positions (necessary only for the lower side)
  //These are used as suggested positions.
  data.forEach(function(d) {
    d.startY = graphHeight5 - slope(d.defenseWPA);
    d.endY = graphHeight5 - slope(d.passerWPA);
  });
  //Loop over the higher side (right) values, adding space to both sides if there's a collision
  data.sort(function(a,b) {
    if (a.end == b.end) return 0;
    return (a.end < b.end) ? -1 : +1;
  })
  .forEach(function(d) {
    thisY = d.endY; //position "suggestion"
    additionalSpacing = 0;
    //Adjust all Y positions lower than this end's original Y position by the delta offset to preserve slopes:
    data.forEach(function(dd) {
      if (dd.startY >= d.endY) dd.startY += additionalSpacing;
      if (dd.endY >= d.endY) dd.endY += additionalSpacing;
    });

    previousY = thisY;
  });

  previousY = 0;
  data.sort(function(a,b) {
    if (a.startY == b.startY) return 0;
    return (a.startY < b.startY) ? -1 : +1;
  })
  .forEach(function(d) {
    thisY = d.startY; //position "suggestion"
    additionalSpacing = 0;

    //Adjust all Y positions lower than this start's original Y position by the delta offset to preserve slopes:
    data.forEach(function(dd) {
      if (dd.endY >= d.startY) dd.endY += additionalSpacing;
      if (dd.label != d.label && dd.startY >= d.startY) dd.startY += additionalSpacing;
    });
    previousY = thisY;
  });

  // Passer
  // var passer = svg5.selectAll("g.passer")
  // .data( data )
  // .enter()
  // .append("g")
  // .attr("class", "passer")
  // .classed("missing", function(d) { return missing(d); });

  // passer.on("mouseover", function(d,i) { return d3.select(this).classed("over", true); })
  // .on("mouseout", function(d,i) { return d3.select(this).classed("over", false); });

  y5 = d3.scaleLinear()
  .domain([minWPA, maxWPA])
  .range([graphHeight5, 0]);

  svg5.append("g")
  .attr("class", "wpaAxis axis")
  .attr("transform", "translate(" + [graphWidth5/2,0] + ")")
  .call(
    d3.axisLeft(y5)
    .ticks(5, "%")
    .tickSize(2)
    .tickFormat(function(d,i) {
      return d == 0 ? "" : d3.format(".0%")(d)
    })
  );

  // text label 1 for the y axis
  svg5.append("text")
  .attr("transform", "rotate(-90)")
  .attr("class","label")
  .attr("y", 0 - margin5.left)
  .attr("x",0 - (graphHeight5 / 2))
  .attr("dy", "12px")
  .style("text-anchor", "middle")
  .text("Average Defense Win Probability (%)");

  // text label 2 for the y axis
  svg5.append("text")
  .attr("transform", "rotate(+90)")
  .attr("class","label")
  .attr("y", - graphWidth5-margin5.right/2)
  .attr("x", (graphHeight5 / 2))
  .attr("dy", "12px")
  .style("text-anchor", "middle")
  .text("Average QB Win Probability (%)");

  // ** Left column
  data.forEach(function(passer,i) {

    //Left Column
    // svg5.append("text")
    // .attr("x", 10)
    // .attr("y", passer.startY)
    // .attr("xml:space", "preserve")
    // .attr("class", "textL"+i)
    // .style("font-size", font_size)
    // .text(passer.team)
    // .style("opacity", passers.has(parseInt(passer.passerid)) ? 1 : 0)

    //Right column
    // svg5.append("text")
    // .attr("x", graphWidth5-100)
    // .attr("y", passer.endY)
    // .attr("xml:space", "preserve")
    // .attr("class", "textR"+i)
    // .style("font-size", font_size)
    // .text(passer.passer)
    // .style("opacity", passers.has(parseInt(passer.passerid)) ? 1 : 0)

    // ** Slope lines
    svg5.append("line")
    .attr("x1", 110)
    .attr("x2", graphWidth5-110)
    .attr("y1", passer.startY)
    .attr("y2", passer.endY)
    .attr("class", "line"+i)
    .style("stroke", teamAttributes[passer['team']]['color'])
    .style("stroke-width", passers.has(parseInt(passer.passerid)) ? 1.5 : 1)
    .style("opacity", passers.has(parseInt(passer.passerid)) ? 1 : 0.1)
    // .style("border", )
    .on('mouseover', function() {
      d3.select(this).style("opacity", 1)
      tooltip5.html(function() {
        return tooltip5Html(passer)
      })
      tooltip5.show()
      // tooltip5.style("left", d3.event.pageX + "px")
//       tooltip5.style("top", d3.event.pageY + "px")
    })
    .on('mouseout', function() {
      d3.select(this).style("opacity", passers.has(parseInt(passer.passerid)) ? 1 : 0.1)
      tooltip5.hide();
    })
  });
}

/*==========Load===========*/
function loadWPA(graphType, callback) {
  d3.csv("Data/graph5.csv", function (error, data) {
    if (error) { console.log(error); }

    data = data.map(function(d) {
      d.passer = d['passer'],
      d.passerid = d['passerid'],
      d.passerWPA = parseFloat(d['passerWPA']),
      d.defenseWPA = parseFloat(d['defenseWPA']),
      d.team = d['team']
      return d
    })

    data.reverse()
    data.push({
      passer: "Average",
      team: "NFL",
      "passerid": data.length,
      "passerWPA": d3.sum(data, d => d.passerWPA) / data.length,
      "defenseWPA": d3.sum(data, d => d.defenseWPA) / data.length
    })
    data.reverse()
    // console.log(data);

    var max1 = d3.max(data, d => d.passerWPA);
    var max2 = d3.max(data, d => d.defenseWPA);
    maxWPA = Math.max(max1, max2);

    var min1 = d3.min(data, d => d.passerWPA);
    var min2 = d3.min(data, d => d.defenseWPA);
    minWPA = Math.min(min1, min2);

    // setupPointSpreadPicker(pointBins);
    callback(graphType, data);
  });

}

/*==========Replot===========*/
function replotWPA(graphType){
  var id = graphType.viz_id;
  var passers = graphType.passers;
  var data = graphType.data;

  data.forEach(function(passer, i){
    svg5.selectAll(".line"+i)
    .transition()
    .duration(transitionDuration)
    .style("opacity", passers.has(parseInt(passer.passerid)) ? 1 : 0.1)

    // svg5.selectAll(".textL"+i)
    // .transition()
    // .duration(transitionDuration)
    // .style("opacity", passers.has(parseInt(passer.passerid)) ? 1 : 0)
    //
    // svg5.selectAll(".textR"+i)
    // .transition()
    // .duration(transitionDuration)
    // .style("opacity", passers.has(parseInt(passer.passerid)) ? 1 : 0)

    d3.selectAll(id + "key")
    .html(keyHtml(data.filter(function(d){return passers.has(parseInt(d.passerid))})));

  });
}

/* tooltip3 html */
function tooltip5Html(passer) {
  var neg = "";
  if (passer.defenseWPA > passer.passerWPA){
    neg = "-";
  } else neg = "";
  return "<img src=" + teamAttributes[passer.team].icon + ">" +
  "<div id='passer'>" + passer.passer +
  "</div><div id='team'>" + passer.team + "</div><br>" + "<br><br>" +
  formatPercent(passer.defenseWPA) + " Defense WPA <br>" +
  formatPercent(passer.passerWPA) + " Passer WPA <br>" + neg +
  formatPercent(passer.defenseWPA - passer.passerWPA) + " QB WPA Impact";
}
