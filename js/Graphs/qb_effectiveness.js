var svg4, x4, y4;
var graphHeight4, graphWidth4, margin4;
var tooltip4;

var metrics = ["yardCount", "timeCount", "pointCount", "playCount"]
var selectedMetrics = [
    {
      value: metrics[0], // default values
      id: "_x",
      title: "X"
    },
    {
      value: metrics[2], // default values
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
        d.rank = 0;
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



      data.sort(compare0).reverse();
      for (i=0; i<data.length; i++){
        data[i].rank = data[i].rank + (i+1)
      }
      data.sort(compare1).reverse();
      for (i=0; i<data.length; i++){
        data[i].rank = data[i].rank + (i+1)
      }
      for (i=0; i<data.length; i++){
        data[i].rank= data[i].rank/2.0
      }
      data.sort(compare2);
      // console.log(data)

      data.reverse()
      data.push(average)
      data.reverse()

      // swap brady + nfl average
      var tmp = data[1]
      data[1] = data[0]
      data[0] = tmp

      setupQBEffectiveness(metrics)
      callback(graphType, data);
    });
}

function plotQBEffectiveness(graphType, width, height) {
    var passers = graphType.passers;
    var id = graphType.viz_id;
    var data = graphType.data;

    margin4 = {top: 50, right: 50, bottom: 50, left: 50};
    graphWidth4 = width - margin4.left - margin4.right;
    graphHeight4 = height - margin4.top - margin4.bottom;

    svg4 = d3.select(id)
                  .append("svg")
                  .attr("width", width)
                  .attr("height", height)
                  .append("g")
                  .attr("transform",
                        "translate(" + margin4.left + "," + margin4.top + ")");

    tooltip4 = d3.tip()
                  .attr('class', 'd3-tip')
                  .offset([-10, 0]);

    svg4.call(tooltip4);

    // key
    d3.selectAll(id + "key")
      .html(keyHtml(data.filter(function(d) { return passers.has(parseInt(d.passerid))})));

    x4 = d3.scaleLinear()
      .domain(d3.extent(data, d => d[selectedMetrics[0].value]))
      .range([0,graphWidth4]);

    y4 = d3.scaleLinear()
      .domain(d3.extent(data, d => d[selectedMetrics[1].value]))
      .range([graphHeight4, 0]);

    // setup x axis

    svg4
      .append("g")
      .attr("class", "xAxis pointSpreadAxis axis")
      .attr("transform", "translate(" + [0,graphHeight4] + ")")
      .call(
        d3.axisBottom(x4)
        .ticks(6)
        .tickSizeOuter(0)
        .tickPadding(6));

    // setup y axis
    svg4.append("g")
      .attr("class", "yAxis y axis")
      .call(
        d3.axisLeft(y4)
        .ticks(5)
        .tickSizeInner(-graphWidth4)
        .tickSizeOuter(0)
      );

    // text label for the y axis
    svg4.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0 - margin4.left)
      .attr("x",0 - (graphHeight4 / 2))
      .attr("dy", "12px")
      .attr("class","ylabel label")
      .style("text-anchor", "middle")
      .text(metricNames[metrics.indexOf(selectedMetrics[1].value)]);

    // text label for the x axis
    svg4.append("text")
        .attr("transform",
              "translate(" + (graphWidth4/2) + " ," +
                             (graphHeight4 + margin4.top - 10) + ")")
        .style("text-anchor", "middle")
        .attr("class","xlabel label")
        .text(metricNames[metrics.indexOf(selectedMetrics[0].value)]);

    // add titles

    // svg4.append("text")
    //     .attr("x", graphWidth4/2)
    //     .attr("y", 0 - (margin4.top / 2))
    //     .classed("title", true)
    //     .text("Quarterback Effectiveness");


    // plot points

    svg4.selectAll(".circle")
      .data(data)
      .enter()
      .append("circle")
      .attr("class", "circle")
      .attr("r","4px")
      .style("opacity",d => opacity(d, passers))
      .style("fill", d => teamAttributes[d.team].color)
      .attr("cy", d => y4(d[selectedMetrics[1].value]))
      .attr("cx", d => x4(d[selectedMetrics[0].value]))
      .on('mouseover', function(b) {
        tooltip4.html(function() {
          return toolTipHtml(b)
        })
        tooltip4.show()
        d3.select(this).style("opacity", 1)
      })
      .on('mouseout', function(d) {
        d3.select(this).style("opacity", opacity(d, graphType.passers))
        tooltip4.hide();
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

    svg4.selectAll(".circle")
      .data(data)
      .transition()
      .duration(transitionDuration)
      .style("opacity", d => opacity(d, passers))
      .style("fill", d => teamAttributes[d.team].color)
      .attr("cy", d => y4(d[selectedMetrics[1].value]))
      .attr("cx", d => x4(d[selectedMetrics[0].value]));


}

function opacity(d, passers) {
  return passers.has(parseInt(d.passerid)) ? 1 : 0.10
}

function changeAxis(graphType) {
  console.log(selectedMetrics[0].value)

  x4.domain(d3.extent(graphType.data, d => d[selectedMetrics[0].value]));
  y4.domain(d3.extent(graphType.data, d => d[selectedMetrics[1].value]));

  svg4.select(".xAxis")
      .transition()
      .duration(transitionDuration)
      .call(
        d3.axisBottom(x4)
        .ticks(6)
        .tickSizeOuter(0)
        .tickPadding(6));

  svg4.select(".yAxis")
      .transition()
      .duration(transitionDuration)
      .call(
        d3.axisLeft(y4)
        .ticks(5)
        .tickSizeInner(-graphWidth4)
        .tickSizeOuter(0)
      );

  svg4.select(".xlabel")
      .text(metricNames[metrics.indexOf(selectedMetrics[0].value)])

  svg4.select(".ylabel")
      .text(metricNames[metrics.indexOf(selectedMetrics[1].value)])
}

function format(n) {
  return d3.format(".2r")(n)
}

/* tooltip4 html */
function toolTipHtml(passer) {
  return "<img src=" + teamAttributes[passer.team].icon + ">" +
  "<div id='passer'>" + passer.passer + "</div><div id='team'>" + passer.team + "</div><br>" + d3.round(passer.driveCount) + " Total Drives<br><br>" +
  d3.format(".3r")(passer.timeCount) + " Seconds Per Drive <br>" +
  format(passer.yardCount) + " Yards Per Drive <br>" +
  format(passer.playCount) + " Plays Per Drive <br>" +
  format(passer.pointCount) + " Points Per Drive"
}


function compare0(a,b) {
  if (a.yardCount < b.yardCount)
    return -1;
  if (a.yardCount > b.yardCount)
    return 1;
  return 0;
}

function compare1(a,b) {
  if (a.pointCount < b.pointCount)
    return -1;
  if (a.pointCount > b.pointCount)
    return 1;
  return 0;
}

function compare2(a,b) {
  if (a.rank < b.rank)
    return -1;
  if (a.rank > b.rank)
    return 1;
  return 0;
}
