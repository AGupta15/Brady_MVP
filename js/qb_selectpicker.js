function setupPicker(graphType) {
  var data = graphType.data;
  var id = graphType.viz_id + "_selectpicker"; 
  data.forEach(function (d) {
     $(id).append("<option id='" + id + d.passer_id + "' data-subtext='" + d.team + "'>" + d.passer_name +'</option>');
     $(id).selectpicker("refresh");
  });
}

function onSelect(graphType) {
  var id = graphType.viz_id + "_selectpicker";
  $(id).on('hidden.bs.select', function () {
    var passers = new Set();
    $(id + " option").each(function(i) {
      if(this.selected) {
        var optionId = this.id.slice(id.length)
        passers.add(parseInt(optionId));
      }
    });
    graphType.passers = passers;
    replot(graphType);
  });
}