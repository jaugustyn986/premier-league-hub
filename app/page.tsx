import PremierLeagueDashboard from "@/components/premier-league-dashboard"

// Helper function to get the current season year
function getCurrentSeason() {
  const today = new Date();
  const year = today.getFullYear();
  // Premier League seasons start in August and end in May the next year
  // If today is before August, we're still in the previous season
  if (today.getMonth() < 7) {
    return year - 1;
  }
  return year;
}

async function getStandings() {
  const season = getCurrentSeason()
  const url = `https://v3.football.api-sports.io/standings?league=39&season=${season}`
  const apiKey = process.env.API_FOOTBALL_KEY
  const options = {
    method: "GET",
    headers: {
      "x-rapidapi-host": "v3.football.api-sports.io",
      "x-rapidapi-key": apiKey!,
    },
  }

  try {
    const response = await fetch(url, options)
    
    if (!response.ok) {
      console.error("API response not ok:", response.status, response.statusText)
      return getMockStandings()
    }
    
    const data = await response.json()
    
    if (data.errors && Object.keys(data.errors).length > 0) {
      console.error("API error fetching standings:", data.errors)
      return getMockStandings()
    }

    if (!data.response || data.response.length === 0 || !data.response[0].league || !data.response[0].league.standings) {
      console.error("Unexpected API response structure:", data)
      return getMockStandings()
    }
    const standingsData = data.response[0].league.standings[0]
    
    return standingsData.map((team: any) => ({
      position: team.rank,
      team: team.team.name,
      logo: team.team.logo,
      played: team.all.played,
      points: team.points,
      form: (team.form || "").split(""),
    }))
  } catch (error) {
    console.error("Error fetching standings:", error)
    return getMockStandings()
  }
}

async function getTopScorers(season: number) {
  const url = `https://v3.football.api-sports.io/players/topscorers?league=39&season=${season}`
  const options = {
    method: "GET",
    headers: {
      "x-rapidapi-host": "v3.football.api-sports.io",
      "x-rapidapi-key": process.env.API_FOOTBALL_KEY!,
    },
  }
  try {
    const response = await fetch(url, options)
    const data = await response.json()

    if (data.errors && Object.keys(data.errors).length > 0) {
      console.error("API error fetching top scorers:", data.errors)
      return getMockTopScorers()
    }

    if (!data.response) {
      console.error("Unexpected API response structure for top scorers:", data)
      return getMockTopScorers()
    }
    return data.response.map((item: any) => ({
      name: item.player.name,
      team: item.statistics[0].team.name,
      goals: item.statistics[0].goals.total,
      logo: item.statistics[0].team.logo,
      photo: item.player.photo,
    }))
  } catch (error) {
    console.error("Error fetching top scorers:", error)
    return getMockTopScorers()
  }
}

async function getMatches(season: number, from: string, to: string) {
  const url = `https://v3.football.api-sports.io/fixtures?league=39&season=${season}&from=${from}&to=${to}`
  const options = {
    method: "GET",
    headers: {
      "x-rapidapi-host": "v3.football.api-sports.io",
      "x-rapidapi-key": process.env.API_FOOTBALL_KEY!,
    },
  }
  try {
    const response = await fetch(url, options)
    const data = await response.json()
    console.log("API response for fixtures:", data)

    if (data.errors && Object.keys(data.errors).length > 0) {
      console.error(`API error fetching matches:`, data.errors)
      const fallback = from > to ? getMockResults() : getMockFixtures()
      console.log("Returning fallback fixtures (error):", fallback)
      return fallback
    }

    if (!data.response) {
      console.error(`Unexpected API response structure for matches:`, data)
      const fallback = from > to ? getMockResults() : getMockFixtures()
      console.log("Returning fallback fixtures (no response):", fallback)
      return fallback
    }
    const fixtures = data.response.map((match: any) => ({
      home: match.teams.home.name,
      away: match.teams.away.name,
      homeLogo: match.teams.home.logo,
      awayLogo: match.teams.away.logo,
      homeScore: match.goals.home,
      awayScore: match.goals.away,
      time: new Date(match.fixture.date).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
      date: new Date(match.fixture.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    })).sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime())
    console.log("Returning fixtures:", fixtures)
    return fixtures
  } catch (error) {
    console.error(`Error fetching matches:`, error)
    const fallback = from > to ? getMockResults() : getMockFixtures()
    console.log("Returning fallback fixtures (exception):", fallback)
    return fallback
  }
}

export default async function PremierLeagueHub() {
  const season = getCurrentSeason()
  const today = new Date()
  const fromDate = new Date()
  fromDate.setDate(today.getDate() - 7)
  const toDate = new Date()
  toDate.setDate(today.getDate() + 30)

  const formatDate = (date: Date) => date.toISOString().split('T')[0]

  const standings = await getStandings()
  const topScorers = await getTopScorers(season)
  const fixtures = await getMatches(season, formatDate(today), formatDate(toDate))
  const results = await getMatches(season, formatDate(fromDate), formatDate(today))
  const news = getMockNews()

  return (
    <PremierLeagueDashboard
      initialStandings={standings}
      news={news}
      fixtures={fixtures}
      results={results}
      topScorers={topScorers}
    />
  )
}

