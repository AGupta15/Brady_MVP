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

//Map of QB to Team
var qbToTeam = {};

//Set of teams
var teams = new Set();

//WPA for Each Passer
var passerWPA = new Array(validPassers.size).fill(0);

//WPA for Team on Defense
var defenseWPA = new Array(32).fill(0);

//==============Data Parsing===================
d3.csv("pbp_2017_wp.csv", function(data) {

  // =======Step 1: QB Pass Counts========
  // console.log(data[100]);
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
    play['posTeam'] = data[i]['posteam'];
    play['HomeTeam'] = data[i]['HomeTeam'];
    play['AwayTeam'] = data[i]['AwayTeam'];
    play['HomeWPA'] = data[i]['Home_WP_post'];
    play['AwayWPA'] = data[i]['Away_WP_post'];

    if (play['posTeam'] == play['HomeTeam']){
      play['defTeam'] = play['HomeTeam'];
    }
    else {
      play['defTeam'] = play['AwayTeam'];
    }

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

  //Map QBs to teams
  validPassers.forEach(function(qb){
    var setIndex = validPasserArr.indexOf(qb);
    var team = qbToDrive[setIndex][0]['plays'][0]['posTeam'];
    teams.add(team);
    qbToTeam[qb] = team;
  });

  var teamsArr = Array.from(teams);

  //Aggregate win prob for each Passer when on field
  validPassers.forEach(function(qb){
    var setIndex = validPasserArr.indexOf(qb);
    var wpaCount = 0;
    var playCount = 0;

    var drives = qbToDrive[setIndex];
    drives.forEach(function(drive){
      drive['plays'].forEach(function(play){
        playCount += 1;
        if (qbToTeam[qb] == play['HomeTeam']){
          if (!isNaN(parseFloat(play['HomeWPA']))){
            wpaCount += parseFloat(play['HomeWPA']);
          }
        }
        else {
          if (!isNaN(parseFloat(play['AwayWPA']))){
            wpaCount += parseFloat(play['AwayWPA']);
          }
        }
      });
    });
    passerWPA[setIndex] = wpaCount/playCount;
  });

  //Aggregate win prob for each team while on defense
  teams.forEach(function(team){
    var playCount = 0;
    var wpCount = 0.0;
    var setIndex = Array.from(teams).indexOf(team);

    //Look through each drive
    driveList.forEach(function(drive){
      drive['plays'].forEach(function(play){

        //Only consider if team is on defense
        if (play['defTeam'] == team){
          playCount += 1;

          //Add WP based on whether home or away
          if (play['defTeam'] == play['HomeTeam']){
            if (!isNaN(parseFloat(play['HomeWPA']))){
              wpCount = wpCount + parseFloat(play['HomeWPA']);
            }
          }
          else {
            if (!isNaN(parseFloat(play['AwayWPA']))){
              wpCount = wpCount + parseFloat(play['AwayWPA']);
            }
          }
        }
      });
    });

    //Compute average WP
    defenseWPA[setIndex] = wpCount/(playCount+0.0);
  });
});

//==============Step 7: Convert to CSV==========================

/**
* Converts a value to a string appropriate for entry into a CSV table.  E.g., a string value will be surrounded by quotes.
* @param {string|number|object} theValue
* @param {string} sDelimiter The string delimiter.  Defaults to a double quote (") if omitted.
*/
function toCsvValue(theValue, sDelimiter) {
	var t = typeof (theValue), output;

	if (typeof (sDelimiter) === "undefined" || sDelimiter === null) {
		sDelimiter = '"';
	}

	if (t === "undefined" || t === null) {
		output = "";
	} else if (t === "string") {
		output = sDelimiter + theValue + sDelimiter;
	} else {
		output = String(theValue);
	}

	return output;
}

/**
* Converts an array of objects (with identical schemas) into a CSV table.
* @param {Array} objArray An array of objects.  Each object in the array must have the same property list.
* @param {string} sDelimiter The string delimiter.  Defaults to a double quote (") if omitted.
* @param {string} cDelimiter The column delimiter.  Defaults to a comma (,) if omitted.
* @return {string} The CSV equivalent of objArray.
*/
function toCsv(objArray, sDelimiter, cDelimiter) {
	var i, l, names = [], name, value, obj, row, output = "", n, nl;

	// Initialize default parameters.
	if (typeof (sDelimiter) === "undefined" || sDelimiter === null) {
		sDelimiter = '"';
	}
	if (typeof (cDelimiter) === "undefined" || cDelimiter === null) {
		cDelimiter = ",";
	}

	for (i = 0, l = objArray.length; i < l; i += 1) {
		// Get the names of the properties.
		obj = objArray[i];
		row = "";
		if (i === 0) {
			// Loop through the names
			for (name in obj) {
				if (obj.hasOwnProperty(name)) {
					names.push(name);
					row += [sDelimiter, name, sDelimiter, cDelimiter].join("");
				}
			}
			row = row.substring(0, row.length - 1);
			output += row;
		}

		output += "\n";
		row = "";
		for (n = 0, nl = names.length; n < nl; n += 1) {
			name = names[n];
			value = obj[name];
			if (n > 0) {
				row += ","
			}
			row += toCsvValue(value, '"');
		}
		output += row;
	}

	return output;
}

