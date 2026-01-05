import { useKV } from '@github/spark/hooks'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CalendarBlank, Users, ChatCircle, Trophy, Calendar, Target } from '@phosphor-icons/react'
import { Event, Player, Message } from '@/lib/types'
import { format, isAfter, parseISO } from 'date-fns'

interface DashboardViewProps {
  onNavigate: (view: 'schedule' | 'roster' | 'messages' | 'stats') => void
}

export default function DashboardView({ onNavigate }: DashboardViewProps) {
  const [events = []] = useKV<Event[]>('events', [])
  const [roster = []] = useKV<Player[]>('roster', [])
  const [messages = []] = useKV<Message[]>('messages', [])

  const upcomingEvents = events
    .filter(event => isAfter(parseISO(event.date), new Date()))
    .sort((a, b) => parseISO(a.date).getTime() - parseISO(b.date).getTime())
    .slice(0, 3)

  const recentMessages = messages
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, 3)

  const getEventIcon = (type: Event['type']) => {
    switch (type) {
      case 'game':
        return Trophy
      case 'practice':
        return Target
      default:
        return Calendar
    }
  }

  const getEventColor = (type: Event['type']) => {
    switch (type) {
      case 'game':
        return 'bg-accent text-accent-foreground'
      case 'practice':
        return 'bg-primary text-primary-foreground'
      default:
        return 'bg-secondary text-secondary-foreground'
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-6 md:py-8 space-y-6 md:space-y-8">
      <div>
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-2">Welcome Back</h1>
        <p className="text-muted-foreground text-lg">Here's what's happening with your team</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => onNavigate('schedule')}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground uppercase tracking-wide font-medium mb-1">Upcoming Events</p>
                <p className="text-3xl font-bold">{upcomingEvents.length}</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <CalendarBlank size={24} className="text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => onNavigate('roster')}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground uppercase tracking-wide font-medium mb-1">Team Members</p>
                <p className="text-3xl font-bold">{roster.length}</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-secondary/10 flex items-center justify-center">
                <Users size={24} className="text-secondary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => onNavigate('messages')}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground uppercase tracking-wide font-medium mb-1">Messages</p>
                <p className="text-3xl font-bold">{messages.length}</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center">
                <ChatCircle size={24} className="text-accent" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Upcoming Events</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => onNavigate('schedule')}>
              View All
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {upcomingEvents.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <CalendarBlank size={48} className="mx-auto mb-3 opacity-50" />
                <p>No upcoming events</p>
                <Button variant="link" onClick={() => onNavigate('schedule')} className="mt-2">
                  Create your first event
                </Button>
              </div>
            ) : (
              upcomingEvents.map((event) => {
                const Icon = getEventIcon(event.type)
                const availableCount = Object.values(event.availability).filter(s => s === 'available').length
                const totalResponses = Object.keys(event.availability).length

                return (
                  <div key={event.id} className="flex gap-4 p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors">
                    <div className={`w-12 h-12 rounded-lg ${getEventColor(event.type)} flex items-center justify-center flex-shrink-0`}>
                      <Icon size={24} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-semibold truncate">{event.title}</h3>
                        <Badge variant="outline" className="text-xs flex-shrink-0">
                          {event.type}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {format(parseISO(event.date), 'MMM d, yyyy')} at {event.time}
                      </p>
                      <p className="text-sm text-muted-foreground">{event.location}</p>
                      {totalResponses > 0 && (
                        <p className="text-xs text-primary font-medium mt-2">
                          {availableCount} / {roster.length} available
                        </p>
                      )}
                    </div>
                  </div>
                )
              })
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Messages</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => onNavigate('messages')}>
              View All
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentMessages.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <ChatCircle size={48} className="mx-auto mb-3 opacity-50" />
                <p>No messages yet</p>
                <Button variant="link" onClick={() => onNavigate('messages')} className="mt-2">
                  Send your first message
                </Button>
              </div>
            ) : (
              recentMessages.map((message) => (
                <div key={message.id} className="p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <p className="font-semibold text-sm">{message.sender}</p>
                    <Badge variant="secondary" className="text-xs">
                      {message.recipients}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2">{message.content}</p>
                  <p className="text-xs text-muted-foreground mt-2">
                    {format(new Date(message.timestamp), 'MMM d, h:mm a')}
                  </p>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
