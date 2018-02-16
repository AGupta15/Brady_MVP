# INFO4310_MVP

This dataset contains 100 columns (see the nflscrapR game_play_by_play() and season_play_by_play() function documentation for descriptions).

https://github.com/ryurko/nflscrapR-data 

Through list manipulation using the do.call and rbind functions a 13 column dataframe with basic information populates directly from the NFL JSON API. These columns include the following:

"Drive" - Drive number

"sp" - Whether the play resulted in a score (any kind of score)

"qtr" - Quarter of Game

"down" - Down of the given play

"time" - Time at start of play

"yrdln" - Between 0 and 50

"ydstogo" - Yards to go for a first down

"ydsnet" - Total yards gained on a given drive

"posteam" - The team on offense

"AirYards" - Number of yards the ball was thrown in the air for both complete and incomplete pass attempts (negative means behind line of scrimmage)

"YardsAfterCatch" - Number of yards receiver gained after catch

"QBHit" - Binary: 1 if the QB was knocked to the ground else 0

"desc" - A detailed description of what occured during the play

Through string manipulation and parsing of the description column using base R and stringR, columns were added to the original dataframe allowing the user to have a detailed breakdown of the events of each play. Also provided are calculations for the expected points and win probability for each play using models built entirely on nflscrapR data. The added variables are specified below:

"Date" - Date of game

"GameID" - The ID of the specified game

"TimeSecs" - Time remaining in game in seconds

"PlayTimeDiff" - The time difference between plays in seconds

"DefensiveTeam" - The defensive team on the play (for punts the receiving team is on defense, for kickoffs the receiving team is on offense)

"TimeUnder" - Minutes remaining in half

"SideofField" - The side of the field that the line of scrimmage is on

yrdline100 - Distance to opponents endzone, ranges from 1-99 situation

GoalToGo - Binary: 1 if the play is in a goal down situation else 0

"FirstDown" - Binary: 1if the play resulted in a first down conversion else 0

"PlayAttempted" - A variable used to count the number of plays in a game (should always be equal to 1)

"Yards.Gained" - Amount of yards gained on the play

"Touchdown" - Binary: 1 if the play resulted in a TD else 0

"ExPointResult" - Result of the extra-point: Made, Missed, Blocked, Aborted

"TwoPointConv" - Result of two-point conversion: Success or Failure

"DefTwoPoint" - Result of defensive two-point conversion: Success or Failure

"Safety" - Binary: 1 if safety was recorded else 0

"Onsidekick" - Binary: 1 if the kickoff was an onside kick

"PuntResult - Result of punt: Clean or Blocked

"PlayType" - The type of play that occured, potential values are:

Kickoff, Punt

Pass, Sack, Run

Field Goal, Extra Point

Quarter End, Two Minute Warning, Half End, End of Game

No Play, QB Kneel, Spike, Timeout

"Passer" - The passer on the play if it was a pass play

"Passer_ID" - NFL GSIS player ID for the passer

"PassAttempt" - Binary: 1 if a pass was attempted else 0

"PassOutcome" - Pass Result: Complete or Incomplete Pass

"PassLength" - Categorical variable indicating the length of the pass: Short or Deep

"PassLocation" - Location of the pass: left, middle, right

"InterceptionThrown" - Binary: 1 if an interception else 0

"Interceptor" - The player who intercepted the ball

"Rusher" - The runner on the play if it was a running play

"Rusher_ID" - NFL GSIS player ID for the rusher

"RushAttempt" - Binary: 1 if a run was attempted else 0

"RunLocation" - Location of the run: left, middle, right

"RunGap" - Gap of the run: guard, tackle, end

"Receiver" - The targeted receiver of a play

"Receiver_ID" - NFL GSIS player ID for the receiver

"Reception" - Binary: 1 if a reception was recorded else 0

"ReturnResult" - Result of a punt, kickoff, interception, or fumble return: Fair Catch, Touchback, Touchdown

"Returner" - The punt or kickoff returner

"BlockingPlayer" - The player who blocked the extra point, field goal, or punt

"Tackler1" - The primary tackler on the play

"Tackler2" - The secondary tackler on the play