//Graph 1: Accuracy by Distance
function download_csv1() {
  var csv = 'passer,team,passerid,airyards,completion,int,td\n';
  var counter = 0;
  validPassers.forEach(function(passer){
    setIndex = Array.from(validPassers).indexOf(passer);
    team = qbToTeam[passer];
    passes = passSet[setIndex][passer]
    passes.forEach(function(pass){
      csv += passer+",";
      csv += team+",";
      csv += setIndex+",";
      csv += pass['AirYards']+","+pass['Completion']+",";
      csv += pass['Interception']+","+pass['Touchdown']+"\n";
    });
    counter = counter + 1;
  });

  console.log(csv);
  var hiddenElement = document.createElement('a');
  hiddenElement.href = 'data:text/csv;charset=utf-8,' + encodeURI(csv);
  hiddenElement.target = '_blank';
  hiddenElement.download = '../Desktop/people.csv';
  hiddenElement.click();
}

//Graph 2: Accuracy by Down
function download_csv2() {
  var csv = 'passer,team,passerid,down,completion,int,td\n';
  var counter = 0;
  validPassers.forEach(function(passer){
    setIndex = Array.from(validPassers).indexOf(passer);
    team = qbToTeam[passer];
    passes = passSet[setIndex][passer]
    passes.forEach(function(pass){
      csv += passer+",";
      csv += team+",";
      csv += setIndex+",";
      csv += pass['Down']+","+pass['Completion']+",";
      csv += pass['Interception']+","+pass['Touchdown']+"\n";
    });
    counter = counter + 1;
  });

  console.log(csv);
  var hiddenElement = document.createElement('a');
  hiddenElement.href = 'data:text/csv;charset=utf-8,' + encodeURI(csv);
  hiddenElement.target = '_blank';
  hiddenElement.download = '../Desktop/people.csv';
  hiddenElement.click();
}

//Graph 3: Accuracy by Point Spread
function download_csv3() {
  var csv = 'passer,team,passerid,scorediff,completion,int,td\n';
  var counter = 0;
  validPassers.forEach(function(passer){
    setIndex = Array.from(validPassers).indexOf(passer);
    team = qbToTeam[passer];
    passes = passSet[setIndex][passer]
    passes.forEach(function(pass){
      csv += passer+",";
      csv += team+",";
      csv += setIndex+",";
      diff = parseInt(pass['offScore'])-parseInt(pass['defScore']);
      csv += diff+",";
      csv += pass['Completion']+",";
      csv += pass['Interception']+","+pass['Touchdown']+"\n";
    });
    counter = counter + 1;
  });

  console.log(csv);
  var hiddenElement = document.createElement('a');
  hiddenElement.href = 'data:text/csv;charset=utf-8,' + encodeURI(csv);
  hiddenElement.target = '_blank';
  hiddenElement.download = '../Desktop/people.csv';
  hiddenElement.click();
}

//Graph 4: QB Effectiveness 4 metrics
// qbMetrics[setIndex] = [driveCount, timeCount, yardCount, pointCount, playCount];
function download_csv4() {
  var csv = 'passer,team,passerid,driveCount,timeCount,yardCount,pointCount,playCount\n';
  var counter = 0;
  validPassers.forEach(function(passer){
    setIndex = Array.from(validPassers).indexOf(passer);
    team = qbToTeam[passer];
    qbMetric = qbMetrics[setIndex];
    csv += passer+",";
    csv += team+",";
    csv += setIndex+",";
    csv += qbMetric[0]+",";
    csv += qbMetric[1]+",";
    csv += qbMetric[2]+",";
    csv += qbMetric[3]+",";
    csv += qbMetric[4]+"\n";
    counter = counter + 1;
  });

  console.log(csv);
  var hiddenElement = document.createElement('a');
  hiddenElement.href = 'data:text/csv;charset=utf-8,' + encodeURI(csv);
  hiddenElement.target = '_blank';
  hiddenElement.download = '../Desktop/people.csv';
  hiddenElement.click();
}

//Graph 5: WPA Difference
function download_csv5() {
  var csv = 'passer,team,passerid,passerWPA,defenseWPA\n';
  var counter = 0;
  validPassers.forEach(function(passer){
    setIndex = Array.from(validPassers).indexOf(passer);
    team = qbToTeam[passer];
    csv += passer+",";
    csv += team+",";
    csv += setIndex+",";
    csv += passerWPA[setIndex]+",";
    defIndex = Array.from(teams).indexOf(team)
    csv += defenseWPA[defIndex]+"\n";
    counter = counter + 1;
  });

  console.log(csv);
  var hiddenElement = document.createElement('a');
  hiddenElement.href = 'data:text/csv;charset=utf-8,' + encodeURI(csv);
  hiddenElement.target = '_blank';
  hiddenElement.download = '../Desktop/people.csv';
  hiddenElement.click();
}
