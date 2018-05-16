var downs = [1,2,3,4];
var svg1, y2, line;
var graphHeight1, graphWidth1, margin1;
var tooltip2;
var downTicks = ["1st","2nd","3rd","4th"]
var minTotalForDowns = 3

function loadAccuracyByDown(graphType, callback) {
    d3.csv("Data/graph2.csv", function (error, data) {
      if (error) { console.log(error); }


      data = d3.nest()
        .key(function(d) { return d.passerid; })
        .entries(data);

      var averageBins = {
        "1": null,
        "2": null,
        "3": null,
        "NA": null,
        "4": null
      }

      Object.keys(averageBins).forEach(function(d,i) {
        averageBins[d] = {
            "completed": 0,
            "total": 0,
            "int": 0,
            "td": 0,
            "percentage": 0,
            passer: "Average",
            team: "NFL",
            "show": true,
            "passerid": data.length,
        };
      });

      data = data.map(function(d) {
        var passes = d3.nest()
            .key(function(v) { return v.down; })
            .rollup(function(v) {
              var ints = d3.sum(v, function(p) { return p.int; });
              var tds = d3.sum(v, function(p) { return p.td; });
              var total = v.length;
              var completions = d3.sum(v, function(p) { return p.completion == "Complete"; });
              averageBins[v[0].down].completed += completions;
              averageBins[v[0].down].total += total;
              averageBins[v[0].down].int += ints;
              averageBins[v[0].down].td += tds;
              return {
                  int: ints,
                  td: tds,
                  total: total,
                  completed: completions,
                  percentage: completions / total,
                  passer: d.values[0].passer,
                  team: d.values[0].team,
                  passerid: d.key,
                  show: total >= minTotalForDowns
              };
            })
            .entries(d.values)
            .filter(pass => {
              return pass.key != "NA"});

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
        averageBins[d].td = d3.round(averageBins[d].td / data.length, 1)
        averageBins[d].int = d3.round(averageBins[d].int / data.length, 1)
        if(d != "NA") {
          averagePasses.push({
            key: d,
            value: averageBins[d]
          });
        }
      });

      ranks = []
      data.forEach(function(d) {
        // var zero = d.passes[0];
        var oneP = Object.values(d.passes[0])[1].percentage;
        var twoP = Object.values(d.passes[1])[1].percentage;
        var threeP = Object.values(d.passes[2])[1].percentage;
        var fourP = 0
        try {
          fourP = Object.values(d.passes[3])[1].percentage;
        }
        catch(error){
          // var fourP = 0
        }
        // console.log(d.passes[3])
        var entry = {
          "passer": d.passer,
          "one": oneP,
          "two": twoP,
          "three": threeP,
          "four": fourP,
          "Rank": 0
        }
        ranks.push(entry);
      });

      ranks.sort(compare0).reverse();
      for (i=0; i<ranks.length; i++){
        ranks[i]["Rank"] = ranks[i]["Rank"] + (i+1)
      }
      ranks.sort(compare1).reverse();
      for (i=0; i<ranks.length; i++){
        ranks[i]["Rank"] = ranks[i]["Rank"] + (i+1)
      }
      ranks.sort(compare2).reverse();
      for (i=0; i<ranks.length; i++){
        ranks[i]["Rank"] = ranks[i]["Rank"] + (i+1)
      }
      ranks.sort(compare3).reverse();
      for (i=0; i<ranks.length; i++){
        ranks[i]["Rank"] = ranks[i]["Rank"] + (i+1)
      }
      for (i=0; i<ranks.length; i++){
        ranks[i]["Rank"] = ranks[i]["Rank"]/4.0
      }
      ranks.sort(compare4);
      // console.log(ranks)

      data.reverse()
      data.push({
        passer: "Average",
        team: "NFL",
        "passerid": data.length,
        "passes": averagePasses})
      data.reverse()

      // swap brady + nfl average
      var tmp = data[1]
      data[1] = data[0]
      data[0] = tmp

      callback(graphType, data);
    });
}