"FieldGoalResult" - Outcome of a fieldgoal: No Good, Good, Blocked

"FieldGoalDistance" - Field goal length in yards

"Fumble" - Binary: 1 if a fumble occured else no

"RecFumbTeam" - Team that recovered the fumble

"RecFumbPlayer" - Player that recovered the fumble

"Sack" - Binary: 1 if a sack was recorded else 0

"Challenge.Replay" - Binary: 1 if play was reviewed by the replay official else 0

"ChalReplayResult" - Result of the replay review: Upheld or Reversed

"Accepted.Penalty" - Binary: 1 if penalty was accepted else 0

"PenalizedTeam" - The penalized team on the play

"PenaltyType" - Type of penalty on the play, alues include:

Unnecessary Roughness, Roughing the Passer

Illegal Formation, Defensive Offside

Delay of Game, False Start, Illegal Shift

Illegal Block Above the Waist, Personal Foul

Unnecessary Roughness, Illegal Blindside Block

Defensive Pass Interference, Offensive Pass Interference

Fair Catch Interference, Unsportsmanlike Conduct

Running Into the Kicker, Illegal Kick

Illegal Contact, Defensive Holding

Illegal Motion, Low Block

Illegal Substitution, Neutral Zone Infraction

Ineligible Downfield Pass, Roughing the Passer

Illegal Use of Hands, Defensive Delay of Game

Defensive 12 On-field, Offensive Offside

Tripping, Taunting, Chop Block

Interference with Opportunity to Catch, Illegal Touch Pass

Illegal Touch Kick, Offside on Free Kick

Intentional Grounding, Horse Collar

Illegal Forward Pass, Player Out of Bounds on Punt

Clipping, Roughing the Kicker, Ineligible Downfield Kick

Offensive 12 On-field, Disqualification

"PenalizedPlayer" - The penalized player

"Penalty.Yards" - The number of yards that the penalty resulted in

"PosTeamScore" - The score of the possession team (offensive team)

"DefTeamScore" - The score of the defensive team

"ScoreDiff" - The difference in score between the offensive and defensive teams (offensive.score - def.score)

"AbsScoreDiff" - Absolute value of the score differential

"HomeTeam" - The home team

"AwayTeam" - The away team

"Timeout_Indicator" - Binary: 1 if a timeout was charge else 0

"Timeout_Team" - Team charged with penalty (None if no timeout)

"posteam_timeouts_pre" - Number of timeouts remaining for possession team at the start of the play

"HomeTimeouts_Remaining_Pre" - Number of timeouts remaining for home team at the start of the play

"AwayTimeouts_Remaining_Pre" - Number of timeouts remaining for away team at the start of the play

"HomeTimeouts_Remaining_Post" - Number of timeouts remaining for home team at the end of the play (handles loss of timeout from lost challenge)

"AwayTimeouts_Remaining_Post" - Number of timeouts remaining for away team at the end of the play (handles loss of timeout from lost challenge)

"No_Score_Prob" - Probability of no score occurring within the half

"Opp_Field_Goal_Prob" - Probability of the defensive team scoring a field goal next

"Opp_Safety_Prob" - Probability of the defensive team scoring a safety next

"Opp_Touchdown_Prob" - Probability of the defensive team scoring a touchdown next

"Field_Goal_Prob" - Probability of the possession team scoring a field goal next

"Safety_Prob" - Probability of the possession team scoring a safety next

"Touchdown_Prob" - Probability of the possession team scoring a touchdown next

"ExPoint_Prob" - Probability of the possession team making the PAT

"TwoPoint_Prob" - Probability of the possession team converting the two-point conversion

"ExpPts" - The expected points for the possession team at the start of the play

"EPA" - Expected points added with respect to the possession team considering the result of the play

"airEPA" - Expected points added from air yards

"yacEPA" - Expected points added from yards after catch

"Home_WP_pre" - The win probability for the home team at the start of the play

"Away_WP_pre" - The win probability for the away team at the start of the play

"Home_WP_post" - The win probability for the home team at the end of the play

"Away_WP_post" - The win probability for the away team at the end of the play

"Win_Prob" - The win probability added for team with possession

"WPA" - The win probability added with respect to the possession team