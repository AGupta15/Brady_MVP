/* PLOTS ALL GRAPHS */


// add graphs here 
var GraphType = {
"accuracy_by_distance": 
  {
    "id": 1,
    "viz_id": "#accuracy_by_distance",
    "data": null,
    "passers": null
  },
  "accuracy_by_down": 
  {
    "id": 2,
    "viz_id": "#accuracy_by_down",
    "data": null,
    "passers": null
  },
  "accuracy_by_point": 
  {
    "id": 3,
    "viz_id": "#accuracy_by_point",
    "data": null,
    "passers": null
  },
  "qb_effectiveness":
  {
    "id": 4,
    "viz_id": "#qb_effectiveness",
    "data": null,
    "passers": null
  }
}



/* Replots the graphs */
function replot(graphType) {
  console.log("replotting " + graphType.viz_id);
  if (graphType == GraphType.accuracy_by_distance) {
    replotAccuracyByDistance(graphType);
  } else if (graphType == GraphType.accuracy_by_down) {
    // call replot function
    replotAccuracyByDown(graphType);
  } else if (graphType == GraphType.accuracy_by_point) {
    // call replot function
    replotAccuracyByPoint(graphType);
  } else if (graphType == GraphType.qb_effectiveness) {
    replotQBEffectiveness(graphType);
  }
}

/* Loads the graphs */
function load(graphType) {
  console.log("loading " + graphType.viz_id);

  if (graphType == GraphType.accuracy_by_distance) {
    loadAccuracyByDistance(graphType, setData)
  } else if (graphType == GraphType.accuracy_by_down) {
    // load data for graph type 
    loadAccuracyByDown(graphType, setData)
  } else if (graphType == GraphType.accuracy_by_point) {
    // call replot function
    loadAccuracyByPoint(graphType, setData);
  } else if (graphType == GraphType.qb_effectiveness) {
    loadQBEffectiveness(graphType, setData);
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
    

    
  } else if (graphType == GraphType.accuracy_by_down) {
    // custom graph default players
  
  }  else if (graphType == GraphType.accuracy_by_point) {

  } else if (graphType == GraphType.qb_effectiveness) {

  }

  // setup select picker
  setupPicker(graphType);
  onSelect(graphType, passers_to_plot);
  plot(graphType);
}

/* plots graph originally */
function plot(graphType) {
  console.log("plotting " + graphType.viz_id);

  if (graphType == GraphType.accuracy_by_distance) {
    plotAccuracyByDistance(graphType, 500, 500);
  } else if (graphType == GraphType.accuracy_by_down) {
    plotAccuracyByDown(graphType, 500, 500)
  }  else if (graphType == GraphType.accuracy_by_point) {
    // call replot function
    plotAccuracyByPoint(graphType, 800, 350);
  } else if (graphType == GraphType.qb_effectiveness) {
    plotQBEffectiveness(graphType, 500, 500);
  }
}

// checks to see if object is empty (aka dict == {})
function isEmpty(obj) {
  return Object.keys(obj).length === 0;
}

function keyHtml(data) {
  var divs = "<div class='key'><ul>" 
  data.forEach(function(d) {
    divs += "<li><img src='" + teamAttributes[d.team].icon + "'> " + d.passer + " <span>" + d.team + "</span><div class='teamColorKey' style='background-color:" + teamAttributes[d.team].color + "'></div></li>";
  });
  divs += "</ul></div>";
  return divs
}




function formatPercent(p) {
  return d3.format(".1%")(p);
}