function plotAccuracyByDown(graphType, width, height) {

    var id = graphType.viz_id;
    var passers = graphType.passers;
    var data = graphType.data;

    console.assert(passers.size <= 3, "More than 3 passers");

    var passer_array = Array.from(passers).sort();

    data = data.filter( function(d) { return passers.has(parseInt(d.passerid))});

    margin1 = {top: 50, right: 50, bottom: 50, left: 50};
    graphWidth1 = width - margin1.left - margin1.right;
    graphHeight1 = height - margin1.top - margin1.bottom;

    var innerGraphPadding = 30;

    svg1 = d3.select(id)
                  .append("svg")
                  .attr("width", width)
                  .attr("height", height)
                  .append("g")
                  .attr("transform",
                        "translate(" + margin1.left + "," + margin1.top + ")");

    tooltip2 = d3.tip()
                  .attr('class', 'd3-tip')
                  .offset([-10, 0]);

    svg1.call(tooltip2);

    // key
    d3.selectAll(id + "key")
      .html(keyHtml(data));

    x = d3.scalePoint()
      .domain(downs)
      .range([innerGraphPadding,graphWidth1 - innerGraphPadding]);

    y2 = d3.scaleLinear()
      .domain([0, 1])
      .range([graphHeight1, 0]);

    line = d3.svg.line()
    .x(function(d) {
      return x(d.key); })
    .y(function(d) {
      return y2(d.value.percentage); });

    // setup x axis

    svg1
      .append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(" + [0,graphHeight1] + ")")
      .call(
        d3.axisBottom(x)
        .ticks(downs)
        .tickPadding(6)
        .tickFormat(function(d,i) {
          return downTicks[i]
        }));

    // setup y axis
    svg1.append("g")
      .attr("class", "y axis")
      .call(
        d3.axisLeft(y2)
        .ticks(5, "%")
        .tickSizeInner(-graphWidth1)
        .tickSizeOuter(0)
      );

    // text label for the y axis
    svg1.append("text")
      .attr("transform", "rotate(-90)")
      .attr("class","label")
      .attr("y", 0 - margin1.left)
      .attr("x",0 - (graphHeight1 / 2))
      .attr("dy", "12px")
      .style("text-anchor", "middle")
      .text("Pass Completion Percentage");

    // text label for the x axis
    svg1.append("text")
        .attr("transform",
              "translate(" + (graphWidth1/2) + " ," +
                             (graphHeight1 + margin1.top - 10) + ")")
        .style("text-anchor", "middle")
        .attr("class","label")
        .text("Pass Down");

    // add title

    // svg1.append("text")
    //     .attr("x", graphWidth1/2)
    //     .attr("y", 0 - (margin1.top / 2))
    //     .classed("title", true)
    //     .text("Quarterback Accuracy by Down");


    // plot points

    data.forEach(function(passer,i) {
      svg1.append("path")
        .data([passer])
        .attr("class", "line" + i)
        .style("fill","none")
        .style("opacity",".5")
        .style("stroke", teamAttributes[passer.team].color)
        .style("stroke-width","2px")
        .attr("d", function(d) {
          return line(d.passes.filter(p => p.value.show))
        })
        // .on('mouseover', function(b) {
        //   tooltip2.html(function() {
        //     return tooltip2Html(b.passes, b.passes.key, b.passes.value)
        //   })
        //   tooltip2.show()})
        // .on('mouseout', tooltip2.hide);

      svg1.selectAll(".circle" + i)
        .data(passer.passes)
        .enter()
        .append("circle")
        .attr("class", "circle" + i)
        .attr("r","4px")
        .style("opacity", b => b.value.show ? 1 : 0)
        .style("fill", teamAttributes[passer.team].color)
        .attr("cy", function(b) {
          return y2(b.value.percentage); })
        .attr("cx", function(b) {
          return x(b.key);
        })
        .on('mouseover', function(b) {
          tooltip2.html(function() {
            return toolTipHtml2(b.value, b.key, b.value)
          })
          tooltip2.show()})
        .on('mouseout', tooltip2.hide);
    });
}


