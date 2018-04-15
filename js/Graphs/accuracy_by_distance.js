 
// [id] div id to plot the graph in
// [passers] set of passer ids to plot
function plotAccuracyByDistance(id, width, height, passers) {

  d3.csv("Data/people.csv", function (error,data) {
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

    data = data.filter( function(d) { return passers.has(parseInt(d.passer_id))})
    var margin = {top: 30, right: 20, bottom: 50, left: 50};
    var graphWidth = width - margin.left - margin.right;
    var graphHeight = height - margin.top - margin.bottom;


    var svg = d3.select(id)
                  .append("svg")
                  .attr("width", width)
                  .attr("height", height)
                  .append("g")
                  .attr("transform", 
                        "translate(" + margin.left + "," + margin.top + ")");

    var tooltip = d3.tip()
                  .attr('class', 'd3-tip')
                  .offset([-10, 0]);

    svg.call(tooltip);

    var bins = [10,20,30,40,50]
    
    // add axi 

    var x0 = d3.scaleBand()
      .domain(bins)
      .paddingInner(0.1)
      .range([0, graphWidth]);

    var x1 = d3.scaleBand()
      .domain(Array.from(passers))
      .paddingInner(0.01)
      .range([0, x0.bandwidth()]);

    var y = d3.scaleLinear()
      .domain([0, 1])
      .range([graphHeight, 0]);

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
                             (graphHeight + margin.top + 10) + ")")
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
              "bins": percentages}
    });

    data.push.apply(data, JSON.parse(JSON.stringify(data)));
    data[1].passer_id = "2";
    data[1].bins = [0.12, 0.54, 0.11, 0.23, 0.11];
    data.push(
      {"passer_name": "Test", 
              "passer_id": "3",
              "bins": [0.12, 0.34, 0.11, 0.73, 0.01]});
    

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
          return x0(bin) + x1(d.passer_id) })
        .on('mouseover', function(d) {
          tooltip.html(function() {
            return toolTipHtml(d, i, bins)
          })
          tooltip.show()})
        .on('mouseout', tooltip.hide);//function(d) {
            //tooltip.style("display", "none");
       // })
        
    });
  });
  
}

function arrowSVG() {
  return "m 240.33657,1028.6844 c 10.44229,0 20.88458,0 31.32687,0 l 0,-374.06893 24.85718,-0.0162 L 256,564.03998 l -40.52062,90.55929 24.85719,0.0162 z"
}

function addPass(completionPercentages, passer, bin) {
  completionPercentages[bin].total += 1;
  if(passer.NE == "Complete") {
    completionPercentages[bin].completed += 1;
  }
}

function toolTipHtml(passer, i, bins) {
  return "<div style='text-decoration:underline;display:inline-block;'>" + passer.passer_name + "</div>  " + (i > 0 ? bins[i-1] : 0) + "-" + bins[i] + " yards<br><br>" + 
  "123 Total Attempts <br>" + 
  "37 Total Completions <br>" + 
  "17 Touchdowns <br>" + 
  "1 Interception"
}

// https://github.com/wbkd/d3-extended
d3.selection.prototype.moveToFront = function() {  
  return this.each(function(){
    this.parentNode.appendChild(this);
  });
};

