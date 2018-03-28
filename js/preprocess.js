//Abhimanyu Gupta All Rights Reserved. abhigupta.1600@gmail.com

//==============Global Vars===================
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

//Array of passers, each mapped to a array of drives
// QB -> [{"drive1": []} , {"drive2": [] }, ..., {"driveN": [] }]
//each drive is gameId + driveNumber : array of passes
//each drive contains all plays on that drive
// drive : [play1, play2, ..., playN]
// play = {field1: , field2:, ..., fieldN: }
// let driveSet = new Array(validPassers.size);
var qbToDrive = [];

//Array of dictionaries, mapping driveIds to an array of plays
var driveList = [];

//Set of driveIds that have been seen
var driveIds = new Set();

//Array of metrics for graph4
var qbMetrics = new Array(validPassers.size);

//==============Data Parsing===================
d3.csv("pbp_2017_wp.csv", function(data) {

  // =======Step 1: QB Pass Counts========
  // console.log(data[100])
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

  //========Step 2: Create pass lists=========
  //Initialize the passSet Data Structure
  let validPasserArr = Array.from(validPassers);
  for (var i = 0, len = validPassers.size; i < len; i++){
    var dict = {};
    var qb = validPasserArr[i]
    var array = [];
    dict[qb] = array;
    passSet[i] = dict;
  }
  //Add passes to passSet
  for (var i = 0, len = data.length; i < len; i++) {
    var qb = data[i]['Passer'];
    var attempt = data[i]['PassAttempt'];
    var penalty = data[i]['Accepted.Penalty']

    //Pass Attempt has occurred
    if (attempt > 0){
      //We have a valid QB
      if (validPassers.has(qb) && penalty == 0){
        //Create pass item
        pass = {};
        pass['AirYards'] = data[i]['AirYards'];
        pass['Completion'] = data[i]['PassOutcome'];
        pass['Touchdown'] = data[i]['Touchdown'];
        pass['Interception'] = data[i]['InterceptionThrown'];
        pass['Down'] = data[i]['down'];
        pass['Quarter'] = data[i]['qtr'];
        pass['offScore'] = data[i]['PosTeamScore'];
        pass['defScore'] = data[i]['DefTeamScore'];
        pass['DriveId'] = data[i]['Drive'];
        pass["GameId"] = data[i]['GameID'];


        var setIndex = validPasserArr.indexOf(qb); // index of qb
        var entry = passSet[setIndex]; // get (qb: pass array)
        var passes = entry[qb]; //get pass array
        passes.push(pass);
      }
    }
  }

  // ==========Step 3: Organize plays by drive==========

  //Create drivesets
  for (var i = 0, len = data.length; i < len; i++) {
    var overallId = parseInt(data[i]['GameID']+data[i]['Drive']);

    //Create play item
    play = {};
    play['DriveId'] = data[i]['Drive'];
    play["GameId"] = data[i]['GameID'];
    play['Touchdown'] = data[i]['Touchdown'];
    play['Interception'] = data[i]['InterceptionThrown'];
    play['Score'] = data[i]['PosTeamScore'];
    play['Passer'] = data[i]['Passer'];
    play['YardsGained'] = data[i]['Yards.Gained'];
    play['Time'] = data[i]['TimeSecs'];
    play['Penalty'] = data[i]['Accepted.Penalty'];

    var drive = null;
    if (driveIds.has(overallId)){
      //Fetch the drive and add
      for (var j = 0, driveLen = driveList.length; j < driveLen; j++){
        var item = driveList[j];
        if (item['Id'] == overallId){
          item['plays'].push(play);
          break;
        }
      }
    }
    else {
      //Add it to the drivelist
      var dict = {};
      dict['Id'] = overallId;
      dict['plays'] = [play];
      driveList.push(dict);
      driveIds.add(overallId);
    }
  }

  //==========Step 4: Map Drives to passers===========
  //loop through drive Array
    //keep track of passers
    //if a passer is a validPasser
      //add the drive to their entry in qbToDrive

  //init qbToDrive
  for (var i=0, len=validPassers.size; i < len; i++){
    qbToDrive.push([]);
  }

  driveList.forEach(function(drive){
    var qbs = new Set();
    plays = drive['plays'];

    //Create a distinct set of passers for a drive
    plays.forEach(function(play){
      qbs.add(play['Passer']);
    });

    //attribute drive to passer
    // console.log(Object.keys(qbs))
    qbs.forEach(function(qb){
      if (validPassers.has(qb)){
        var setIndex = validPasserArr.indexOf(qb);
        var entry = qbToDrive[setIndex]; // get (qb: drive array)
        entry.push(drive);
      }
    });
  });

  //=======Step 5: Compute stats for Graph 4=========

  //Time per drive = sum of drive times / drives
  //Yards per drive = sum of yards gained / drives
  //Points per drive = sum of score changes / drives
  //Plays per drive = sum of plays / drives

  validPassers.forEach(function(qb){

    var setIndex = validPasserArr.indexOf(qb);
    var entry = qbToDrive[setIndex];

    //Counters for stats
    var driveCount = entry.length;
    var timeCount = 0;
    var yardCount = 0;
    var pointCount = 0;
    var playCount = 0;

    //Loop through each drive
    entry.forEach(function(drive){

      playCount += drive['plays'].length;

      var minTime = Number.MAX_SAFE_INTEGER;
      var maxTime = 0;
      var pointSet = new Set();

      //Loop through each play
      drive['plays'].forEach(function(play){

        yardCount += parseInt(play['YardsGained']);

        //Valid time entry
        if (!isNaN(parseInt(play['Time']))){
          minTime = Math.min(minTime, parseInt(play['Time']));
          maxTime = Math.max(maxTime, parseInt(play['Time']));
        }

        //Valid score entry
        if (!isNaN(parseInt(play['Score']))){
          pointSet.add(parseInt(play['Score']));
        }
      });

      timeCount += Math.abs(maxTime - minTime);

      //A score difference exists
      if (pointSet.size > 1){
        var arr = Array.from(pointSet);
        pointCount += Math.abs(arr[0] - arr[1]);
      }
    });

    //Set the metrics!
    qbMetrics[setIndex] = [driveCount, timeCount, yardCount, pointCount, playCount];

  });

  // ==========Step 6: Compute Metrics for Graph 6 ===========
  // TODO: 
});
