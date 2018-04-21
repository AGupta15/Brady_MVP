var svg, y, x, line, area;
var graphHeight, graphWidth, margin, extent = [-21,21];
var tooltip;
var minTotal = 3
var pointBins = [3, 7, 10, 14, 17, 21]
var ticks = [6, 14, 5, 10, 10, 8]
// 3, 7, 10, 14, 17, 21+

function loadAccuracyByPoint(graphType, callback) {
    d3.csv("Data/graph3.csv", function (error, data) {
      if (error) { console.log(error); }
      

      data = d3.nest()
        .key(function(d) { return d.passerid; })
        .entries(data);

      var averageBins = {};

      data = data.map(function(d) {
        var passes = d3.nest()
            .key(function(v) { return v.scorediff; })
            .rollup(function(v) { 
              var d = v[0].scorediff;
              var ints = d3.sum(v, function(p) { return p.int; });
              var tds = d3.sum(v, function(p) { return p.td; });
              var total = v.length;
              var completions = d3.sum(v, function(p) { return p.completion == "Complete"; });

              if(d in averageBins) {
                averageBins[d].completed += completions;
                averageBins[d].total += total;
                averageBins[d].ints += ints;
                averageBins[d].tds += tds;
              } else {
                averageBins[d] = {
                  "completed": 0, 
                  "total": 0,
                  "ints": 0,
                  "tds": 0,
                  "percentage": 0,
                  passer: "Average",
                  team: "NFL",
                  "passerid": data.length,
                };
              }
            return {
                  int: ints,
                  td: tds,
                  total: total,
                  completed: completions,
                  percentage: completions / total,
                  passer: v[0].passer,
                  team: v[0].team,
                  passerid: v[0].passerid,
              };
            })
            .entries(d.values);
        
        passes.sort(function(a, b){ 
          return parseInt(a.key) - parseInt(b.key)});

        return {
          "passer": d.values[0].passer,
          "passerid": d.key,
          "passes": passes,
          "team": d.values[0].team,
        }
      });

      var averagePasses = []
      Object.keys(averageBins).forEach(function(d) {
        averageBins[d].percentage = averageBins[d].completed / averageBins[d].total;
        averagePasses.push({
            key: d,
            value: averageBins[d]
        });
      });

      averagePasses.sort(function(a, b){ 
          return parseInt(a.key) - parseInt(b.key)});
      
      data.push({
        passer: "Average",
        team: "NFL",
        "passerid": data.length,
        "passes": averagePasses})

      setupPointSpreadPicker(pointBins);
      callback(graphType, data);
    });  
}

function plotAccuracyByPoint(graphType, width, height) {
  
    var id = graphType.viz_id;
    var passers = graphType.passers;
    var data = graphType.data;
    
    console.assert(passers.size <= 3, "More than 3 passers");

    var passer_array = Array.from(passers);
    passer_array.sort(function(a, b){return a - b});

    data = data.filter( function(d) { return passers.has(parseInt(d.passerid))});

    margin = {top: 50, right: 50, bottom: 50, left: 50};
    graphWidth = width - margin.left - margin.right;
    graphHeight = height - margin.top - margin.bottom;

    var innerGraphPadding = 30;

    svg = d3.select(id)
                  .append("svg")
                  .attr("width", width)
                  .attr("height", height)
                  .append("g")
                  .attr("transform", 
                        "translate(" + margin.left + "," + margin.top + ")");

    tooltip = d3.tip()
                  .attr('class', 'd3-tip')
                  .offset([-10, 0]);

    svg.call(tooltip);

    // key
    d3.selectAll(id + "key")
      .html(keyHtml(data));

    x = d3.scaleLinear()
      .domain(extent)
      .range([0,graphWidth]);

    y = d3.scaleLinear()
      .domain([0, 1])
      .range([graphHeight, 0]);

    line = d3.line()
      .x(function(d) { 
        return x(parseInt(d.key)); })
      .y(function(d) { 
        return y(d.value.percentage); })
      .curve(d3.curveLinear) // apply smoothing to the line

    area = d3.area()
    .x(function(d) { 
      return x(parseInt(d.key)); })
    .y0(function(d,i) { 
      return y(0) })
    .y1(function(d) { return y(d.value.percentage); });

    // setup x axis

    svg
      .append("g")
      .attr("class", "xAxis pointSpreadAxis axis")
      .attr("transform", "translate(" + [0,graphHeight] + ")")
      .call(
        d3.axisBottom(x)
        .tickPadding(6)
        .ticks(ticks[pointBins.indexOf(extent[1])])
        .tickSize(2)
        .tickFormat(function(d,i) {
          return d
        }));

    // setup y axis
    svg.append("g")
      .attr("class", "pointSpreadAxis axis")
      .attr("transform", "translate(" + [graphWidth/2,0] + ")")
      .call(
        d3.axisLeft(y)
        .ticks(5, "%")
        .tickSize(2)
        .tickFormat(function(d,i) {
          return d == 0 ? "" : d3.format(".0%")(d)
        })
      );

    // text label for the y axis
    svg.append("text")
      .attr("transform", "rotate(-90)")
      .attr("class","label")
      .attr("y", 0 - margin.left)
      .attr("x",0 - (graphHeight / 2))
      .attr("dy", "12px")
      .style("text-anchor", "middle")
      .text("Pass Completion Percentage");

    // text label for the x axis
    svg.append("text")
        .attr("transform",
              "translate(" + (graphWidth/2) + " ," +
                             (graphHeight + margin.top - 10) + ")")
        .style("text-anchor", "middle")
        .attr("class","label")
        .text("Point Spread");

    // add title

    svg.append("text")
        .attr("x", graphWidth/2)
        .attr("y", 0 - (margin.top / 2))
        .classed("title", true)
        .text("Quarterback Accuracy by Point Spread");


    data.forEach(function(passer,i) {
      var passes = filterPasses(passer);

      svg.append("path")
        .data([passer])
        .attr("class", "area" + i)
        .style("opacity",0.15)
        .style("fill", teamAttributes[passer.team].color)
        .attr("d", area(passes));

      svg.append("path")
        .data([passer])
        .attr("class", "line" + i)
        .style("opacity",1)
        .style("stroke", teamAttributes[passer.team].color)
        .style("stroke-width",".25px")
        .style("fill","none")
        .attr("d", line(passes));

      svg.selectAll(".circle" + i)
        .data(passes)
        .enter()
        .append("circle")
        .attr("class", "circle" + i)
        .style("opacity",1)
        .style("fill", teamAttributes[passer.team].color)
        .style("r","1px")
        .style("stroke-width", "15px")
        .style("stroke", "white")
        .style("stroke-opacity","0")
        .attr("cx", function(d) {
          return x(parseInt(d.key));
        })
        .attr("cy", function(d) {
          return y(d.value.percentage);
        })
        .on('mouseover', function(b) {
          tooltip.html(function() {
            return toolTipHtml(b.value, b.key, b.value)
          })
          tooltip.show()})
        .on('mouseout', tooltip.hide);
    });
}


