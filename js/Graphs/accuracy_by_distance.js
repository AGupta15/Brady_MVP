var svg, x0, x1, y, line;
var graphHeight, graphWidth, margin;
var tooltip;
var bins = [-1,0,10,20,30,40];
var binTicks = ["<0","0-10","10-20","20-30","30-40","40+"]

 function loadAccuracyByDistance(graphType, callback) {
    d3.csv("Data/graph1.csv", function (error, data) {
      if (error) { console.log(error); }

      data = d3.nest()
        .key(function(d) { return d.passerid; })
        .entries(data);

      data = data.map(function(d) {
        return {
          "passer": d.values[0].passer,
          "passerid": d.key,
          "passes": d.values,
          "team": d.values[0].team,
        }
      });

      var averageBins = {};

      data = data.map(function(d) {
        var completionPercentages = {};

        bins.forEach(function(b,i) {
          completionPercentages[i] = {
            "completed": 0,
            "total": 0,
            "int": 0,
            "td": 0,
            "percentage": 0
            };
            averageBins[i] = {
              "completed": 0,
              "total": 0,
              "int": 0,
              "td": 0,
              "percentage": 0
            };
        });
        d.passes.forEach( function(p) {
          var added = false;
          for(var i = 0; i < bins.length - 1; i++) {
            if(parseInt(p.airyards) < bins[i+1]) {
              addPass(completionPercentages,p,i);
              added = true;
              completionPercentages[i].int += parseInt(p.int)
              completionPercentages[i].td += parseInt(p.td)
              break;
            }
          }

          if(!added) {
            addPass(completionPercentages,p,bins.length-1);
          }

        });
        bins.forEach(function(bin,i) {
          var percentage = 0;
          if(completionPercentages[i].total > 0) {
            completionPercentages[i].percentage = completionPercentages[i].completed / completionPercentages[i].total;
          }
        });

        return {"passer": d.passer,
                "passerid": d.passerid,
                "team": d.team,
                "bins": completionPercentages}
    });
    bins.forEach(function(b,i) {
      averageBins[i].completed = d3.sum(data, function(d) {
        return d.bins[i].completed;
      }) / data.length;
      averageBins[i].total = d3.sum(data, function(d) {
        return d.bins[i].total;
      }) / data.length;
      averageBins[i].int = d3.sum(data, function(d) {
        return d.bins[i].int;
      }) / data.length;
      averageBins[i].td = d3.sum(data, function(d) {
        return d.bins[i].td;
      }) / data.length;




      averageBins[i].percentage = ((averageBins[i].total > 0) ?
            (averageBins[i].completed / averageBins[i].total) : 0);

      averageBins[i].total = d3.round(averageBins[i].total);
      averageBins[i].completed = d3.round(averageBins[i].completed);
      averageBins[i].int = d3.round(averageBins[i].int);
      averageBins[i].td = d3.round(averageBins[i].td);
    });
    data.push(
      {"passer": "Average",
        "passerid": data.length + 1,
        "team": "NFL",
        "bins": averageBins
      }
    );
    callback(graphType, data);
  });
}

