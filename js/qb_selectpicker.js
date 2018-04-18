function setupPicker(graphType) {
  var data = graphType.data;
  var id = graphType.viz_id + "_selectpicker"; 
  data.forEach(function (d) {
    if(d.passerid != "0") { // remove Tom Brady as option
      console.log(d);
      console.log(teamAttributes[d.team])
      $(id).append("<option value='" + d.passerid + "'id='" + id + d.passerid + "' data-icon='" + teamAttributes["NE"].icon + "' data-subtext='" + d.team + "'>" + d.passer +'</option>');
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