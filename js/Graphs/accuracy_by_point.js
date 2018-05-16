var svg2, y3, x2, line3, area3;
var graphHeight3, graphWidth3, margin3, extent3 = [-21,21];
var tooltip3;
var minTotal = 3
var pointBins = [3, 7, 10, 14, 17, 21]
var ticks3 = [6, 14, 5, 10, 10, 8]

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
                averageBins[d].int += ints;
                averageBins[d].td += tds;
              } else {
                averageBins[d] = {
                  "completed": 0,
                  "total": 0,
                  "int": 0,
                  "td": 0,
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

      data.reverse()
      data.push({
        passer: "Average",
        team: "NFL",
        "passerid": data.length,
        "passes": averagePasses})
      data.reverse()

      ranks = []
      data.forEach(function(d) {

        var s0c = 0.0;
        var s0a = 0.0;
        var s7c = 0.0;
        var s7a = 0.0;
        var s14c = 0.0;
        var s14a = 0.0;
        var s21c = 0.0;
        var s21a = 0.0;
        var s22c = 0.0;
        var s22a = 0.0;

        d.passes.forEach(function(pt){
          var passes = Object.values(pt);
          var spread = parseInt(passes[0]);
          if (Math.abs(spread) > 21){
            s22a = s22a + passes[1]['total'];
            s22c = s22c + passes[1]['completed'];
          }
          else if (Math.abs(spread) > 14){
            s21a = s21a + passes[1]['total'];
            s21c = s21c + passes[1]['completed'];
          }
          else if (Math.abs(spread) > 7){
            s14a = s14a + passes[1]['total'];
            s14c = s14c + passes[1]['completed'];
          }

          else if (Math.abs(spread) > 0){
            s7a = s7a + passes[1]['total'];
            s7c = s7c + passes[1]['completed'];
          }
          else { //0
            s0a = s0a + passes[1]['total'];
            s0c = s0c + passes[1]['completed'];
          }
        });

        // console.log(d.passes[3])
        var entry = {
          "passer": d.passer,
          "z0": s0c/s0a,
          "z7": s7c/s7a,
          "z14": s14c/s14a,
          "z21": s21c/s21a,
          "z22": s22c/s22a,
          "Rank": 0
        }
        ranks.push(entry);
      });

      ranks.sort(function(a,b) { return a.z0 - b.z0; }).reverse();
      for (i=0; i<ranks.length; i++){
        ranks[i]["Rank"] = ranks[i]["Rank"] + (i+1)
      }
      ranks.sort(function(a,b) { return a.z7 - b.z7; }).reverse();
      for (i=0; i<ranks.length; i++){
        ranks[i]["Rank"] = ranks[i]["Rank"] + (i+1)
      }
      ranks.sort(function(a,b) { return a.z14 - b.z14; }).reverse();
      for (i=0; i<ranks.length; i++){
        ranks[i]["Rank"] = ranks[i]["Rank"] + (i+1)
      }
      // ranks.sort(function(a,b) { return a.z21 - b.z21; }).reverse();
      // for (i=0; i<ranks.length; i++){
      //   ranks[i]["Rank"] = ranks[i]["Rank"] + (i+1)
      // }
      // ranks.sort(function(a,b) { return a.z22 - b.z22; }).reverse();
      // for (i=0; i<ranks.length; i++){
      //   ranks[i]["Rank"] = ranks[i]["Rank"] + (i+1)
      // }
      for (i=0; i<ranks.length; i++){
        ranks[i]["Rank"] = ranks[i]["Rank"]/3.0
      }
      ranks.sort(compare5);
      // console.log(ranks)

      // swap brady + nfl average
      var tmp = data[1]
      data[1] = data[0]
      data[0] = tmp

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

    margin3 = {top: 50, right: 50, bottom: 50, left: 50};
    graphWidth3 = width - margin3.left - margin3.right;
    graphHeight3 = height - margin3.top - margin3.bottom;

    var innerGraphPadding = 30;

    svg2 = d3.select(id)
                  .append("svg")
                  .attr("width", width)
                  .attr("height", height)
                  .append("g")
                  .attr("transform",
                        "translate(" + margin3.left + "," + margin3.top + ")");

    tooltip3 = d3.tip()
                  .attr('class', 'd3-tip')
                  .offset([-10, 0]);

    svg2.call(tooltip3);

    // key
    d3.selectAll(id + "key")
      .html(pointKeyHtml(data));

    x2 = d3.scaleLinear()
      .domain(extent3)
      .range([0,graphWidth3]);

    y3 = d3.scaleLinear()
      .domain([0, 1])
      .range([graphHeight3, 0]);

    line3 = d3.line()
      .x(function(d) {
        return x2(parseInt(d.key)); })
      .y(function(d) {
        return y3(d.value.percentage); })
      .curve(d3.curveLinear) // apply smoothing to the line

    area3 = d3.area()
    .x(function(d) {
      return x2(parseInt(d.key)); })
    .y0(function(d,i) {
      return y3(0) })
    .y1(function(d) { return y3(d.value.percentage); });

    // setup x axis

    svg2
      .append("g")
      .attr("class", "xAxis pointSpreadAxis axis")
      .attr("transform", "translate(" + [0,graphHeight3] + ")")
      .call(
        d3.axisBottom(x2)
        .tickPadding(6)
        .ticks(ticks3[pointBins.indexOf(extent3[1])])
        .tickSize(2)
        .tickFormat(function(d,i) {
          return d
        }));

    // setup y axis
    svg2.append("g")
      .attr("class", "pointSpreadAxis axis")
      .attr("transform", "translate(" + [graphWidth3/2,0] + ")")
      .call(
        d3.axisLeft(y3)
        .ticks(5, "%")
        .tickSize(2)
        .tickFormat(function(d,i) {
          return d == 0 ? "" : d3.format(".0%")(d)
        })
      );

    // text label for the y axis
    svg2.append("text")
      .attr("transform", "rotate(-90)")
      .attr("class","label")
      .attr("y", 0 - margin3.left)
      .attr("x",0 - (graphHeight3 / 2))
      .attr("dy", "12px")
      .style("text-anchor", "middle")
      .text("Pass Completion Percentage");

    // text label for the x axis
    svg2.append("text")
        .attr("transform",
              "translate(" + (graphWidth3/2) + " ," +
                             (graphHeight3 + margin3.top - 10) + ")")
        .style("text-anchor", "middle")
        .attr("class","label")
        .text("Point Spread");

    // add title
    //
    // svg2.append("text")
    //     .attr("x", graphWidth3/2)
    //     .attr("y", 0 - (margin3.top / 2))
    //     .classed("title", true)
    //     .text("Quarterback Accuracy by Point Spread");


    data.forEach(function(passer,i) {
      var passes = filterPasses(passer);

      svg2.append("path")
        .data([passer])
        .attr("class", "area" + i)
        .style("opacity",0.15)
        .style("fill", teamAttributes[passer.team].color)
        .attr("d", area3(passes));

      svg2.append("path")
        .data([passer])
        .attr("class", "line" + i)
        .style("opacity",1)
        .style("stroke", teamAttributes[passer.team].color)
        .style("stroke-width",".25px")
        .style("fill","none")
        .attr("d", line3(passes));

      svg2.selectAll(".circle" + i)
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
          return x2(parseInt(d.key));
        })
        .attr("cy", function(d) {
          return y3(d.value.percentage);
        })
        .on('mouseover', function(b) {
          tooltip3.html(function() {
            return tooltip3Html(b.value, b.key, b.value)
          })
          tooltip3.show()})
        .on('mouseout', tooltip3.hide);
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
      .html(pointKeyHtml(data));

  // add in data if we don't have enough passers
  while(data.length < 3) {
    data.push(
    { passer: "fake",
      passes: d3.range(extent3[0],extent3[1]).map(function(p) {
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

    svg2.selectAll(".area" + i)
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
        .attr("d", area3(passes));

      svg2.selectAll(".line" + i)
        .data([passer])
        .transition()
        .duration(0)
        .style("opacity","0")
        .style("stroke", function () {
          return (passer.passer == "fake") ? "none" : teamAttributes[passer.team].color})
        .attr("d", line3(passes));

      svg2.selectAll(".line" + i)
        .data([passer])
        .transition()
        .delay(.75 * transitionDuration)
        .duration(.25 * transitionDuration)
        .style("opacity", function () {
          return (passer.passer == "fake") ? 0 : 1 });

      svg2.selectAll(".circle" + i).remove()

      svg2.selectAll(".circle" + i)
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
          return x2(parseInt(d.key));
        })
        .attr("cy", function(d) {
          return y3(d.value.percentage);
        })
        .on('mouseover', function(b) {
          if(passer.passer == "fake") { return }
          tooltip3.html(function() {
            return tooltip3Html(b.value, b.key, b.value)
          })
          tooltip3.show()})
        .on('mouseout', tooltip3.hide);

      svg2.selectAll(".circle" + i)
        .transition()
        .delay(.75 * transitionDuration)
        .duration(.25 * transitionDuration)
        .style("opacity", 1);
  });
}

function changeXAxis(spread) {
  extent3 = spread
  x2.domain(extent3)

  svg2.select(".xAxis")
      .transition()
      .duration(transitionDuration)
      .call(
        d3.axisBottom(x2)
        .ticks(ticks3[pointBins.indexOf(spread[1])])
        .tickPadding(6)
        .tickSize(2)
        .tickFormat(function(d,i) {
          return d
  }));
}

function filterPasses(passer) {
  return passer.passes.slice().filter(function(p) {
            return parseInt(p.key) <= extent3[1] && parseInt(p.key) >= extent3[0] && p.value.total >= minTotal
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

/* tooltip3 html */
function tooltip3Html(passer, pointSpread, passes) {
  return "<img src=" + teamAttributes[passes.team].icon + ">" +
  "<div id='passer'>" + passes.passer + "</div><div id='team'>" + passes.team + "</div><br>" + formatPointSpread(pointSpread) + "<br><br>" +
  formatPercent(passes.percentage) + " Completion Percentage <br>" +
  passes.completed + " Total Completions <br>" +
  passes.total + " Total Attempts <br>" +
  passes.td + (passes.passer == "Average" ? " Total" : "") + " Touchdowns <br>" +
  passes.int + (passes.passer == "Average" ? " Total" : "") + " Interceptions"
}

function compare0(a,b) {
  if (a["0"] < b["0"])
    return -1;
  if (a["0"] > b["0"])
    return 1;
  return 0;
}

function compare1(a,b) {
  if (a["B7"] < b["B7"])
    return -1;
  if (a["B7"] > b["B7"])
    return 1;
  return 0;
}
function compare2(a,b) {
  if (a["B14"] < b["B14"])
    return -1;
  if (a["B14"] > b["B14"])
    return 1;
  return 0;
}
function compare3(a,b) {
  if (a["B21"] < b["B21"])
    return -1;
  if (a["B21"] > b["B21"])
    return 1;
  return 0;
}

function compare4(a,b) {
  if (a["B22"] < b["B22"])
    return -1;
  if (a["B22"] > b["B22"])
    return 1;
  return 0;
}

function compare5(a,b) {
  if (a["Rank"] < b["Rank"])
    return -1;
  if (a["Rank"] > b["Rank"])
    return 1;
  return 0;
}
