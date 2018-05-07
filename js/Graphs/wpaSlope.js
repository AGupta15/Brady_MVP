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

  //Preset the Y positions (necessary only for the lower side)
  //These are used as suggested positions.
  data.forEach(function(d) {
    d.startY = graphHeight5 - slope(d.defenseWPA);
    d.endY = graphHeight5 - slope(d.passerWPA);
  });

  y5 = d3.scaleLinear()
  .domain([minWPA, maxWPA])
  .range([graphHeight5, 0]);

  svg5.append("g")
  .attr("class", "wpaAxis axis")
  // graphWidth5/2
  .attr("transform", "translate(" + [margin5.left + 19,0] + ")")
  .call(
    d3.axisLeft(y5)
    .ticks(10, "%")
    .tickSize(7)
    .tickFormat(function(d,i) {
      return d == 0 ? "" : d3.format(".0%")(d)
    })
  );

  svg5.append("g")
  .attr("class", "wpaAxis axis")
  // graphWidth5/2
  .attr("transform", "translate(" + [graphWidth5-margin5.right-19,0] + ")")
  .call(
    d3.axisRight(y5)
    .ticks(10, "%")
    .tickSize(7)
    .tickFormat(function(d,i) {
      return d == 0 ? "" : d3.format(".0%")(d)
    })
  );

  svg5.append("line")
  .attr("x1", 69)
  .attr("x2", 69)
  .attr("y1", 0)
  .attr("y2", graphHeight5)
  .style("stroke", "grey")
  .style("stroke-width", 1)
  .style("opacity", 0.5)

  svg5.append("line")
  .attr("x1", graphWidth5-69)
  .attr("x2", graphWidth5-69)
  .attr("y1", 0)
  .attr("y2", graphHeight5)
  .style("stroke", "grey")
  .style("stroke-width", 1)
  .style("opacity", 0.5)

  // text label 1 for the y axis
  svg5.append("text")
  .attr("transform", "rotate(-90)")
  .attr("class","label")
  .attr("y", 0 - margin5.left+40)
  .attr("x",0 - (graphHeight5 / 2))
  .attr("dy", "12px")
  .style("text-anchor", "middle")
  .text("Average Defense Win Probability (%)");

  // text label 2 for the y axis
  svg5.append("text")
  .attr("transform", "rotate(+90)")
  .attr("class","label")
  .attr("y", - graphWidth5-margin5.right/2+20)
  .attr("x", (graphHeight5 / 2))
  .attr("dy", "12px")
  .style("text-anchor", "middle")
  .text("Average QB Win Probability (%)");

  // ** Left column
  data.forEach(function(passer,i) {

    // ** Slope lines
    svg5.append("line")
    .attr("x1", 70)
    .attr("x2", graphWidth5-70)
    .attr("y1", passer.startY)
    .attr("y2", passer.endY)
    .attr("class", "line"+i)
    .style("stroke", teamAttributes[passer['team']]['color'])
    .style("stroke-width", passers.has(parseInt(passer.passerid)) ? 1.5 : 1)
    .style("opacity", passers.has(parseInt(passer.passerid)) ? 1 : 0.1)
    .on('mouseover', function() {
      d3.select(this).style("opacity", 1)
      tooltip5.html(function() {
        return tooltip5Html(passer)
      })
      tooltip5.show()
    })
    .on('mouseout', function() {
      d3.select(this)
      .style("opacity", passers.has(parseInt(passer.passerid)) ? 1 : 0.1)
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

      // swap brady + nfl average
      var tmp = data[1]
      data[1] = data[0]
      data[0] = tmp

    var max1 = d3.max(data, d => d.passerWPA);
    var max2 = d3.max(data, d => d.defenseWPA);
    maxWPA = Math.max(max1, max2);

    var min1 = d3.min(data, d => d.passerWPA);
    var min2 = d3.min(data, d => d.defenseWPA);
    minWPA = Math.min(min1, min2);

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
    .style("stroke-width", passers.has(parseInt(passer.passerid)) ? 1.5 : 1)

    svg5.selectAll(".line"+i)
    .on('mouseout', function() {
      d3.select(this)
      .style("opacity", passers.has(parseInt(passer.passerid)) ? 1 : 0.1)
      tooltip5.hide();
    })



    d3.selectAll(id + "key")
    .html(keyHtml(data.filter(function(d){return passers.has(parseInt(d.passerid))})));

  });
}

/* tooltip5 html */
function tooltip5Html(passer) {
  return "<img src=" + teamAttributes[passer.team].icon + ">" +
  "<div id='passer'>" + passer.passer +
  "</div><div id='team'>" + passer.team + "</div><br>" +
  formatPercent(passer.passerWPA - passer.defenseWPA) + " &Delta; in WPA" +
  "<br><br>" +
  formatPercent(passer.defenseWPA) + " Defense WPA <br>" +
  formatPercent(passer.passerWPA) + " Quarterback WPA <br>";
}
