var transitionDuration = 1000;


//Colors from https://teamcolorcodes.com/nfl-team-color-codes/
//Logos from https://www.seeklogo.net/
var teamAttributes = {
  "ARI": {
    "color": "#820E2A",
    "icon": "https://www.seeklogo.net/wp-content/uploads/2014/12/Arizona-Cardinals-logo-vector.jpg"
  },
  "ATL": {
    "color": "#A6192E",
    "icon": "https://www.seeklogo.net/wp-content/uploads/2012/12/atlanta-falcons-logo-vector-400x400.png"
  },
  "BAL": {
    "color": "#3E2D79",
    "icon": "https://www.seeklogo.net/wp-content/uploads/2012/05/baltimore-ravens-logo-vector-01.png"
  },
  "BUF": {
    "color": "#003087",
    "icon": "https://www.seeklogo.net/wp-content/uploads/2012/05/buffalo-bills-logo-vector-01.png"
  },
  "CAR": {
    "color": "#0085CA",
    "icon": "https://www.seeklogo.net/wp-content/uploads/2012/11/carolina-panthers-logo-vector-400x400.png"
  },
  "CHI": {
    "color": "#0B162A",
    "icon": "https://www.seeklogo.net/wp-content/uploads/2011/05/chicago-bears-logo-vector-400x400.png"
  },
  "CIN": {
    "color": "#FC4C02",
    "icon": "https://www.seeklogo.net/wp-content/uploads/2012/05/cincinnati-bengals-logo-vector-01.png"
  },
  "CLE": {
    "color": "#EB3300",
    "icon": "https://www.seeklogo.net/wp-content/uploads/2015/08/cleveland-browns-logo-vector-download-400x400.jpg"
  },
  "DAL": {
    "color": "#041E42",
    "icon": "https://www.seeklogo.net/wp-content/uploads/2011/05/dallas-cowboys-logo-vector-400x400.png"
  },
  "DEN": {
    "color": "#0C2340",
    "icon": "https://www.seeklogo.net/wp-content/uploads/2012/10/denver-broncos-logo-vector-400x400.png"
  },
  "DET": {
    "color": "#0069B1",
    "icon": "https://www.seeklogo.net/wp-content/uploads/2017/02/detroit-lions-logo.png"
  },
  "GB": {
    "color": "#183028",
    "icon": "https://www.seeklogo.net/wp-content/uploads/2012/12/green-bay-packers-logo-vector-400x400.png"
  },
  "HOU": {
    "color": "#A6192E",
    "icon": "https://www.seeklogo.net/wp-content/uploads/2012/11/houston-texans-logo-vector-400x400.png"
  },
  "IND": {
    "color": "#003A70",
    "icon": "https://www.seeklogo.net/wp-content/uploads/2015/08/indianapolis-colts-logo-vector-download-400x400.jpg"
  },
  "JAX": {
    "color": "#006272",
    "icon": "https://www.seeklogo.net/wp-content/uploads/2015/08/jacksonville-jaguars-logo-vector-download-400x400.jpg"
  },
  "KC": {
    "color": "#C8102E",
    "icon": "https://www.seeklogo.net/wp-content/uploads/2015/08/kansas-city-chiefs-logo-vector-download-400x400.jpg"
  },
  "LAC": {
    "color": "#0073CF",
    "icon": "https://www.seeklogo.net/wp-content/uploads/2012/10/san-diego-chargers-logo-vector-400x400.png"
  },
  "LA": {
    "color": "#041E42",
    "icon": "https://www.seeklogo.net/wp-content/uploads/2015/08/st-louis-rams-vector-logo-400x400.png"
  },
  "MIA": {
    "color": "#008E97",
    "icon": "https://www.seeklogo.net/wp-content/uploads/2015/08/miami-dolphins-vector-logo-400x400.png"
  },
  "MIN": {
    "color": "#4F2683",
    "icon": "https://www.seeklogo.net/wp-content/uploads/2012/10/minnesota-vikings-logo-vector-400x400.png"
  },
  "NE": {
    "color": "#263D5A",
    "icon": "https://www.seeklogo.net/wp-content/uploads/2014/10/new-england-patriots-logo-preview-400x400.png"
  },
  "NO": {
    "color": "#BAA374",
    "icon": "https://www.seeklogo.net/wp-content/uploads/2012/12/new-orleans-saints-logo-vector-400x400.png"
  },
  "NYG": {
    "color": "#0B2265",
    "icon": "https://www.seeklogo.net/wp-content/uploads/2011/05/new-york-giants-logo-vector-400x400.png"
  },
  "NYJ": {
    "color": "#445D54",
    "icon": "https://www.seeklogo.net/wp-content/uploads/2011/05/new-york-jets-logo-vector-01.png"
  },
  "OAK": {
    "color": "#A2AAAD",
    "icon": "https://www.seeklogo.net/wp-content/uploads/2012/10/oakland-raiders-logo-vector-400x400.png"
  },
  "PHI": {
    "color": "#1A626B",
    "icon": "https://www.seeklogo.net/wp-content/uploads/2014/10/philadelphia-eagles-logo-400x400.png"
  },
  "PIT": {
    "color": "#FFB81C",
    "icon": "https://www.seeklogo.net/wp-content/uploads/2011/05/pittsburgh-steelers-logo-vector-01.png"
  },
  "SF": {
    "color": "#A6192E",
    "icon": "https://www.seeklogo.net/wp-content/uploads/2011/06/san-francisco-49ers-logo-vector-400x400.png"
  },
  "SEA": {
    "color": "#78BE20",
    "icon": "https://www.seeklogo.net/wp-content/uploads/2012/10/seattle-seahawks-logo-vector-400x400.png"
  },
  "TB": {
    "color": "#C8102E",
    "icon": "https://www.seeklogo.net/wp-content/uploads/2012/12/tampa-bay-buccaneers-logo-vector-400x400.png"
  },
  "TEN": {
    "color": "#418FDE",
    "icon": "https://www.seeklogo.net/wp-content/uploads/2015/08/tennessee-titans-logo-vector-download-400x400.jpg"
  },
  "WAS": {
    "color": "#651D32",
    "icon": "https://www.seeklogo.net/wp-content/uploads/2011/05/washington-redskins-logo-vector-400x400.png"
  },
  "NFL": {
    "color": "#8A8A8A",
    "icon": "https://www.seeklogo.net/wp-content/uploads/2014/10/nfl-logo-National-Football-League-400x400.png"
  }
}