/* replots the points on the graph and animates them .. assumes graph is already made */
function replotAccuracyByPoint(graphType, spread=null) {

  var id = graphType.viz_id;
  var passers = graphType.passers;
  var data = graphType.data;

  console.assert(passers.size <= 3, "More than 3 passers");

  // sort array
  var passer_array = Array.from(passers);
  passer_array.sort(function(a, b){return a - b});

  if (spread != null) {
    changeXAxis(spread);
  }

  data = graphType.data.filter( function(d) { return passers.has(parseInt(d.passerid))});

  // key
    d3.selectAll(id + "key")
      .html(keyHtml(data));

  // add in data if we don't have enough passers
  while(data.length < 3) {
    data.push(
    { passer: "fake",
      passes: d3.range(extent[0],extent[1]).map(function(p) {
        return { 
          key: p, 
          value: { 
            percentage: 0,
            total: minTotal + 1
           } 
        }
      })
    })
  }

  // plot points

  data.forEach(function(passer,i) {
    passes = filterPasses(passer);

    svg.selectAll(".area" + i)
        .data([passer])
        .transition()
        .duration(transitionDuration)
        .style("fill", function () {
          if(passer.passer == "fake") {
            return "white"
          }
          return teamAttributes[passer.team].color})
        .style("opacity", function () {
          if(passer.passer == "fake") {
            return 0
          }
          return 0.15
        })
        .attr("d", area(passes)); 

      svg.selectAll(".line" + i)
        .data([passer])
        .transition()
        .duration(0)
        .style("opacity","0")
        .style("stroke", function () {
          return (passer.passer == "fake") ? "none" : teamAttributes[passer.team].color})
        .attr("d", line(passes));

      svg.selectAll(".line" + i)
        .data([passer])
        .transition()
        .delay(.75 * transitionDuration)
        .duration(.25 * transitionDuration)
        .style("opacity", function () {
          return (passer.passer == "fake") ? 0 : 1 });
      
      svg.selectAll(".circle" + i).remove()

      svg.selectAll(".circle" + i)
        .data(passes)
        .enter()
        .append("circle")
        .attr("class", "circle" + i)
        .style("opacity", 0)
        .style("fill", function () {
          return (passer.passer == "fake") ? "none" : teamAttributes[passer.team].color})
        .style("r","1px")
        .style("stroke-width", "15px")
        .style("stroke", "white")
        .style("stroke-opacity","0")
        .attr("cx", function(d) {
          return x(parseInt(d.key));
        })
        .attr("cy", function(d) {
          return y(d.value.percentage);
        })
        .on('mouseover', function(b) {
          if(passer.passer == "fake") { return }
          tooltip.html(function() {
            return toolTipHtml(b.value, b.key, b.value)
          })
          tooltip.show()})
        .on('mouseout', tooltip.hide);

      svg.selectAll(".circle" + i)
        .transition()
        .delay(.75 * transitionDuration)
        .duration(.25 * transitionDuration)
        .style("opacity", 1);
  });
}

function changeXAxis(spread) {
  extent = spread
  x.domain(extent)

  svg.select(".xAxis")
      .transition()
      .duration(transitionDuration)
      .call(
        d3.axisBottom(x)
        .ticks(ticks[pointBins.indexOf(spread[1])])
        .tickPadding(6)
        .tickSize(2)
        .tickFormat(function(d,i) {
          return d
  }));
}

function filterPasses(passer) {
  return passer.passes.slice().filter(function(p) { 
            return parseInt(p.key) <= extent[1] && parseInt(p.key) >= extent[0] && p.value.total >= minTotal
  });
}

function formatPointSpread(pointSpread) {
  if (pointSpread < 0) {
    return "Down by " + Math.abs(pointSpread)
  } else if (pointSpread > 0) {
    return "Ahead by " + pointSpread
  } else {
    return "Tied"
  }
}

/* tooltip html */
function toolTipHtml(passer, pointSpread, passes) {
  return "<img src=" + teamAttributes[passes.team].icon + ">" +
  "<div id='passer'>" + passes.passer + "</div><div id='team'>" + passes.team + "</div><br>" + formatPointSpread(pointSpread) + "<br><br>" +
  formatPercent(passes.percentage) + " Completion Percentage <br>" +
  passes.completed + " Total Completions <br>" +
  passes.total + " Total Attempts <br>" +
  passes.td + " Touchdowns <br>" +
  passes.int + " Interceptions"
}