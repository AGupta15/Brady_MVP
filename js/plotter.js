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
  },
  "wpa":
  {
    "id":5,
    "viz_id": "#wpa",
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
  } else if (graphType == GraphType.wpa) {
    replotWPA(graphType);
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
  } else if (graphType == GraphType.wpa) {
    loadWPA(graphType, setData);
  }
}


/* callback after loading graph to plot it */
function setData(graphType, data) {
  graphType.data = data;
  // dummy data
  var passers_to_plot = new Set();
  passers_to_plot.add(0) // Brady
  passers_to_plot.add(45) // NFL Average
  passers_to_plot.add(27) // Brees

  graphType.passers = passers_to_plot;

  if (graphType == GraphType.accuracy_by_distance) {



  } else if (graphType == GraphType.accuracy_by_down) {
    // custom graph default players

  }  else if (graphType == GraphType.accuracy_by_point) {

  } else if (graphType == GraphType.qb_effectiveness) {

  } else if (graphType == GraphType.wpa) {

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
    plotAccuracyByDistance(graphType, 500, 400);
  } else if (graphType == GraphType.accuracy_by_down) {
    plotAccuracyByDown(graphType, 500, 400)
  }  else if (graphType == GraphType.accuracy_by_point) {
    // call replot function
    plotAccuracyByPoint(graphType, 800, 300);
  } else if (graphType == GraphType.qb_effectiveness) {
    plotQBEffectiveness(graphType, 500, 500);
  } else if (graphType == GraphType.wpa) {
    plotWPA(graphType, 500, 550);
  }
}

// checks to see if object is empty (aka dict == {})
function isEmpty(obj) {
  return Object.keys(obj).length === 0;
}

function pointKeyHtml(data) {
  var divs = "<div class='pointKey'><ul>"
  data.forEach(function(d) {
    divs += "<li><img src='" + teamAttributes[d.team].icon + "'> " + d.passer + " <span>" + d.team + "</span><div class='pointTeamColorKey' style='background-color:" + teamAttributes[d.team].color + "'></div></li>";
  });
  divs += "</ul></div>";
  return divs
}

function distanceKeyHtml(data) {
  var divs = "<div class='key'><ul>"
  data.forEach(function(d) {
    divs += "<li><img src='" + teamAttributes[d.team].icon + "'> " + d.passer + " <span>" + d.team + "</span><div class='teamColorKey' style='background-color:" + teamAttributes[d.team].color + "'></div></li>";
  });
  divs += "<br><li><div class='passAttempts'></div> Total Pass Attempts</li>"
  divs += "</ul></div>"

  return divs
}

function keyHtml(data) {
  var divs = "<div class='key'><ul>"
  data.forEach(function(d) {
    divs += "<li><img src='" + teamAttributes[d.team].icon + "'> " + d.passer + " <span>" + d.team + "</span><div class='teamColorKey' style='background-color:" + teamAttributes[d.team].color + "'></div></li>";
  });
  divs += "</ul></div>";
  return divs
}
