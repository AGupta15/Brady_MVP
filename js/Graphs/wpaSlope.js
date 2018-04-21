data = null;
d3.csv("Data/graph5.csv", function (error, csv) {
  data = csv;
  console.log("CSV", csv);

  // Extract WPA from the dataset
  var wpaP = csv.map( function(d) { return d["passerWPA"] })
  var wpaD = csv.map( function(d) { return d["defenseWPA"] })

  // Extract names of passers from the dataset
  var passers = csv.map( function(d) { return d["passer"] });

  // Set "from" and "to" years to display
  var from = Math.min(d3.min(wpaP), d3.min(wpaD));
  var to = Math.max(d3.max(wpaP), d3.max(wpaD));

  // Extract country names and start/end values from the dataset
  //     data = csv
  //                   .map( function(d) {
  //                     var r = {
  //                       label: d["Country Name"],
  //                       start: parseFloat(d[from]),
  //                       end: parseFloat(d[to])
  //                     };
  //                     // console.log(r);
  //                     return r;
  //                   })
  //                   //Require countries to have both values present
  //                   .filter(function(d) { return (!isNaN(d.start) && !isNaN(d.end)); }),
  //     // Extract the values for every country for both years in the dataset for the scale
  //     values = data
  //                   .map( function(d) { return d3.round(d.start, 1); })
  //                   .filter( function(d) { return d; } )
  //                   .concat(
  //                     data
  //                       .map( function(d) { return d3.round(d.end, 1); } )
  //                       .filter( function(d) { return d; } )
  //                   )
  //                   .sort()
  //                   .reverse(),
  //     // Return true for countries without start/end values
  //     missing = function(d) { return !d.start || !d.end; },
  //
  //     // Format values for labels
  //     label_format = function(value) { return d3.format(".1f")(d3.round(value, 1)); },
  //
  //     font_size = 12,
  //     margin = 20,
  //     width = 800,
  //     height = countries.length * font_size*1.5 + margin,
  //     // height = 3000,
  //
  //     chart = d3.select("#chart").append("svg")
  //                .attr("width", width)
  //                .attr("height", height);
});
