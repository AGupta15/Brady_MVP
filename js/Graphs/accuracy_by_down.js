var downs = [1,2,3,4];
var svg, x0, x1, y, line;
var graphHeight, graphWidth, margin;
var tooltip;
var downTicks = ["1","2","3","4"]

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
            "ints": 0,
            "tds": 0,
            "percentage": 0,
            passer: "Average",
            team: "NFL",
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
              averageBins[v[0].down].ints += ints;
              averageBins[v[0].down].tds += tds;
              return {
                  int: ints,
                  td: tds,
                  total: total,
                  completed: completions,
                  percentage: completions / total,
                  passer: d.values[0].passer,
                  team: d.values[0].team,
                  passerid: d.key,
              };
            })
            .entries(d.values)
            .filter(pass => pass.key != "NA");
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
        if(d != "NA") {
          averagePasses.push({
            key: d,
            value: averageBins[d]
          });
        }
      });
      
      data.push({
        passer: "Average",
        team: "NFL",
        "passerid": data.length,
        "passes": averagePasses})

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

    x = d3.scalePoint()
      .domain(downs)
      .range([innerGraphPadding,graphWidth - innerGraphPadding]);

    y = d3.scaleLinear()
      .domain([0, 1])
      .range([graphHeight, 0]);

    line = d3.svg.line()
    .x(function(d) { 
      console.log(d);
      return x(d.key); })
    .y(function(d) { 
      return y(d.value.percentage); });

    // setup x axis

    svg
      .append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(" + [0,graphHeight] + ")")
      .call(
        d3.axisBottom(x)
        .ticks(downs)
        .tickPadding(6)
        .tickFormat(function(d,i) {
          return downTicks[i]
        }));

    // setup y axis
    svg.append("g")
      .attr("class", "y axis")
      .call(
        d3.axisLeft(y)
        .ticks(10, "%")
        .tickSizeInner(-graphWidth)
        .tickSizeOuter(0)
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
        .text("Pass Down");

    // add title

    svg.append("text")
        .attr("x", graphWidth/2)
        .attr("y", 0 - (margin.top / 2))
        .classed("title", true)
        .text("Quarterback Accuracy by Down");


    // plot points

    data.forEach(function(passer,i) {
      svg.append("path")
        .data([passer])
        .attr("class", "line" + i)
        .style("fill","none")
        .style("opacity",".5")
        .style("stroke", teamAttributes[passer.team].color)
        .style("stroke-width","2px")
        .attr("d", function(d) { 
          return line(d.passes) 
        })
        // .on('mouseover', function(b) {
        //   tooltip.html(function() {
        //     return toolTipHtml(b.passes, b.passes.key, b.passes.value)
        //   })
        //   tooltip.show()})
        // .on('mouseout', tooltip.hide);

      svg.selectAll(".circle" + i)
        .data(passer.passes)
        .enter()
        .append("circle")
        .attr("class", "circle" + i)
        .attr("r","4px")
        .style("fill", teamAttributes[passer.team].color)
        .attr("cy", function(b) { 
          return y(b.value.percentage); })
        .attr("cx", function(b) { 
          return x(b.key); 
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
function replotAccuracyByDown(graphType) {

  var id = graphType.viz_id;
  var passers = graphType.passers;
  var data = graphType.data;

  console.assert(passers.size <= 3, "More than 3 passers");

  // sort array
  var passer_array = Array.from(passers);
  passer_array.sort(function(a, b){return a - b});


  data = graphType.data.filter( function(d) { return passers.has(parseInt(d.passerid))});

  // add in data if we don't have enough passers
  while(data.length < 3) {
    data.push(
    { passer: "fake",
      passes: data[0].passes.map(function(p) {
        return { 
          key: p.key, 
          value: { percentage: 0 } 
        }
      })
    })
  }

  // plot points

  data.forEach(function(passer,i) {
    if (passer.passer == "fake") {
      svg.selectAll(".circle" + i)
      .data(passer.passes)
      .transition()
      .duration(transitionDuration)
      .attr("r","0px")
      .attr("cy", function(b) { 
        return graphHeight
      });
    } else {
      svg.selectAll(".circle" + i)
        .data(passer.passes)
        .transition()
        .duration(transitionDuration)
        .attr("r","4px")
        .style("fill", teamAttributes[passer.team].color)
        .attr("cy", function(b) { 
          return y(b.value.percentage);
        });
    }
    svg.selectAll(".line" + i)
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
          console.log(d);
          return line(d.passes) 
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
function toolTipHtml(passer, down, passes) {
  return "<img src=" + teamAttributes[passes.team].icon + ">" +
  "<div id='passer'>" + passes.passer + "</div><div id='team'>" + passes.team + "</div><br>" + suffix(parseInt(down)) + " down<br><br>" +
  formatPercent(passes.percentage) + " Completion Percentage <br>" +
  passes.completed + " Total Completions <br>" +
  passes.total + " Total Attempts <br>" +
  passes.td + " Touchdowns <br>" +
  passes.int + " Interceptions"
}