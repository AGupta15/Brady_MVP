
// 30 Passer
// 31 Passer_ID
// 33 PassAttempt
// 34 PassLength
// 35 AirYards
// 38 PassLocation
// 22 Touchdown
// 39 InterceptionThrown

d3.csv("pbp_2017_wp.csv", function(data) {
  let passers = new Set(); // Set of distinct passers
  var passCounts = {}; // Dict mapping passer -> Pass Count

  for (var i = 0, len = data.length; i < len; i++) {
    var qb = data[i]['Passer'];
    var attempt = data[i]['PassAttempt'];

    //Pass Attempt has occurred
    if (attempt > 0){
      //If passer has not yet been seen, add him
      if (!passers.has(qb)){
        passers.add(qb);
        passCounts[qb] = 1;
      }

      //Otherwise increment the passer's count
      else {
        var count = passCounts[qb];
        passCounts[qb] = count + 1;
        // console.log(qb);
        // console.log(passCounts[qb]);
      }
    }
  }

  //Determine a "Valid passer" as >= Pass Attempt Count
  let validPassers = new Set();
  passers.forEach(function(passer){
    if (passCounts[passer] >= 100){
      validPassers.add(passer);
      console.log(passer);
    }
  });

});
