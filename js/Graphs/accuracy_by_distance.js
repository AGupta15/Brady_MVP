var svg, x0, x1, y;
var graphHeight, graphWidth, margin;
var tooltip;
var bins = [10,20,30,40,50];

 function loadAccuracyByDistance(graphType, callback) {
    d3.csv("Data/people.csv", function (error, data) {
      if (error) { console.log(error); }

      // for dummy data 
      data = [
        { "passer_name": "Tom Brady",
          "passer_id": "1",
          "passes": [
            { "AirYards": "10",
              "NE": "Complete"
            },
            { "AirYards": "0",
              "NE": "Incomplete"
            },
            { "AirYards": "5",
              "NE": "Incomplete"
            },
            { "AirYards": "20",
              "NE": "Complete"
            }
          ],
          "team": "Patriots"
        }
      ]

      data = data.map(function(d) { 
        var completionPercentages = {};
        bins.forEach(function(b) {
          completionPercentages[b] = {"completed": 0, "total": 0};
        });
        d.passes.forEach( function(p) {
          var added = false;
          for(var i = 0; i < bins.length - 1; i++) {
            if(parseInt(p.AirYards) < bins[i+1]) {
              addPass(completionPercentages,p,bins[i]);
              added = true;
              break;
            }
          }

          if(!added) {
            addPass(completionPercentages,p,bins[bins.length-1]);
          }
          
        });
        var percentages = [];
        bins.forEach(function(bin) {
          var percentage = 0;
          if(completionPercentages[bin].total > 0) {
            percentage = completionPercentages[bin].completed / completionPercentages[bin].total; 
          }
          percentages.push(percentage);
        });

        return {"passer_name": d.passer_name, 
                "passer_id": d.passer_id,
                "team": d.team,
                "bins": percentages}
    });

    data.push.apply(data, JSON.parse(JSON.stringify(data)));
    data[1].passer_id = "2";
    data[1].bins = [0.12, 0.54, 0.11, 0.23, 0.11];
    data.push(
      {"passer_name": "Test", 
              "passer_id": "3",
              "team": "New England",
              "bins": [0.12, 0.34, 0.11, 0.73, 0.01]});
    callback(graphType, data);
  });
}

// [id] div id to plot the graph in
// [passers] set of passer ids to plot
function plotAccuracyByDistance(graphType, width, height) {
    
    
    var id = graphType.viz_id;
    var passers = graphType.passers;
    var data = graphType.data;

    console.assert(passers.size <= 3, "More than 3 passers");

    var passer_array = Array.from(passers);

    setupPicker(graphType);
    onSelect(graphType);


    data = data.filter( function(d) { return passers.has(parseInt(d.passer_id))});

    margin = {top: 50, right: 20, bottom: 50, left: 50};
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
          if (i == 0) {
            return "0-" + d;
          }
          if(i == bins.length-1) {
            return d + "+";
          }
          return bins[i-1] + "-" + d;
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

    // text label for the x axis
    svg.append("text")             
        .attr("transform",
              "translate(" + (graphWidth/2) + " ," + 
                             (graphHeight + margin.top - 10) + ")")
        .style("text-anchor", "middle")
        .attr("class","label")
        .text("Yardage");

    // text label for the y axis
    svg.append("text")
      .attr("transform", "rotate(-90)")
      .attr("class","label")
      .attr("y", 0 - margin.left)
      .attr("x",0 - (graphHeight / 2))
      .attr("dy", "12px")
      .style("text-anchor", "middle")
      .text("Pass Completion Percentage");  

    // arrows 

    svg.append("g")
        .attr("transform", 
          "translate(" + [0 - 70,-30] 
          + ")scale(0.1)")
        .attr("class","arrow")
        .append("path")
        .attr("d",arrowSVG());

    svg.append("g")
        .attr("transform", 
          "translate(" + [graphWidth + 30, graphHeight + 12] 
          + ")scale(0.1)rotate(-270)")
        .attr("class","arrow")
        .append("path")
        .attr("d",arrowSVG());

    // add title

    svg.append("text")
        .attr("x", 0)             
        .attr("y", 0 - (margin.top / 2))
        .classed("title", true)
        .text("Quarterback Accuracy by Distance");

    // Plot points 

    bins.forEach(function(bin, i) {
      svg
        .selectAll(".bar"+ bin)
        .data(data)
        .enter()
        .append("rect")
        .attr("class", "bar" + bin)
        .style("fill", "#333")
        .attr("width", x1.bandwidth())
        .attr("height",  function(d) { return graphHeight - y(d.bins[i])})
        .attr("y", function(d) { return y(d.bins[i])})
        .attr("x", function(d) { 
          return x0(bin) + x1(passer_array.indexOf(parseInt(d.passer_id))) })
        .on('mouseover', function(d) {
          tooltip.html(function() {
            return toolTipHtml(d, i, bins)
          })
          tooltip.show()})
        .on('mouseout', tooltip.hide);//function(d) {
            //tooltip.style("display", "none");
       // })
        
    });
}

/* replots the points on the graph and animates them .. assumes graph is already made */
function replotAccuracyByDistance(graphType) {

  var id = graphType.viz_id;
  var passers = graphType.passers;
  var data = graphType.data;

  console.assert(passers.size <= 3, "More than 3 passers");

  var passer_array = Array.from(passers);
  data = data.filter( function(d) { return passers.has(parseInt(d.passer_id))});

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
        .attr("height",  function(d) { 
          if(isEmpty(d)) {
            return 0;
          }
          return graphHeight - y(d.bins[i])})
        .attr("y", function(d) { 
          if(isEmpty(d)) {
            return graphHeight;
          }
          return y(d.bins[i])
        });
    });
}

/* return svg of the arrow */
function arrowSVG() {
  return "m 240.33657,1028.6844 c 10.44229,0 20.88458,0 31.32687,0 l 0,-374.06893 24.85718,-0.0162 L 256,564.03998 l -40.52062,90.55929 24.85719,0.0162 z"
}

/* wrapper for adding padd to completionPercentages */
function addPass(completionPercentages, passer, bin) {
  completionPercentages[bin].total += 1;
  if(passer.NE == "Complete") {
    completionPercentages[bin].completed += 1;
  }
}

/* tooltip html */
function toolTipHtml(passer, i, bins) {
  return "<div style='text-decoration:underline;display:inline-block;'>" + passer.passer_name + "</div>  " + (i > 0 ? bins[i-1] : 0) + "-" + bins[i] + " yards<br><br>" + 
  "123 Total Attempts <br>" + 
  "37 Total Completions <br>" + 
  "17 Touchdowns <br>" + 
  "1 Interception"
}

// checks to see if object is empty (aka dict == {})
function isEmpty(obj) {
  return Object.keys(obj).length === 0;
}