// Mock Data Functions
function getMockStandings() {
  return [
    { rank: 1, team: { name: "Liverpool" }, points: 82, all: { played: 38 }, form: "WWDWW" },
    { rank: 2, team: { name: "Manchester City" }, points: 80, all: { played: 38 }, form: "WWWLW" },
    { rank: 3, team: { name: "Arsenal" }, points: 79, all: { played: 38 }, form: "LWWWW" },
    { rank: 4, team: { name: "Tottenham Hotspur" }, points: 71, all: { played: 38 }, form: "WWLWL" },
    { rank: 5, team: { name: "Aston Villa" }, points: 68, all: { played: 38 }, form: "LDWLD" },
  ].map((s, i) => ({ 
    position: i + 1, 
    team: s.team.name,
    logo: `https://media.api-sports.io/football/teams/${getTeamId(s.team.name)}.png`,
    played: s.all.played,
    points: s.points,
    form: s.form.split('')
  }))
}

function getMockFixtures() {
  return [
    { home: "Arsenal", away: "Everton", time: "14:00", date: "Aug 17" },
    { home: "Chelsea", away: "Manchester City", time: "15:30", date: "Aug 18" },
  ].map((f) => ({ 
    ...f, 
    homeLogo: `https://media.api-sports.io/football/teams/${getTeamId(f.home)}.png`,
    awayLogo: `https://media.api-sports.io/football/teams/${getTeamId(f.away)}.png`,
  }))
}

function getMockResults() {
  return [
    { home: "Liverpool", away: "Wolves", homeScore: 2, awayScore: 0, date: "May 19" },
    { home: "Manchester United", away: "Brighton", homeScore: 2, awayScore: 0, date: "May 19" },
  ].map((r) => ({ 
    ...r, 
    homeLogo: `https://media.api-sports.io/football/teams/${getTeamId(r.home)}.png`,
    awayLogo: `https://media.api-sports.io/football/teams/${getTeamId(r.away)}.png`
  }))
}

function getMockTopScorers() {
  return [
    { player: { name: "Erling Haaland", photo: "https://media.api-sports.io/football/players/909.png" }, statistics: [{ team: { name: "Manchester City" }, goals: { total: 27 } }] },
    { player: { name: "Cole Palmer", photo: "https://media.api-sports.io/football/players/19187.png" }, statistics: [{ team: { name: "Chelsea" }, goals: { total: 22 } }] },
    { player: { name: "Alexander Isak", photo: "https://media.api-sports.io/football/players/745.png" }, statistics: [{ team: { name: "Newcastle United" }, goals: { total: 21 } }] },
  ].map((s) => ({
    name: s.player.name,
    team: s.statistics[0].team.name,
    goals: s.statistics[0].goals.total,
    photo: s.player.photo,
    logo: `https://media.api-sports.io/football/teams/${getTeamId(s.statistics[0].team.name)}.png`,
  }))
}

// Helper function to get team IDs for mock data
function getTeamId(teamName: string): number {
  const teamIds: { [key: string]: number } = {
    "Arsenal": 42,
    "Aston Villa": 66,
    "Brighton": 51,
    "Burnley": 44,
    "Chelsea": 49,
    "Crystal Palace": 52,
    "Everton": 45,
    "Fulham": 36,
    "Liverpool": 40,
    "Luton": 1359,
    "Manchester City": 50,
    "Manchester United": 33,
    "Newcastle": 34,
    "Newcastle United": 34,
    "Nottingham Forest": 65,
    "Sheffield Utd": 62,
    "Tottenham": 47,
    "Tottenham Hotspur": 47,
    "West Ham": 48,
    "Wolves": 39,
    "Brentford": 55,
  }
  return teamIds[teamName] || 1
}

function getMockNews() {
  return [
    {
      id: 1,
      title: "Premier League Announces 2024/25 Fixtures",
      source: "premierleague.com",
      timestamp: "1 day ago",
      image: "/file.svg",
    },
    {
      id: 2,
      title: "Transfer Speculation Mounts as Summer Window Opens",
      source: "Sky Sports",
      timestamp: "2 days ago",
      image: "/globe.svg",
    },
    {
      id: 3,
      title: "Arsenal's new signing scores on debut in 3-1 win over Brighton",
      source: "BBC Sport",
      timestamp: "3 hours ago",
    },
    {
      id: 4,
      title: "Manchester City in talks to sign midfielder from Real Madrid",
      source: "The Guardian",
      timestamp: "5 hours ago",
    },
    {
      id: 5,
      title: "Liverpool's title hopes dented after shock defeat to Nottingham Forest",
      source: "ESPN",
      timestamp: "1 day ago",
    }
  ]
} 