"use client"

import type React from "react"
import { useState } from "react"
import {
  Calendar,
  Clock,
  Trophy,
  Users,
  TrendingUp,
  Star,
  ArrowRight,
  Heart,
  X,
  Check,
  ChevronDown,
} from "lucide-react"
import { MessageCircle, Share2, MoreHorizontal, ImageIcon, Video, Twitter, Repeat2, Reply } from "lucide-react"
import Image from "next/image"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Textarea } from "@/components/ui/textarea"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

import type { StandingsTeam, Fixture, TopScorer, NewsItem } from "@/app/page"

export default function PremierLeagueDashboard({
  initialStandings,
  news,
  fixtures,
  results,
  topScorers,
}: {
  initialStandings: StandingsTeam[]
  news: NewsItem[]
  fixtures: Fixture[]
  results: Fixture[]
  topScorers: TopScorer[]
}) {
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null)
  const [isTeamDialogOpen, setIsTeamDialogOpen] = useState(false)
  const [likedPosts, setLikedPosts] = useState<Set<number>>(new Set())
  const [newPost, setNewPost] = useState("")
  const [isTableExpanded, setIsTableExpanded] = useState(false)
  const [isNewsExpanded, setIsNewsExpanded] = useState(true)
  const [isTwitterExpanded, setIsTwitterExpanded] = useState(true)
  const [isFixturesExpanded, setIsFixturesExpanded] = useState(true)

  const [isCustomizeMode, setIsCustomizeMode] = useState(false)
  const [sectionOrder, setSectionOrder] = useState([
    "team-overview",
    "news",
    "fixtures",
    "twitter",
    "league-table",
    "top-scorers",
    "quick-stats",
    "social-feed",
  ])
  const [sectionSizes, setSectionSizes] = useState({
    "team-overview": "col-span-2",
    news: "col-span-2",
    fixtures: "col-span-2",
    twitter: "col-span-1",
    "league-table": "col-span-1 row-span-2",
    "top-scorers": "col-span-1",
    "quick-stats": "col-span-1",
    "social-feed": "col-span-3",
  })

  const teams = [
    { name: "Arsenal", shortName: "ARS", color: "bg-red-600", logo: "https://media.api-sports.io/football/teams/42.png" },
    { name: "Aston Villa", shortName: "AVL", color: "bg-purple-600", logo: "https://media.api-sports.io/football/teams/66.png" },
    { name: "Brighton", shortName: "BHA", color: "bg-blue-500", logo: "https://media.api-sports.io/football/teams/51.png" },
    { name: "Brentford", shortName: "BRE", color: "bg-red-500", logo: "https://media.api-sports.io/football/teams/55.png" },
    { name: "Burnley", shortName: "BUR", color: "bg-red-600", logo: "https://media.api-sports.io/football/teams/44.png" },
    { name: "Chelsea", shortName: "CHE", color: "bg-blue-600", logo: "https://media.api-sports.io/football/teams/49.png" },
    { name: "Crystal Palace", shortName: "CRY", color: "bg-red-500", logo: "https://media.api-sports.io/football/teams/52.png" },
    { name: "Everton", shortName: "EVE", color: "bg-blue-700", logo: "https://media.api-sports.io/football/teams/45.png" },
    { name: "Fulham", shortName: "FUL", color: "bg-white border-2 border-gray-800", logo: "https://media.api-sports.io/football/teams/36.png" },
    { name: "Liverpool", shortName: "LIV", color: "bg-red-700", logo: "https://media.api-sports.io/football/teams/40.png" },
    { name: "Luton", shortName: "LUT", color: "bg-orange-600", logo: "https://media.api-sports.io/football/teams/1359.png" },
    { name: "Manchester City", shortName: "MCI", color: "bg-sky-500", logo: "https://media.api-sports.io/football/teams/50.png" },
    { name: "Manchester United", shortName: "MUN", color: "bg-red-600", logo: "https://media.api-sports.io/football/teams/33.png" },
    { name: "Newcastle", shortName: "NEW", color: "bg-gray-800", logo: "https://media.api-sports.io/football/teams/34.png" },
    { name: "Nottingham Forest", shortName: "NFO", color: "bg-red-600", logo: "https://media.api-sports.io/football/teams/65.png" },
    { name: "Sheffield Utd", shortName: "SHU", color: "bg-red-600", logo: "https://media.api-sports.io/football/teams/62.png" },
    { name: "Tottenham", shortName: "TOT", color: "bg-white border-2 border-gray-800", logo: "https://media.api-sports.io/football/teams/47.png" },
    { name: "West Ham", shortName: "WHU", color: "bg-purple-800", logo: "https://media.api-sports.io/football/teams/48.png" },
    { name: "Wolves", shortName: "WOL", color: "bg-orange-600", logo: "https://media.api-sports.io/football/teams/39.png" },
  ]

  const getTeamColor = (teamName: string) => {
    const team = teams.find((t) => t.name === teamName)
    return team?.color || "bg-gray-500"
  }

  const getTeamShortName = (teamName: string) => {
    const team = teams.find((t) => t.name === teamName)
    return team?.shortName || teamName.slice(0, 3).toUpperCase()
  }

  const getTeamLogo = (teamName: string) => {
    const team = teams.find((t) => t.name === teamName)
    return team?.logo || ""
  }

  // Helper function to extract team names from news titles
  const extractTeamsFromTitle = (title: string) => {
    const foundTeams = teams.filter(team => 
      title.toLowerCase().includes(team.name.toLowerCase())
    )
    return foundTeams
  }

  // Helper function to get the appropriate logo for news items
  const getNewsLogo = (title: string) => {
    const foundTeams = extractTeamsFromTitle(title)
    
    if (foundTeams.length === 0) {
      // No teams mentioned, show Premier League logo
      return "https://media.api-sports.io/football/leagues/39.png"
    } else if (foundTeams.length === 1) {
      // Single team mentioned, show that team's logo
      return foundTeams[0].logo
    } else {
      // Multiple teams mentioned, show Premier League logo
      return "https://media.api-sports.io/football/leagues/39.png"
    }
  }

  // Filter content based on selected team
  const getFilteredNews = () => {
    if (!selectedTeam) return news
    return [
      ...news.filter((newsItem) => newsItem.title.includes(selectedTeam)),
      ...news.filter((newsItem) => !newsItem.title.includes(selectedTeam)),
    ]
  }

  const getTeamFixtures = () => {
    if (!selectedTeam) return fixtures
    return fixtures.filter((fixture) => fixture.home === selectedTeam || fixture.away === selectedTeam)
  }

  const getTeamResults = () => {
    if (!selectedTeam) return results
    return results.filter((result) => result.home === selectedTeam || result.away === selectedTeam)
  }

  const getTeamPosition = () => {
    if (!selectedTeam) return null
    return initialStandings.find((team) => team.team === selectedTeam)
  }

  const getSocialFeed = (teamName: string) => {
    const allPosts = [
      {
        id: 1,
        user: {
          name: "Sarah Mitchell",
          username: "@sarahm_arsenal",
          avatar: "/next.svg",
          verified: false,
        },
        content: "What a performance from the boys today! That second goal was absolutely sublime 🔥⚽",
        timestamp: "2 hours ago",
        likes: 127,
        comments: 23,
        shares: 8,
        type: "text",
        team: "Arsenal",
      },
      {
        id: 2,
        user: {
          name: "Arsenal FC",
          username: "@Arsenal",
          avatar: "/next.svg",
          verified: true,
        },
        content:
          "FULL TIME: Arsenal 3-1 Brighton\n\nA fantastic team performance! Goals from Saka, Martinelli and Ødegaard secure all three points at the Emirates. 🔴⚪",
        timestamp: "3 hours ago",
        likes: 2847,
        comments: 456,
        shares: 892,
        type: "match_result",
        team: "Arsenal",
        image: "/next.svg",
      },
      {
        id: 3,
        user: {
          name: "Mike Thompson",
          username: "@mikethompson",
          avatar: "/next.svg",
          verified: false,
        },
        content: "Haaland is just different level! That hat-trick was pure class 👑",
        timestamp: "4 hours ago",
        likes: 89,
        comments: 12,
        shares: 3,
        type: "text",
        team: "Manchester City",
      },
      {
        id: 4,
        user: {
          name: "Liverpool FC",
          username: "@LFC",
          avatar: "/next.svg",
          verified: true,
        },
        content:
          "🚨 TRANSFER UPDATE: We're delighted to announce the signing of midfielder João Silva from Benfica for £85M. Welcome to Liverpool! 🔴\n\n#YNWA #LFC",
        timestamp: "6 hours ago",
        likes: 5234,
        comments: 1247,
        shares: 2156,
        type: "transfer",
        team: "Liverpool",
        image: "/next.svg",
      },
      {
        id: 5,
        user: {
          name: "Emma Wilson",
          username: "@emmawilson_lfc",
          avatar: "/next.svg",
          verified: false,
        },
        content:
          "Been supporting Liverpool for 20 years and this signing has me so excited! Silva is exactly what we needed in midfield 🙌",
        timestamp: "5 hours ago",
        likes: 156,
        comments: 34,
        shares: 7,
        type: "text",
        team: "Liverpool",
      },
      {
        id: 6,
        user: {
          name: "The Athletic",
          username: "@TheAthletic",
          avatar: "/next.svg",
          verified: true,
        },
        content: "Inside the tactics that saw Tottenham Hotspur dominate Chelsea in a 4-1 thrashing. [read more]",
        timestamp: "8 hours ago",
        likes: 892,
        comments: 134,
        shares: 213,
        type: "analysis",
        team: "Tottenham",
      },
      {
        id: 7,
        user: {
          name: "Man Utd Fan TV",
          username: "@mufc_fan_tv",
          avatar: "/next.svg",
          verified: false,
        },
        content:
          "🎥 WATCH: Our instant reaction to the disappointing 2-2 draw with Everton. Is it time for a change in management? 🤔",
        timestamp: "10 hours ago",
        likes: 432,
        comments: 211,
        shares: 56,
        type: "video",
        team: "Manchester United",
        image: "/next.svg",
      },
      {
        id: 8,
        user: {
          name: "Premier League",
          username: "@premierleague",
          avatar: "/next.svg",
          verified: true,
        },
        content: "A look back at some of the best goals from Matchweek 5! Which one was your favorite? 🚀",
        timestamp: "12 hours ago",
        likes: 7892,
        comments: 1245,
        shares: 3456,
        type: "highlights",
        team: "Premier League",
        image: "/next.svg",
      },
    ]

    if (!teamName) {
      // Show a generic feed if no team is selected
      return allPosts
        .filter((post) => post.team === "Premier League")
        .sort((a, b) => convertTimeToMinutes(a.timestamp) - convertTimeToMinutes(b.timestamp))
    }

    const teamPosts = allPosts.filter((post) => post.team === teamName)
    const otherPosts = allPosts.filter((post) => post.team !== teamName)

    return [...teamPosts, ...otherPosts].sort(
      (a, b) => convertTimeToMinutes(a.timestamp) - convertTimeToMinutes(b.timestamp)
    )
  }

  const getTwitterFeed = (teamName?: string | null) => {
    const tweets = [
      {
        id: 1,
        user: { name: "Fabrizio Romano", username: "@FabrizioRomano", avatar: "/next.svg", verified: true },
        content:
          "Understand Chelsea are now advancing on deal to sign Michael Olise. Positive talks, player is keen on the move. 🔵 #CFC",
        timestamp: "15m",
      },
      {
        id: 2,
        user: { name: "David Ornstein", username: "@David_Ornstein", avatar: "/next.svg", verified: true },
        content:
          "EXCLUSIVE: Manchester United have submitted a formal bid for Jarrad Branthwaite. Everton expected to reject the opening offer. More on @TheAthleticFC",
        timestamp: "45m",
      },
      {
        id: 3,
        user: { name: "Sky Sports Premier League", username: "@SkySportsPL", avatar: "/next.svg", verified: true },
        content:
          "🚨 BREAKING: Arsenal have agreed personal terms with striker Viktor Gyökeres. Club-to-club negotiations with Sporting CP to follow.",
        timestamp: "1h",
      },
      {
        id: 4,
        user: { name: "Goal", username: "@goal", avatar: "/next.svg", verified: true },
        content: "Is this the season Liverpool get back to the top? 🤔",
        timestamp: "3h",
      },
      {
        id: 5,
        user: { name: "Official FPL", username: "@OfficialFPL", avatar: "/next.svg", verified: true },
        content: "Son Heung-min's price has been revealed for the 2024/25 season! Are you including him in your squad? #FPL",
        timestamp: "5h",
      },
      {
        id: 6,
        user: { name: "TheSecretScout", username: "@TheSecretScout", avatar: "/next.svg", verified: true },
        content: "Keep an eye on Crystal Palace this season. Dougie Freedman is cooking something special there.",
        timestamp: "8h",
      },
      {
        id: 7,
        user: { name: "James Pearce", username: "@JamesPearceLFC", avatar: "/next.svg", verified: true },
        content: "No significant movement on a new deal for Trent Alexander-Arnold yet, but all parties remain relaxed. #LFC",
        timestamp: "12h",
      },
    ]

    if (!teamName) return tweets

    const teamTweets = tweets.filter((tweet) =>
      tweet.content.toLowerCase().includes(teamName.toLowerCase().split(" ")[0])
    )
    const otherTweets = tweets.filter(
      (tweet) => !tweet.content.toLowerCase().includes(teamName.toLowerCase().split(" ")[0])
    )

    return [...teamTweets, ...otherTweets]
  }

  const convertTimeToMinutes = (timestamp: string) => {
    if (timestamp.includes("m")) {
      return parseInt(timestamp)
    }
    if (timestamp.includes("h")) {
      return parseInt(timestamp) * 60
    }
    if (timestamp.includes("d")) {
      return parseInt(timestamp) * 60 * 24
    }
    return 0
  }

  const handleLike = (postId: number) => {
    setLikedPosts((prev) => {
      const newLikedPosts = new Set(prev)
      if (newLikedPosts.has(postId)) {
        newLikedPosts.delete(postId)
      } else {
        newLikedPosts.add(postId)
      }
      return newLikedPosts
    })
  }

  const getPostIcon = (type: string) => {
    switch (type) {
      case "match_result":
        return <Trophy className="h-4 w-4" />
      case "transfer":
        return <Users className="h-4 w-4" />
      case "analysis":
        return <TrendingUp className="h-4 w-4" />
      case "video":
        return <Video className="h-4 w-4" />
      case "highlights":
        return <Star className="h-4 w-4" />
      default:
        return null
    }
  }

  // --- UI Rendering ---

  const renderSection = (sectionId: string) => {
    const sectionComponents: { [key: string]: React.ReactNode } = {
      "team-overview": (
        <Card
          className="bg-white dark:bg-gray-800 shadow-lg"
        >
          <CardHeader>
            <CardTitle>Team Overview</CardTitle>
            <CardDescription>Key information about your selected team</CardDescription>
          </CardHeader>
          <CardContent>
            {selectedTeam ? (
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <Avatar className="w-16 h-16">
                    <AvatarImage src={getTeamLogo(selectedTeam)} alt={`${selectedTeam} logo`} />
                    <AvatarFallback className={`text-2xl font-bold text-white ${getTeamColor(selectedTeam)}`}>
                      {getTeamShortName(selectedTeam)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h2 className="text-2xl font-bold">{selectedTeam}</h2>
                    <p className="text-sm text-gray-500">Premier League</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="font-semibold">League Position</p>
                    <p>{getTeamPosition()?.position || "N/A"}</p>
                  </div>
                  <div>
                    <p className="font-semibold">Points</p>
                    <p>{getTeamPosition()?.points || "N/A"}</p>
                  </div>
                  <div>
                    <p className="font-semibold">Form</p>
                    <div className="flex space-x-1">
                      {(getTeamPosition()?.form || []).map((result: string, index: number) => (
                        <span
                          key={index}
                          className={`w-5 h-5 flex items-center justify-center rounded-full text-xs font-bold text-white ${
                            result === "W"
                              ? "bg-green-500"
                              : result === "D"
                              ? "bg-gray-400"
                              : result === "L"
                              ? "bg-red-500"
                              : "bg-gray-300"
                          }`}
                        >
                          {result}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <p>Select a team to see their overview.</p>
              </div>
            )}
          </CardContent>
        </Card>
      ),
      "social-feed": (
        <Card
          className="bg-white dark:bg-gray-800 shadow-lg h-full flex flex-col"
        >
          <CardHeader>
            <CardTitle>Comments</CardTitle>
            <CardDescription>Share your thoughts with other fans</CardDescription>
          </CardHeader>
          <CardContent className="flex-grow overflow-y-auto space-y-4">
            <div className="flex space-x-2 border-b pb-4">
              <Textarea
                placeholder="Write a comment..."
                value={newPost}
                onChange={(e) => setNewPost(e.target.value)}
                className="flex-grow"
              />
              <Button disabled={!newPost.trim()}>Post</Button>
            </div>
            {getSocialFeed(selectedTeam || "Premier League").map((post) => (
              <div key={post.id} className="flex flex-col text-sm border-b pb-2 mb-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold">{post.user.name}</span>
                  <span className="text-xs text-gray-400">{post.timestamp}</span>
                </div>
                <p className="mt-1 whitespace-pre-wrap">{post.content}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      ),
      news: (
        <Card
          className="bg-white dark:bg-gray-800 shadow-lg h-full"
        >
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Latest News</CardTitle>
              <CardDescription>Top stories from around the league</CardDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setIsNewsExpanded(!isNewsExpanded)}>
              <ChevronDown className={`w-5 h-5 transition-transform ${isNewsExpanded ? "" : "-rotate-90"}`} />
            </Button>
          </CardHeader>
          {isNewsExpanded && (
            <CardContent>
              <div className="space-y-4">
                {getFilteredNews().map((item) => (
                  <div key={item.id} className="flex items-start space-x-4">
                    <Avatar className="w-12 h-12 rounded-lg">
                      <AvatarImage src={getNewsLogo(item.title)} />
                      <AvatarFallback>
                        <ImageIcon />
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-grow">
                      <p className="font-semibold leading-tight">{item.title}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {item.source} · {item.timestamp}
                      </p>
                    </div>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          )}
        </Card>
      ),
      fixtures: (
        <Card className="w-full bg-white dark:bg-gray-800 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-center flex items-center gap-2">
                <Calendar className="inline-block w-5 h-5 text-green-600" />
                Fixtures & Results
              </CardTitle>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setIsFixturesExpanded(!isFixturesExpanded)}>
              <ChevronDown className={`w-5 h-5 transition-transform ${isFixturesExpanded ? "" : "-rotate-90"}`} />
            </Button>
          </CardHeader>
          {isFixturesExpanded && (
            <CardContent>
              <Tabs defaultValue="fixtures" className="w-full">
                <TabsList className="w-full flex justify-center mb-4 bg-gray-100 dark:bg-gray-900 rounded-lg">
                  <TabsTrigger value="fixtures" className="flex-1">Upcoming Fixtures</TabsTrigger>
                  <TabsTrigger value="results" className="flex-1">Recent Results</TabsTrigger>
                </TabsList>
                <TabsContent value="fixtures">
                  <div className="divide-y divide-gray-200">
                    {getTeamFixtures().map((fixture: any, index: number) => (
                      <div key={index} className="flex items-center justify-between py-4">
                        <div className="flex items-center gap-2 min-w-[120px]">
                          <Avatar className="w-8 h-8">
                            <AvatarImage src={fixture.homeLogo} alt={fixture.home} />
                            <AvatarFallback>{fixture.home.slice(0, 1)}</AvatarFallback>
                          </Avatar>
                          <span className="font-medium">{fixture.home}</span>
                        </div>
                        <div className="flex flex-col items-center min-w-[80px]">
                          <span className="text-xs text-gray-400">{fixture.date}</span>
                          <span className="font-bold text-lg">{fixture.time}</span>
                        </div>
                        <div className="flex items-center gap-2 min-w-[120px] justify-end">
                          <span className="font-medium">{fixture.away}</span>
                          <Avatar className="w-8 h-8">
                            <AvatarImage src={fixture.awayLogo} alt={fixture.away} />
                            <AvatarFallback>{fixture.away.slice(0, 1)}</AvatarFallback>
                          </Avatar>
                        </div>
                      </div>
                    ))}
                  </div>
                </TabsContent>
                <TabsContent value="results">
                  <div className="divide-y divide-gray-200">
                    {getTeamResults().map((result: any, index: number) => (
                      <div key={index} className="flex items-center justify-between py-4">
                        <div className="flex items-center gap-2 min-w-[120px]">
                          <Avatar className="w-8 h-8">
                            <AvatarImage src={result.homeLogo} alt={result.home} />
                            <AvatarFallback>{result.home.slice(0, 1)}</AvatarFallback>
                          </Avatar>
                          <span className="font-medium">{result.home}</span>
                        </div>
                        <div className="flex flex-col items-center min-w-[80px]">
                          <span className="font-bold text-lg">{typeof result.homeScore !== 'undefined' && typeof result.awayScore !== 'undefined' ? `${result.homeScore} - ${result.awayScore}` : '-'}</span>
                          <span className="text-xs text-gray-400">{result.date}</span>
                        </div>
                        <div className="flex items-center gap-2 min-w-[120px] justify-end">
                          <span className="font-medium">{result.away}</span>
                          <Avatar className="w-8 h-8">
                            <AvatarImage src={result.awayLogo} alt={result.away} />
                            <AvatarFallback>{result.away.slice(0, 1)}</AvatarFallback>
                          </Avatar>
                        </div>
                      </div>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          )}
        </Card>
      ),
      "league-table": (
        <Card
          className="bg-white dark:bg-gray-800 shadow-lg"
        >
          <CardHeader>
            <CardTitle>League Table</CardTitle>
            <CardDescription>Current PL Standings</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex text-xs text-gray-500 font-medium">
                <div className="w-6">#</div>
                <div className="flex-1">Team</div>
                <div className="w-8 text-center">P</div>
                <div className="w-8 text-center">Pts</div>
                <div className="w-20 text-center">Form</div>
              </div>
              {initialStandings.slice(0, isTableExpanded ? 20 : 10).map((team: any, index: number) => (
                <div key={index} className="flex items-center text-sm font-medium">
                  <div className="w-6">{team.position}</div>
                  <div className="flex-1 flex items-center space-x-2">
                    <Avatar className="w-5 h-5">
                      <AvatarImage src={team.logo} alt={team.team} />
                      <AvatarFallback>{team.team.slice(0, 1)}</AvatarFallback>
                    </Avatar>
                    <span>{team.team}</span>
                  </div>
                  <div className="w-8 text-center">{team.played}</div>
                  <div className="w-8 text-center font-bold">{team.points}</div>
                  <div className="w-20 flex justify-center space-x-1">
                    {team.form.map((result: string, index: number) => (
                      <span
                        key={index}
                        className={`w-4 h-4 flex items-center justify-center rounded-full text-xs font-bold text-white ${
                          result === "W"
                            ? "bg-green-500"
                            : result === "D"
                            ? "bg-gray-400"
                            : result === "L"
                            ? "bg-red-500"
                            : "bg-gray-300"
                        }`}
                      >
                        {result}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <Button variant="link" size="sm" className="w-full mt-2" onClick={() => setIsTableExpanded(!isTableExpanded)}>
              {isTableExpanded ? "Show Less" : "Show More"}
            </Button>
          </CardContent>
        </Card>
      ),
      twitter: (
        <Card
          className="bg-white dark:bg-gray-800 shadow-lg h-full max-h-[500px] overflow-y-auto"
        >
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="flex items-center space-x-2">
              <Twitter className="w-6 h-6 text-[#1DA1F2]" />
              <div>
                <CardTitle>Twitter Feed</CardTitle>
                <CardDescription>Live updates from top sources</CardDescription>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setIsTwitterExpanded(!isTwitterExpanded)}>
              <ChevronDown className={`w-5 h-5 transition-transform ${isTwitterExpanded ? "" : "-rotate-90"}`} />
            </Button>
          </CardHeader>
          {isTwitterExpanded && (
            <CardContent className="space-y-4">
              {getTwitterFeed(selectedTeam).map((tweet) => (
                <div key={tweet.id} className="flex space-x-3 text-sm">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={tweet.user.avatar} alt={tweet.user.name} />
                    <AvatarFallback>{tweet.user.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-grow">
                    <div className="flex items-center space-x-1">
                      <span className="font-bold">{tweet.user.name}</span>
                      {tweet.user.verified && <Check className="w-4 h-4 text-blue-500" />}
                      <span className="text-gray-500">{tweet.user.username}</span>
                      <span className="text-gray-500">· {tweet.timestamp}</span>
                    </div>
                    <p className="mt-1">{tweet.content}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          )}
        </Card>
      ),
      "top-scorers": (
        <Card
          className="bg-white dark:bg-gray-800 shadow-lg"
        >
          <CardHeader>
            <CardTitle>Top Scorers</CardTitle>
            <CardDescription>Golden Boot Race</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {topScorers.slice(0, 5).map((scorer: any, index: number) => (
              <div key={index} className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-2">
                  <span className="w-5 font-bold">{index + 1}</span>
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={scorer.photo || "/next.svg"} alt={scorer.name} />
                    <AvatarFallback>{scorer.name.split(" ").map((n: string) => n[0]).join("")}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold">{scorer.name}</p>
                    <div className="flex items-center space-x-1 text-xs text-gray-500">
                      <Avatar className="w-4 h-4">
                        <AvatarImage src={scorer.logo} alt={scorer.team} />
                        <AvatarFallback>{scorer.team.slice(0, 1)}</AvatarFallback>
                      </Avatar>
                      <span>{scorer.team}</span>
                    </div>
                  </div>
                </div>
                <div className="font-bold text-lg">{scorer.goals}</div>
              </div>
            ))}
          </CardContent>
        </Card>
      ),
      "quick-stats": (
        <Card
          className="bg-white dark:bg-gray-800 shadow-lg"
        >
          <CardHeader>
            <CardTitle>Quick Stats</CardTitle>
            <CardDescription>Season at a glance</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-gray-600">Matches Played</span>
              <span className="font-bold">380</span>
            </div>
            <Separator />
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-gray-600">Goals Scored</span>
              <span className="font-bold">1084</span>
            </div>
            <Separator />
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-gray-600">Avg. Goals/Match</span>
              <span className="font-bold">2.85</span>
            </div>
          </CardContent>
        </Card>
      ),
    }

    return (
      <div className={sectionSizes[sectionId as keyof typeof sectionSizes]}>
        {sectionComponents[sectionId]}
      </div>
    )
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <Image src="https://media.api-sports.io/football/leagues/39.png" alt="Premier League Logo" width={40} height={40} />
            <h1 className="text-xl font-bold">Premier League Hub</h1>
          </div>
          <div className="flex items-center space-x-4">
            <Dialog open={isTeamDialogOpen} onOpenChange={setIsTeamDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  {selectedTeam ? (
                    <div className="flex items-center space-x-2">
                      <Avatar className="w-5 h-5">
                        <AvatarImage src={getTeamLogo(selectedTeam)} alt={`${selectedTeam} logo`} />
                        <AvatarFallback>{getTeamShortName(selectedTeam)}</AvatarFallback>
                      </Avatar>
                      <span>{selectedTeam}</span>
                    </div>
                  ) : (
                    "Select Your Team"
                  )}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Choose Your Favorite Team</DialogTitle>
                  <DialogDescription>
                    Personalize your dashboard by selecting your favorite Premier League team.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid grid-cols-2 gap-3 py-4">
                  {teams.map((team) => (
                    <Button
                      key={team.name}
                      variant={selectedTeam === team.name ? "default" : "outline"}
                      className="flex items-center space-x-2 justify-start h-12"
                      onClick={() => {
                        if (selectedTeam === team.name) {
                          setSelectedTeam(null)
                        } else {
                          setSelectedTeam(team.name)
                        }
                        setIsTeamDialogOpen(false)
                      }}
                    >
                      <Avatar className="w-6 h-6">
                        <AvatarImage src={team.logo} alt={`${team.name} logo`} />
                        <AvatarFallback className={`text-xs font-bold text-white ${team.color}`}>
                          {team.shortName}
                        </AvatarFallback>
                      </Avatar>
                      <span>{team.name}</span>
                    </Button>
                  ))}
                </div>
              </DialogContent>
            </Dialog>

            <Button
              variant={isCustomizeMode ? "default" : "outline"}
              onClick={() => setIsCustomizeMode(!isCustomizeMode)}
            >
              {isCustomizeMode ? "Done" : "Customize"}
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 auto-rows-min">
          <div className="lg:col-span-2 flex flex-col gap-6">
            {renderSection("team-overview")}
            {renderSection("news")}
            {renderSection("fixtures")}
          </div>
          <div className="flex flex-col gap-6">
            {renderSection("league-table")}
            {renderSection("twitter")}
            {renderSection("quick-stats")}
            {renderSection("top-scorers")}
          </div>
        </div>
        <div className="mt-8">
          {renderSection("social-feed")}
        </div>
      </main>
    </div>
  )
} 