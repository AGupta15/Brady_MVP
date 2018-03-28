//Abhimanyu Gupta All Rights Reserved. abhigupta.1600@gmail.com

//Set of distinct passers from dataset
let passers = new Set();

//Dict mapping a passer to the number of passing attempts
var passCounts = {};

//Set of passers who have a minimum number of attempts (i.e. 100)
let validPassers = new Set();

//Array of passers, each mapped to the list of passes
//QB -> [pass1, pass2, ... , passN]
//pass = {"airyards": __ ,
//        "completion":__ ,
//        "touchdown":__ ,
//        "interception":__ ,
//        "down": __ ,
//        "pointSpread": __}

let passSet = new Array(validPassers.size);

d3.csv("pbp_2017_wp.csv", function(data) {

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
      }
    }
  }

  //Determine a "Valid passer" as >= Pass Attempt Count
  passers.forEach(function(passer){
    if (passCounts[passer] >= 100){
      validPassers.add(passer);
    }
  });

  //Initialize the passSet Data Structure
  let validPasserArr = Array.from(validPassers);
  for (var i = 0, len = validPassers.size; i < len; i++){
    var dict = {};
    var qb = validPasserArr[i]
    var array = new Array({});
    dict[qb] = array;
    passSet[i] = dict;
  }

  //Add passes
  for (var i = 0, len = data.length; i < len; i++) {
    var qb = data[i]['Passer'];
    var attempt = data[i]['PassAttempt'];

    //pass = {"airyards": __ ,
    //        "completion":__ ,
    //        "touchdown":__ ,
    //        "interception":__ ,
    //        "down": __ ,
    //        "pointSpread": __}

    //Pass Attempt has occurred
    if (attempt > 0){
      //We have a valid QB
      if (validPassers.has(qb)){
        //Create pass item
        pass = {};
        pass['AirYards'] = data[i]['AirYards'];
        pass['Completion'] = data[i]['PassOutcome'];
        pass['Touchdown'] = data[i]['Touchdown'];
        pass['Interception'] = data[i]['InterceptionThrown'];
        pass['Down'] = data[i]['down'];
        pass['pointSpread'] = data[i]['ScoreDiff'];
        pass['Quarter'] = data[i]['qtr'];

        var setIndex = validPasserArr.indexOf(qb); // index of qb
        var entry = passSet[setIndex]; // get (qb: pass array)
        var passes = entry[qb]; //get pass array
        passes.push(pass);
        }
      }
    }
    console.log(passSet);
});
