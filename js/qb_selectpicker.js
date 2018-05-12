function setupPicker(graphType) {
  var data = graphType.data;
  var passers = graphType.passers;

  // rearrange data so default passers show up at the top
  endData = data.filter(function(d){return !passers.has(parseInt(d.passerid))})
  data = data.filter(function(d){return passers.has(parseInt(d.passerid))})
  data.push.apply(data, endData)

  var id = graphType.viz_id + "_selectpicker"; 
  data.forEach(function (d) {
    if(d.passerid != "0") { // remove Tom Brady as option
      $(id).append("<option value='" + d.passerid + "'id='" + id + d.passerid + "' data-content='<img src=" + teamAttributes[d.team].icon + "> " + d.passer + " <span>" + d.team + "</span>' </option>'");
     $(id).selectpicker("refresh");
    }
  });
}

function onSelect(graphType, passers_to_select=null) {
  var id = graphType.viz_id + "_selectpicker";
  if (passers_to_select != null) { // set default values
    $(id).selectpicker('val', Array.from(passers_to_select));
  }
  

  $(id).on('hidden.bs.select', function () {
    var passers = new Set();
    $(id + " option").each(function(i) {
      var optionId = this.id.slice(id.length);
      if(this.selected) {
        passers.add(parseInt(optionId));
      }
    });
    passers.add(0); // always add Tom
    graphType.passers = passers;
    replot(graphType);
  });
}

function setupPointSpreadPicker(spread) {
  var id = "#point_spread_selectpicker"; 
  spread.forEach(function (s,i) {
    $(id).append("<option value='" + s + "' id='" + id + s + "'> +/- " + s + " points</option>'");
    $(id).selectpicker("refresh");
    if (i == spread.length - 1) {
      $(id).selectpicker('val',s);
    }
  });

  $(id).on('hidden.bs.select', function () {
    var extent = null
    $(id + " option").each(function(i) {
      var optionId = this.id.slice(id.length);
      if(this.selected) {
        extent = [-1 * parseInt(optionId), parseInt(optionId)]
      } 
    });
    replotAccuracyByPoint(GraphType.accuracy_by_point, spread=extent)
  });
}

function setupQBEffectiveness(metrics) {
  selectedMetrics.forEach(function(axis,index) {
    var id = "#qb_effectiveness_metrics_selectpicker" + axis.id; 
    metrics.forEach(function (s,i) {
      $(id).append("<option value='" + s + "' title='" + axis.title + "-axis: " + metricNames[i] + "' ' id='" + id + s + "'>" + metricNames[i]  + "</option>'");
      $(id).selectpicker("refresh");
      if (s == selectedMetrics[index].value) { 
        $(id).selectpicker('val',s); // set default value
      }
    });

    $(id).on('hidden.bs.select', function () {
      $(id + " option").each(function(i) {
        var metricId = this.id.slice(id.length);
        if(this.selected) {
          selectedMetrics[index].value = metricId
        } 
      });
      replotQBEffectiveness(GraphType.qb_effectiveness, true)
    })
  })
    
}