/* replots the points on the graph and animates them .. assumes graph is already made */
function replotAccuracyByDown(graphType) {

  var id = graphType.viz_id;
  var passers = graphType.passers;
  var data = graphType.data;

  console.assert(passers.size <= 3, "More than 3 passers");

  // sort array
  var passer_array = Array.from(passers);
  passer_array.sort(function(a, b){return a - b});

  data = graphType.data.filter( function(d) { return passers.has(parseInt(d.passerid))});

  // key
    d3.selectAll(id + "key")
      .html(keyHtml(data));

  // add in data if we don't have enough passers
  while(data.length < 3) {
    data.push(
    { passer: "fake",
      passes: data[0].passes.map(function(p) {
        return {
          key: p.key,
          value: { percentage: 0 },
          show: false
        }
      })
    })
  }

  // plot points

  data.forEach(function(passer,i) {
    if (passer.passer == "fake") {
      svg1.selectAll(".circle" + i)
      .data(passer.passes)
      .transition()
      .duration(transitionDuration)
      .attr("r","0px")
      .style("opacity", b => b.value.show ? 1 : 0)
      .attr("cy", function(b) {
        return graphHeight1
      });
    } else {
      svg1.selectAll(".circle" + i)
        .data(passer.passes)
        .transition()
        .duration(transitionDuration)
        .attr("r","4px")
        .style("opacity", b => b.value.show ? 1 : 0)
        .style("fill", teamAttributes[passer.team].color)
        .attr("cy", function(b) {
          return y2(b.value.percentage);
        });
    }
    svg1.selectAll(".line" + i)
        .data([passer])
        .transition()
        .duration(transitionDuration)
        .style("stroke", function () {
          if(passer.passer == "fake") {
            return "white"
          }
          return teamAttributes[passer.team].color})
        .style("opacity", function () {
          if(passer.passer == "fake") {
            return 0
          }
          return 1})
        .attr("d", function(d) {
          return line(d.passes.filter(p => p.value.show))
    });
  });


}

/* taken from https://stackoverflow.com/questions/13627308/add-st-nd-rd-and-th-ordinal-suffix-to-a-number */
function suffix(i) {
    var j = i % 10,
        k = i % 100;
    if (j == 1 && k != 11) {
        return i + "st";
    }
    if (j == 2 && k != 12) {
        return i + "nd";
    }
    if (j == 3 && k != 13) {
        return i + "rd";
    }
    return i + "th";
}

/* tooltip html */
function toolTipHtml2(passer, down, passes) {
  return "<img src=" + teamAttributes[passer.team].icon + ">" +
  "<div id='passer'>" + passes.passer + "</div><div id='team'>" + passes.team + "</div><br>" + suffix(parseInt(down)) + " down<br><br>" +
  formatPercent(passes.percentage) + " Completion Percentage <br>" +
  passes.completed + " Total Completions <br>" +
  passes.total + " Total Attempts <br>" +
  passes.td + " Touchdowns <br>" +
  passes.int + " Interceptions"
}

function formatPercent(p) {
  return d3.format(".1%")(p);
}

function compare0(a,b) {
  if (a["one"] < b["one"])
    return -1;
  if (a["one"] > b["one"])
    return 1;
  return 0;
}

function compare1(a,b) {
  if (a["two"] < b["two"])
    return -1;
  if (a["two"] > b["two"])
    return 1;
  return 0;
}
function compare2(a,b) {
  if (a["three"] < b["three"])
    return -1;
  if (a["three"] > b["three"])
    return 1;
  return 0;
}
function compare3(a,b) {
  if (a["four"] < b["four"])
    return -1;
  if (a["four"] > b["four"])
    return 1;
  return 0;
}

function compare4(a,b) {
  if (a["Rank"] < b["Rank"])
    return -1;
  if (a["Rank"] > b["Rank"])
    return 1;
  return 0;
}
