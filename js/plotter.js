/* PLOTS ALL GRAPHS */


// add graphs here 
var GraphType = {
"accuracy_by_distance": 
  {
    "id": 1,
    "viz_id": "#accuracy_by_distance",
    "data": null,
    "passers": null
  }
}



/* Replots the graphs */
function replot(graphType) {
  console.log("replotting " + graphType.viz_id);
  if (graphType == GraphType.accuracy_by_distance) {
    replotAccuracyByDistance(graphType);
  }
}

/* Loads the graphs */
function load(graphType) {
  console.log("loading " + graphType.viz_id);

  if (graphType == GraphType.accuracy_by_distance) {
    GraphType.accuracy_by_distance.data = loadAccuracyByDistance(graphType, setData)
  }
}


/* callback after loading graph to plot it */
function setData(graphType, data) {
  graphType.data = data;
  // dummy data 
  var passers_to_plot = new Set();
  passers_to_plot.add(0)
  passers_to_plot.add(1)
  passers_to_plot.add(2)

  graphType.passers = passers_to_plot;

  if (graphType == GraphType.accuracy_by_distance) {
    
  }

  plot(graphType);
}

/* plots graph originally */
function plot(graphType) {
  console.log("plotting " + graphType.viz_id);

  if (graphType == GraphType.accuracy_by_distance) {
    plotAccuracyByDistance(graphType, 500, 500);
  }
}