// [id] div id to plot the graph in
// [passers] set of passer ids to plot
function plotAccuracyByDistance(graphType, width, height) {


    var id = graphType.viz_id;
    var passers = graphType.passers;
    var data = graphType.data;
    var max = d3.max(
      data.filter(d => d.passerid != data.length),
      function(d) {
        let arr = Object.values(d.bins);
        return d3.max(arr, b => b.total);
    });
    var extent = [0,max];

    console.assert(passers.size <= 3, "More than 3 passers");

    var passer_array = Array.from(passers).sort();

    data = data.filter( function(d) { return passers.has(parseInt(d.passerid))});

    margin = {top: 50, right: 50, bottom: 50, left: 50};
    graphWidth = width - margin.left - margin.right;
    graphHeight = height - margin.top - margin.bottom;


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

    // add axi

    x0 = d3.scaleBand()
      .domain(bins)
      .paddingInner(0.1)
      .range([0, graphWidth]);

     x1 = d3.scaleBand()
       .domain([0,1,2])
       .paddingInner(0.01)
       .range([0, x0.bandwidth()]);

    y = d3.scaleLinear()
      .domain([0, 1])
      .range([graphHeight, 0]);

    // line scale
    y1 = d3.scaleLinear()
      .domain([0,400])
      .range([graphHeight, 0]);

    // background image

    /*
    var backgroundImage = svg
                .append("svg:image")
                .attr("xlink:href", "fb.png")
                .attr("x", "0")
                .attr("y", "0")
                .attr("width", "500")
                .attr("height", "500");
    */

    // setup x axis

    svg
      .append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + graphHeight + ")")
      .call(
        d3.axisBottom(x0)
        .ticks(bins)
        .tickSize(0)
        .tickPadding(6)
        .tickFormat(function(d,i) {
          return binTicks[i]
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

    // total attempts y axis
    svg.append("g")
        .attr("class", "y axis")
        .attr("transform", "translate(" + (graphWidth) + " ,0)")
        .call(
          d3.axisRight(y1)
          .tickValues(d3.range(0,440,40))
          .tickSize(0)
          );

    // text label for the x axis
    svg.append("text")
        .attr("transform",
              "translate(" + (graphWidth/2) + " ," +
                             (graphHeight + margin.top - 10) + ")")
        .style("text-anchor", "middle")
        .attr("class","label")
        .text("Pass Distance (Yards)");

    // text label for the y axis
    svg.append("text")
      .attr("transform", "rotate(-90)")
      .attr("class","label")
      .attr("y", 0 - margin.left)
      .attr("x",0 - (graphHeight / 2))
      .attr("dy", "12px")
      .style("text-anchor", "middle")
      .text("Pass Completion Percentage");

    svg.append("text")
      .attr("transform", "rotate(-270)")
      .attr("class","label")
      .attr("y", - graphWidth - margin.right - 1)
      .attr("x",(graphHeight / 2))
      .attr("dy", "12px")
      .style("text-anchor", "middle")
      .text("Total Pass Attempts");

    // add title

    svg.append("text")
        .attr("x", graphHeight / 2)
        .attr("y", 0 - (margin.top / 2))
        .classed("title", true)
        .text("Quarterback Accuracy by Distance");


    // add key

  // svg.append("foreignObject")
  //   .attr("x", graphHeight - 120 - 10)
  //   .attr("y", 10)
  //   .append("xhtml:body")
  //   .html(keyHtml(data));

    d3.selectAll(id + "key")
      .html(keyHtml(data));

    // Plot points

    bins.forEach(function(bin, i) {
      svg
        .selectAll(".bar"+ bin)
        .data(data)
        .enter()
        .append("rect")
        .attr("class", "bar" + bin)
        .style("fill", d => teamAttributes[d.team].color)
        .attr("width", x1.bandwidth())
        .attr("height",  function(d) {
          return graphHeight - y(d.bins[i].percentage)})
        .attr("y", function(d) { return y(d.bins[i].percentage)})
        .attr("x", function(d) {
          return x0(bin) + x1(passer_array.indexOf(parseInt(d.passerid))) })
        .on('mouseover', function(d) {
          tooltip.html(function() {
            return toolTipHtml(d, i, bins)
          })
          tooltip.show()})
          .on('mouseout', tooltip.hide);


      svg.selectAll("circle" + bin)
        .data(data)
        .enter()
        .append("circle")
        .attr("class", "circle" + bin)
        .style("fill", "white")
        .style("stroke", "#333")
        .attr("cx", function(d) {
          return x0(bin) + x1(passer_array.indexOf(parseInt(d.passerid))) + x1.bandwidth() / 2
        })
        .attr("cy", function(d) {
          return y1(d.bins[i].total);
        })
        .attr("r","3px");

      svg.selectAll("circle" + bin)
    });
}

/* replots the points on the graph and animates them .. assumes graph is already made */
function replotAccuracyByDistance(graphType) {

  var id = graphType.viz_id;
  var passers = graphType.passers;
  var data = graphType.data;

  console.assert(passers.size <= 3, "More than 3 passers");

  // sort array
  var passer_array = Array.from(passers);
  passer_array.sort(function(a, b){return a - b});


  data = graphType.data.filter( function(d) { return passers.has(parseInt(d.passerid))});

  d3.selectAll(id + "key")
      .html(keyHtml(data));

  // add in data if we don't have enough passers
  while(data.length < 3) {
    data.push({});
  }



  // Plot points
    bins.forEach(function(bin, i) {
      svg
        .selectAll(".bar"+ bin)
        .data(data)
        .transition()
        .duration(transitionDuration)
        .style("fill", function(d) {
          if(isEmpty(d)) {
            return "none"
          }
          return teamAttributes[d.team].color
        })
        .attr("height",  function(d) {
          if(isEmpty(d)) {
            return 0;
          }
          return graphHeight - y(d.bins[i].percentage)})
        .attr("y", function(d) {
          if(isEmpty(d)) {
            return graphHeight;
          }
          return y(d.bins[i].percentage)
        });


        svg
          .selectAll(".circle" + bin)
          .data(data)
          .transition()
          .duration(transitionDuration)
          .attr("r", function(d) {
            if(isEmpty(d)) {
              return "0px";
            }
            return "3px"
          })
          .attr("cy", function(d) {
            if(isEmpty(d)) {
              return graphHeight;
            }
            return y1(d.bins[i].total);
          });
    });
}

/* wrapper for adding padd to completionPercentages */
function addPass(completionPercentages, passer, bin) {
  completionPercentages[bin].total += 1;
  if(passer.completion == "Complete") {
    completionPercentages[bin].completed += 1;
  }
}

/* tooltip html */
function toolTipHtml(passer, i, bins) {
  return "<img src=" + teamAttributes[passer.team].icon + ">" +
  "<div id='passer'>" + passer.passer + "</div><div id='team'>" + passer.team + "</div><br>" + binTicks[i] + " yards<br><br>" +
  formatPercent(passer.bins[i].percentage) + " Completion Percentage <br>" +
  passer.bins[i].completed + " Total Completions <br>" +
  passer.bins[i].total + " Total Attempts <br>" +
  passer.bins[i].td + " Touchdowns <br>" +
  passer.bins[i].int + " Interceptions"
}

// checks to see if object is empty (aka dict == {})
function isEmpty(obj) {
  return Object.keys(obj).length === 0;
}

function formatPercent(p) {
  return d3.format(".1%")(p);
}

function keyHtml(data) {
  var divs = "<div class='key'><ul>" 
  data.forEach(function(d) {
    divs += "<li><img src='" + teamAttributes[d.team].icon + "'> " + d.passer + " <span>" + d.team + "</span><div class='teamColorKey' style='background-color:" + teamAttributes[d.team].color + "'></div></li>";
  });
  divs += "</ul></div>";
  return divs
}
