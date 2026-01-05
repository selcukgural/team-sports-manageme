import { useKV } from '@github/spark/hooks'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { ChartBar, Trophy, Target } from '@phosphor-icons/react'
import { Player, Event, PlayerStats } from '@/lib/types'

export default function StatsView() {
  const [roster = []] = useKV<Player[]>('roster', [])
  const [events = []] = useKV<Event[]>('events', [])
  const [playerStats = []] = useKV<PlayerStats[]>('playerStats', [])

  const games = events.filter(e => e.type === 'game')
  const practices = events.filter(e => e.type === 'practice')

  const getPlayerAttendanceRate = (playerId: string) => {
    const playerEvents = events.filter(e => e.availability[playerId])
    const availableCount = playerEvents.filter(e => e.availability[playerId] === 'available').length
    return playerEvents.length > 0 ? Math.round((availableCount / playerEvents.length) * 100) : 0
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const getRateColor = (rate: number) => {
    if (rate >= 80) return 'text-primary'
    if (rate >= 60) return 'text-yellow-600'
    return 'text-destructive'
  }

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-6 md:py-8 space-y-6 md:space-y-8">
      <div>
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-2">Team Statistics</h1>
        <p className="text-muted-foreground">Performance metrics and attendance tracking</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground uppercase tracking-wide font-medium mb-1">Total Games</p>
                <p className="text-3xl font-bold">{games.length}</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center">
                <Trophy size={24} className="text-accent" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground uppercase tracking-wide font-medium mb-1">Total Practices</p>
                <p className="text-3xl font-bold">{practices.length}</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <Target size={24} className="text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground uppercase tracking-wide font-medium mb-1">Team Size</p>
                <p className="text-3xl font-bold">{roster.length}</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-secondary/10 flex items-center justify-center">
                <ChartBar size={24} className="text-secondary" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {roster.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <ChartBar size={64} className="text-muted-foreground/50 mb-4" />
            <h3 className="text-xl font-semibold mb-2">No data available</h3>
            <p className="text-muted-foreground">Add players and events to see statistics</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Player Attendance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[300px]">Player</TableHead>
                    <TableHead className="text-center">Jersey #</TableHead>
                    <TableHead className="text-center">Position</TableHead>
                    <TableHead className="text-center">Attendance Rate</TableHead>
                    <TableHead className="text-center">Events Responded</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {roster.map(player => {
                    const attendanceRate = getPlayerAttendanceRate(player.id)
                    const respondedEvents = events.filter(e => e.availability[player.id]).length
                    
                    return (
                      <TableRow key={player.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="w-10 h-10 border-2 border-primary/20">
                              <AvatarFallback className="bg-primary text-primary-foreground font-bold">
                                {getInitials(player.name)}
                              </AvatarFallback>
                            </Avatar>
                            <span className="font-medium">{player.name}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant="secondary" className="font-bold">
                            #{player.jerseyNumber}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant="outline">{player.position}</Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <span className={`font-bold text-lg ${getRateColor(attendanceRate)}`}>
                            {attendanceRate}%
                          </span>
                        </TableCell>
                        <TableCell className="text-center">
                          <span className="text-muted-foreground">
                            {respondedEvents} / {events.length}
                          </span>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {events.length > 0 && roster.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Event Participation</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {events
                .slice()
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                .slice(0, 10)
                .map(event => {
                  const availableCount = Object.values(event.availability).filter(s => s === 'available').length
                  const maybeCount = Object.values(event.availability).filter(s => s === 'maybe').length
                  const unavailableCount = Object.values(event.availability).filter(s => s === 'unavailable').length
                  const totalResponses = Object.keys(event.availability).length
                  const responseRate = roster.length > 0 ? Math.round((totalResponses / roster.length) * 100) : 0

                  return (
                    <div key={event.id} className="flex items-center gap-4 p-4 rounded-lg border border-border">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold">{event.title}</h4>
                          <Badge variant="outline" className="capitalize">{event.type}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{event.date}</p>
                      </div>
                      <div className="flex gap-6 text-sm">
                        <div className="text-center">
                          <p className="text-2xl font-bold text-primary">{availableCount}</p>
                          <p className="text-xs text-muted-foreground">Available</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold text-yellow-600">{maybeCount}</p>
                          <p className="text-xs text-muted-foreground">Maybe</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold text-destructive">{unavailableCount}</p>
                          <p className="text-xs text-muted-foreground">Unavailable</p>
                        </div>
                        <div className="text-center border-l pl-6">
                          <p className="text-2xl font-bold">{responseRate}%</p>
                          <p className="text-xs text-muted-foreground">Response Rate</p>
                        </div>
                      </div>
                    </div>
                  )
                })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
