var svg, x, y;
var graphHeight, graphWidth, margin;
var tooltip;

var metrics = ["yardCount", "timeCount", "pointCount", "playCount"]
var selectedMetrics = [
    { 
      value: metrics[0], // default values
      id: "_x",
      title: "X"
    },
    { 
      value: metrics[1], // default values
      id: "_y",
      title: "Y"
    }
  ]

var metricNames = ["Yards Per Drive", "Time Per Drive (Seconds)", "Points Per Drive", "Plays Per Drive"]

function loadQBEffectiveness(graphType, callback) {
    d3.csv("Data/graph4.csv", function (error, data) {
      if (error) { console.log(error); }
      
      

      data = data.map(function(d) {
        d.driveCount = parseInt(d.driveCount)
        d.yardCount = (parseInt(d.yardCount) / d.driveCount)
        d.playCount = (parseInt(d.playCount) / d.driveCount)
        d.pointCount = (parseInt(d.pointCount) / d.driveCount)
        d.timeCount = (parseInt(d.timeCount) / d.driveCount)
        return d
      })

      
      var average = {
        passer: "Average",
        team: "NFL",
        "passerid": data.length,
        driveCount: d3.sum(data, d => d.driveCount) / data.length,
        playCount: (d3.sum(data, d => d.playCount) / data.length),
        pointCount: (d3.sum(data, d => d.pointCount) / data.length),
        timeCount: (d3.sum(data, d => d.timeCount) / data.length),
        yardCount: (d3.sum(data, d => d.yardCount) / data.length)     
      };

      data.push(average)

      setupQBEffectiveness(metrics)
      callback(graphType, data);
    });  
}

function plotQBEffectiveness(graphType, width, height) {
    var passers = graphType.passers;
    var id = graphType.viz_id;
    var data = graphType.data;

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

    // key
    d3.selectAll(id + "key")
      .html(keyHtml(data.filter(function(d) { return passers.has(parseInt(d.passerid))})));

    x = d3.scaleLinear()
      .domain(d3.extent(data, d => d[selectedMetrics[0].value]))
      .range([0,graphWidth]);

    y = d3.scaleLinear()
      .domain(d3.extent(data, d => d[selectedMetrics[1].value]))
      .range([graphHeight, 0]);

    // setup x axis

    svg
      .append("g")
      .attr("class", "xAxis pointSpreadAxis axis")
      .attr("transform", "translate(" + [0,graphHeight] + ")")
      .call(
        d3.axisBottom(x)
        .ticks(6)
        .tickSizeOuter(0)
        .tickPadding(6));

    // setup y axis
    svg.append("g")
      .attr("class", "yAxis y axis")
      .call(
        d3.axisLeft(y)
        .ticks(5)
        .tickSizeInner(-graphWidth)
        .tickSizeOuter(0)
      );

    // text label for the y axis
    svg.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0 - margin.left)
      .attr("x",0 - (graphHeight / 2))
      .attr("dy", "12px")
      .attr("class","ylabel label")
      .style("text-anchor", "middle")
      .text(metricNames[metrics.indexOf(selectedMetrics[1].value)]);

    // text label for the x axis
    svg.append("text")
        .attr("transform",
              "translate(" + (graphWidth/2) + " ," +
                             (graphHeight + margin.top - 10) + ")")
        .style("text-anchor", "middle")
        .attr("class","xlabel label")
        .text(metricNames[metrics.indexOf(selectedMetrics[0].value)]);

    // add titles

    svg.append("text")
        .attr("x", graphWidth/2)
        .attr("y", 0 - (margin.top / 2))
        .classed("title", true)
        .text("Quarterback Effectiveness");


    // plot points

    svg.selectAll(".circle")
      .data(data)
      .enter()
      .append("circle")
      .attr("class", "circle")
      .attr("r","4px")
      .style("opacity",d => opacity(d, passers))
      .style("fill", d => teamAttributes[d.team].color)
      .attr("cy", d => y(d[selectedMetrics[1].value]))
      .attr("cx", d => x(d[selectedMetrics[0].value]))
      .on('mouseover', function(b) {
        tooltip.html(function() {
          return toolTipHtml(b)
        })
        tooltip.show()
        d3.select(this).style("opacity", 1)
      })
      .on('mouseout', function(d) {
        d3.select(this).style("opacity", opacity(d, graphType.passers))
        tooltip.hide();
      });
}


/* replots the points on the graph and animates them .. assumes graph is already made */
function replotQBEffectiveness(graphType, metricChanged=false) {
    var passers = graphType.passers;
    var data = graphType.data;
    var id = graphType.viz_id;

    if (metricChanged) {
      changeAxis(graphType)
    }
    
    // key
    d3.selectAll(id + "key")
      .html(keyHtml(data.filter( function(d) { return passers.has(parseInt(d.passerid))})));

    // plot points

    svg.selectAll(".circle")
      .data(data)
      .transition()
      .duration(transitionDuration)
      .style("opacity", d => opacity(d, passers))
      .style("fill", d => teamAttributes[d.team].color)
      .attr("cy", d => y(d[selectedMetrics[1].value]))
      .attr("cx", d => x(d[selectedMetrics[0].value]));


}

function opacity(d, passers) {
  return passers.has(parseInt(d.passerid)) ? 1 : 0.10
}

function changeAxis(graphType) {

  x.domain(d3.extent(graphType.data, d => d[selectedMetrics[0].value]));
  y.domain(d3.extent(graphType.data, d => d[selectedMetrics[1].value]));

  svg.select(".xAxis")
      .transition()
      .duration(transitionDuration)
      .call(
        d3.axisBottom(x)
        .ticks(6)
        .tickSizeOuter(0)
        .tickPadding(6));

  svg.select(".yAxis")
      .transition()
      .duration(transitionDuration)
      .call(
        d3.axisLeft(y)
        .ticks(5)
        .tickSizeInner(-graphWidth)
        .tickSizeOuter(0)
      );

  svg.select(".xlabel")
      .text(metricNames[metrics.indexOf(selectedMetrics[0].value)])

  svg.select(".ylabel")
      .text(metricNames[metrics.indexOf(selectedMetrics[1].value)])
}

function format(n) {
  return d3.format(".2r")(n)
}

/* tooltip html */
function toolTipHtml(passer) {
  return "<img src=" + teamAttributes[passer.team].icon + ">" +
  "<div id='passer'>" + passer.passer + "</div><div id='team'>" + passer.team + "</div><br>" + passer.driveCount + " Total Drives<br><br>" +
  format(passer.timeCount) + " Seconds Per Drive <br>" +
  format(passer.yardCount) + " Yards Per Drive <br>" +
  format(passer.playCount) + " Plays Per Drive <br>" +
  format(passer.pointCount) + " Points Per Drive"
}