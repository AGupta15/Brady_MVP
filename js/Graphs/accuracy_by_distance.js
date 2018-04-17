var svg, x0, x1, y, line;
var graphHeight, graphWidth, margin;
var tooltip;
var bins = [10,20,30,40,50];

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

    setupPicker(graphType);
    onSelect(graphType);


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
      .domain(extent)
      .range([graphHeight, 0]);

    // line for total passes 
    line = function(data, bin, i, passer_array) {
      return d3.svg.line()
        .x(function(d) { 
          return x0(bin) + x1(passer_array.indexOf(parseInt(d.passerid))) + x1.bandwidth() / 2 })
        .y(function(d) { 
          if (isEmpty(d)) {
            return 0;
          }
          return y1(d.bins[i].total); 
        })(data);
    }
     

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

    // total attempts y axis 
    svg.append("g")       
        .attr("class", "y axis")  
        .attr("transform", "translate(" + (graphWidth) + " ,0)")   
        .call(d3.axisRight(y1).ticks(10).tickSize(0));

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

    svg.append("text")
      .attr("transform", "rotate(-270)")
      .attr("class","label")
      .attr("y", - graphWidth - margin.right)
      .attr("x",(graphHeight / 2))
      .attr("dy", "12px")
      .style("text-anchor", "middle")
      .text("Total Pass Attempts");   

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
    });

    // plot total passes line 
    bins.forEach(function(bin,i) {
      svg.append("path")   
        .attr("class","line" + bin) 
        .style("stroke", "red")
        .style("fill","none")
        .attr("d", line(data, bin, i, passer_array));
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
          return graphHeight - y(d.bins[i].percentage)})
        .attr("y", function(d) { 
          if(isEmpty(d)) {
            return graphHeight;
          }
          return y(d.bins[i].percentage)
        });
    });

    // animate total passes line
    bins.forEach(function(bin,i) {
      svg.selectAll("path.line" + bin)
        .transition()    
        .duration(transitionDuration)
        .attr("d", line(data, bin, i, passer_array));
    });
}

/* return svg of the arrow */
function arrowSVG() {
  return "m 240.33657,1028.6844 c 10.44229,0 20.88458,0 31.32687,0 l 0,-374.06893 24.85718,-0.0162 L 256,564.03998 l -40.52062,90.55929 24.85719,0.0162 z"
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
  return "<div style='text-decoration:underline;display:inline-block;'>" + passer.passer + "</div>  " + (i > 0 ? bins[i-1] : 0) + "-" + bins[i] + " yards<br><br>" + 
  passer.bins[i].total + " Total Attempts <br>" + 
  passer.bins[i].completed + " Total Completions <br>" + 
  passer.bins[i].td + " Touchdowns <br>" + 
  passer.bins[i].int + " Interceptions"
}

// checks to see if object is empty (aka dict == {})
function isEmpty(obj) {
  return Object.keys(obj).length === 0;
}
