import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus, Trophy, Target, Calendar, MapPin, Clock, CheckCircle, XCircle, Question } from '@phosphor-icons/react'
import { Event, EventType, Player, AvailabilityStatus } from '@/lib/types'
import { format, parseISO, isAfter } from 'date-fns'
import { toast } from 'sonner'
import { useTeamFlowAPI } from '@/hooks/use-teamflow-api'

export default function ScheduleView() {
  const api = useTeamFlowAPI()
  const events = api.events.getAll()
  const roster = api.players.getAll()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingEvent, setEditingEvent] = useState<Event | null>(null)
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)

  const [formData, setFormData] = useState({
    title: '',
    type: 'practice' as EventType,
    date: '',
    time: '',
    location: '',
    opponent: '',
    notes: '',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (editingEvent) {
      const updated = api.events.update(editingEvent.id, formData)
      if (updated) {
        toast.success('Event updated successfully')
      } else {
        toast.error('Failed to update event')
      }
    } else {
      api.events.create(formData)
      toast.success('Event created successfully')
    }

    setIsDialogOpen(false)
    resetForm()
  }

  const resetForm = () => {
    setFormData({
      title: '',
      type: 'practice',
      date: '',
      time: '',
      location: '',
      opponent: '',
      notes: '',
    })
    setEditingEvent(null)
  }

  const handleEdit = (event: Event) => {
    setEditingEvent(event)
    setFormData({
      title: event.title,
      type: event.type,
      date: event.date,
      time: event.time,
      location: event.location,
      opponent: event.opponent || '',
      notes: event.notes || '',
    })
    setIsDialogOpen(true)
  }

  const handleDelete = (eventId: string) => {
    const deleted = api.events.delete(eventId)
    if (deleted) {
      setSelectedEvent(null)
      toast.success('Event deleted')
    } else {
      toast.error('Failed to delete event')
    }
  }

  const handleAvailability = (eventId: string, status: AvailabilityStatus) => {
    const updated = api.events.updateAvailability(eventId, {
      playerId: 'current-user',
      status
    })
    if (updated) {
      toast.success(`Marked as ${status}`)
    } else {
      toast.error('Failed to update availability')
    }
  }

  const upcomingEvents = events
    .filter(event => isAfter(parseISO(event.date), new Date()))
    .sort((a, b) => parseISO(a.date).getTime() - parseISO(b.date).getTime())

  const pastEvents = events
    .filter(event => !isAfter(parseISO(event.date), new Date()))
    .sort((a, b) => parseISO(b.date).getTime() - parseISO(a.date).getTime())

  const getEventIcon = (type: EventType) => {
    switch (type) {
      case 'game':
        return Trophy
      case 'practice':
        return Target
      default:
        return Calendar
    }
  }

  const getEventColor = (type: EventType) => {
    switch (type) {
      case 'game':
        return 'bg-accent text-accent-foreground'
      case 'practice':
        return 'bg-primary text-primary-foreground'
      default:
        return 'bg-secondary text-secondary-foreground'
    }
  }

  const EventCard = ({ event }: { event: Event }) => {
    const Icon = getEventIcon(event.type)
    const availableCount = Object.values(event.availability).filter(s => s === 'available').length
    const maybeCount = Object.values(event.availability).filter(s => s === 'maybe').length
    const unavailableCount = Object.values(event.availability).filter(s => s === 'unavailable').length
    const userStatus = event.availability['current-user']

    return (
      <Card className="hover:shadow-lg transition-all hover:-translate-y-0.5">
        <CardContent className="p-4 md:p-6">
          <div className="flex gap-4">
            <div className={`w-12 h-12 md:w-14 md:h-14 rounded-lg ${getEventColor(event.type)} flex items-center justify-center flex-shrink-0`}>
              <Icon size={24} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2 mb-2">
                <h3 className="font-bold text-lg truncate">{event.title}</h3>
                <Badge variant="outline" className="flex-shrink-0 capitalize">
                  {event.type}
                </Badge>
              </div>
              
              <div className="space-y-1.5 mb-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar size={16} className="flex-shrink-0" />
                  <span>{format(parseISO(event.date), 'EEEE, MMM d, yyyy')}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock size={16} className="flex-shrink-0" />
                  <span>{event.time}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin size={16} className="flex-shrink-0" />
                  <span>{event.location}</span>
                </div>
                {event.opponent && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Trophy size={16} className="flex-shrink-0" />
                    <span>vs {event.opponent}</span>
                  </div>
                )}
              </div>

              <div className="flex flex-wrap gap-2 mb-4">
                <div className="flex items-center gap-1 text-xs">
                  <CheckCircle size={16} className="text-primary" weight="fill" />
                  <span className="font-medium">{availableCount}</span>
                </div>
                <div className="flex items-center gap-1 text-xs">
                  <Question size={16} className="text-yellow-500" weight="fill" />
                  <span className="font-medium">{maybeCount}</span>
                </div>
                <div className="flex items-center gap-1 text-xs">
                  <XCircle size={16} className="text-destructive" weight="fill" />
                  <span className="font-medium">{unavailableCount}</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  variant={userStatus === 'available' ? 'default' : 'outline'}
                  onClick={() => handleAvailability(event.id, 'available')}
                  className="gap-1"
                >
                  <CheckCircle size={16} />
                  Available
                </Button>
                <Button
                  size="sm"
                  variant={userStatus === 'maybe' ? 'default' : 'outline'}
                  onClick={() => handleAvailability(event.id, 'maybe')}
                  className="gap-1"
                >
                  <Question size={16} />
                  Maybe
                </Button>
                <Button
                  size="sm"
                  variant={userStatus === 'unavailable' ? 'destructive' : 'outline'}
                  onClick={() => handleAvailability(event.id, 'unavailable')}
                  className="gap-1"
                >
                  <XCircle size={16} />
                  Unavailable
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleEdit(event)}
                >
                  Edit
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleDelete(event.id)}
                  className="text-destructive"
                >
                  Delete
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-6 md:py-8 space-y-6 md:space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-2">Schedule</h1>
          <p className="text-muted-foreground">Manage team events and track availability</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open)
          if (!open) resetForm()
        }}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus size={20} />
              <span className="hidden sm:inline">Add Event</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingEvent ? 'Edit Event' : 'Create New Event'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="title">Event Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="type">Event Type</Label>
                <Select value={formData.type} onValueChange={(value: EventType) => setFormData({ ...formData, type: value })}>
                  <SelectTrigger id="type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="practice">Practice</SelectItem>
                    <SelectItem value="game">Game</SelectItem>
                    <SelectItem value="event">Event</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="date">Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="time">Time</Label>
                  <Input
                    id="time"
                    type="time"
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  required
                />
              </div>

              {formData.type === 'game' && (
                <div>
                  <Label htmlFor="opponent">Opponent</Label>
                  <Input
                    id="opponent"
                    value={formData.opponent}
                    onChange={(e) => setFormData({ ...formData, opponent: e.target.value })}
                  />
                </div>
              )}

              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingEvent ? 'Update' : 'Create'} Event
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {events.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Calendar size={64} className="text-muted-foreground/50 mb-4" />
            <h3 className="text-xl font-semibold mb-2">No events yet</h3>
            <p className="text-muted-foreground mb-4">Create your first event to get started</p>
            <Button onClick={() => setIsDialogOpen(true)} className="gap-2">
              <Plus size={20} />
              Create Event
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          {upcomingEvents.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold">Upcoming Events</h2>
              <div className="space-y-4">
                {upcomingEvents.map(event => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
            </div>
          )}

          {pastEvents.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold">Past Events</h2>
              <div className="space-y-4 opacity-60">
                {pastEvents.map(event => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
