var downs = [1,2,3,4];

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
            "percentage": 0
        };
      });

      data = data.map(function(d) {
        return {
          "passer": d.values[0].passer,
          "passerid": d.key,
          "passes": d3.nest()
            .key(function(v) { return v.down; })
            .rollup(function(v) { 
              var ints = d3.sum(v, function(p) { return p.int; });
              var tds = d3.sum(v, function(p) { return p.td; });
              var total = v.length;
              var completions = d3.sum(v, function(p) { return p.completion == "Complete"; });
              console.log(v.down);
              averageBins[v[0].down].completed += completions;
              averageBins[v[0].down].total += total;
              averageBins[v[0].down].ints += ints;
              averageBins[v[0].down].tds += tds;
              return {
                  int: ints,
                  td: tds,
                  total: total,
                  completed: completions,
                  percentage: completions / total
              };
            })
            .entries(d.values),
          "team": d.values[0].team,
        }
      });

      
      data.push({
        passer: "Average",
        team: "NFL",
        "passerid": data.length,
        "passes": averageBins,
      })
      console.log(data);
      callback(graphType, data);
    });  
}

function plotAccuracyByDown(graphType, width, height) {
  
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
    
}