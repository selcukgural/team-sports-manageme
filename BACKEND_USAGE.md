# TeamFlow Backend Usage Guide

## 📚 Overview

This guide demonstrates how to use the TeamFlow backend service layer in your React components. The service layer provides a clean, type-safe API that abstracts data persistence operations.

## 🔧 Installation

The backend services are already configured. Simply import the `useTeamFlowAPI` hook in any component.

```typescript
import { useTeamFlowAPI } from '@/hooks/use-teamflow-api'
```

## 🎯 Basic Usage

### Getting Started

```typescript
import { useTeamFlowAPI } from '@/hooks/use-teamflow-api'

function MyComponent() {
  const api = useTeamFlowAPI()

  // Now you have access to all services:
  // - api.players
  // - api.events
  // - api.files
  // - api.messages
  // - api.stats
}
```

---

## 1️⃣ Player Management

### Get All Players

```typescript
function RosterList() {
  const api = useTeamFlowAPI()
  const allPlayers = api.players.getAll()

  return (
    <div>
      {allPlayers.map(player => (
        <div key={player.id}>
          {player.name} - #{player.jerseyNumber}
        </div>
      ))}
    </div>
  )
}
```

### Create a New Player

```typescript
function AddPlayerForm() {
  const api = useTeamFlowAPI()

  const handleSubmit = (formData: any) => {
    const newPlayer = api.players.create({
      name: formData.name,
      jerseyNumber: formData.jerseyNumber,
      position: formData.position,
      email: formData.email,
      phone: formData.phone,
      emergencyContact: formData.emergencyContact,
      emergencyPhone: formData.emergencyPhone,
    })

    toast.success(`Player ${newPlayer.name} added successfully!`)
  }

  return <form onSubmit={handleSubmit}>...</form>
}
```

### Update a Player

```typescript
function EditPlayer({ playerId }: { playerId: string }) {
  const api = useTeamFlowAPI()

  const handleUpdate = () => {
    const updated = api.players.update(playerId, {
      position: 'Forward',
      jerseyNumber: '23',
    })

    if (updated) {
      toast.success('Player updated!')
    }
  }

  return <button onClick={handleUpdate}>Update Position</button>
}
```

### Delete a Player

```typescript
function DeletePlayerButton({ playerId }: { playerId: string }) {
  const api = useTeamFlowAPI()

  const handleDelete = () => {
    const success = api.players.delete(playerId)
    
    if (success) {
      toast.success('Player removed from roster')
    } else {
      toast.error('Failed to remove player')
    }
  }

  return <button onClick={handleDelete}>Remove Player</button>
}
```

### Search Players

```typescript
function PlayerSearch() {
  const api = useTeamFlowAPI()
  const [query, setQuery] = useState('')

  const results = api.players.search(query)

  return (
    <div>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search players..."
      />
      {results.map(player => (
        <div key={player.id}>{player.name}</div>
      ))}
    </div>
  )
}
```

---

## 2️⃣ Event Management

### Get Upcoming Events

```typescript
function UpcomingEvents() {
  const api = useTeamFlowAPI()
  const upcoming = api.events.getUpcoming(5)

  return (
    <div>
      <h2>Next 5 Events</h2>
      {upcoming.map(event => (
        <div key={event.id}>
          <h3>{event.title}</h3>
          <p>{event.date} at {event.time}</p>
          <p>{event.location}</p>
        </div>
      ))}
    </div>
  )
}
```

### Create an Event

```typescript
function CreateEvent() {
  const api = useTeamFlowAPI()

  const handleCreate = () => {
    const newEvent = api.events.create({
      title: 'Practice Session',
      type: 'practice',
      date: '2024-02-15',
      time: '18:00',
      location: 'Main Field',
      notes: 'Bring water bottles',
    })

    toast.success(`Event created: ${newEvent.title}`)
  }

  return <button onClick={handleCreate}>Create Practice</button>
}
```

### Update Player Availability

```typescript
function AvailabilityButton({ eventId, playerId }: { eventId: string; playerId: string }) {
  const api = useTeamFlowAPI()

  const handleAvailability = (status: 'available' | 'maybe' | 'unavailable') => {
    api.events.updateAvailability(eventId, {
      playerId,
      status,
    })

    toast.success(`Availability updated to ${status}`)
  }

  return (
    <div>
      <button onClick={() => handleAvailability('available')}>✓ Available</button>
      <button onClick={() => handleAvailability('maybe')}>? Maybe</button>
      <button onClick={() => handleAvailability('unavailable')}>✗ Unavailable</button>
    </div>
  )
}
```

### Get Availability Statistics

```typescript
function EventAvailability({ eventId }: { eventId: string }) {
  const api = useTeamFlowAPI()
  const stats = api.events.getAvailabilityStats(eventId)

  return (
    <div>
      <div>Available: {stats.available}</div>
      <div>Maybe: {stats.maybe}</div>
      <div>Unavailable: {stats.unavailable}</div>
      <div>No Response: {stats.noResponse}</div>
    </div>
  )
}
```

### Filter Events

```typescript
function GamesOnly() {
  const api = useTeamFlowAPI()
  const games = api.events.getAll({ type: 'game' })

  return (
    <div>
      {games.map(game => (
        <div key={game.id}>
          {game.title} vs {game.opponent}
        </div>
      ))}
    </div>
  )
}
```

---

## 3️⃣ File Management

### Upload Files

```typescript
function FileUpload() {
  const api = useTeamFlowAPI()

  const handleFileUpload = async (files: FileList) => {
    for (const file of Array.from(files)) {
      const reader = new FileReader()
      
      reader.onload = () => {
        api.files.create({
          name: file.name,
          type: file.type,
          url: reader.result as string,
          uploadedBy: 'Coach Johnson',
          category: file.type.startsWith('image/') ? 'photo' : 'document',
        })
      }
      
      reader.readAsDataURL(file)
    }

    toast.success('Files uploaded successfully!')
  }

  return (
    <input
      type="file"
      multiple
      onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
    />
  )
}
```

### Get Files by Category

```typescript
function PhotoGallery() {
  const api = useTeamFlowAPI()
  const photos = api.files.getFilesByCategory('photo')

  return (
    <div className="grid grid-cols-3 gap-4">
      {photos.map(photo => (
        <img key={photo.id} src={photo.url} alt={photo.name} />
      ))}
    </div>
  )
}
```

### Enable File Sharing

```typescript
function ShareFileButton({ fileId }: { fileId: string }) {
  const api = useTeamFlowAPI()

  const handleShare = () => {
    const shareData = api.files.enableSharing(fileId)
    
    if (shareData) {
      navigator.clipboard.writeText(shareData.shareUrl)
      toast.success('Share link copied to clipboard!')
    }
  }

  return <button onClick={handleShare}>Share File</button>
}
```

### Disable File Sharing

```typescript
function DisableShareButton({ fileId }: { fileId: string }) {
  const api = useTeamFlowAPI()

  const handleDisable = () => {
    const success = api.files.disableSharing(fileId)
    
    if (success) {
      toast.success('File sharing disabled')
    }
  }

  return <button onClick={handleDisable}>Disable Sharing</button>
}
```

### Get Shared File

```typescript
function SharedFileViewer() {
  const api = useTeamFlowAPI()
  const [shareId, setShareId] = useState('')
  
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const id = params.get('share')
    if (id) setShareId(id)
  }, [])

  const file = shareId ? api.files.getByShareId(shareId) : undefined

  if (!file) {
    return <div>File not found or sharing disabled</div>
  }

  return (
    <div>
      <h1>{file.name}</h1>
      <img src={file.url} alt={file.name} />
    </div>
  )
}
```

---

## 4️⃣ Message Management

### Get Recent Messages

```typescript
function MessageFeed() {
  const api = useTeamFlowAPI()
  const recentMessages = api.messages.getRecent(10)

  return (
    <div>
      {recentMessages.map(message => (
        <div key={message.id}>
          <strong>{message.sender}</strong>
          <p>{message.content}</p>
          <small>{new Date(message.timestamp).toLocaleString()}</small>
        </div>
      ))}
    </div>
  )
}
```

### Send a Message

```typescript
function SendMessage() {
  const api = useTeamFlowAPI()
  const [content, setContent] = useState('')

  const handleSend = () => {
    api.messages.create({
      sender: 'Coach Johnson',
      content,
      recipients: 'all',
    })

    setContent('')
    toast.success('Message sent!')
  }

  return (
    <div>
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Type your message..."
      />
      <button onClick={handleSend}>Send to All</button>
    </div>
  )
}
```

### Filter Messages by Recipients

```typescript
function PlayerMessages() {
  const api = useTeamFlowAPI()
  const playerMessages = api.messages.getByRecipients('players')

  return (
    <div>
      <h2>Messages for Players</h2>
      {playerMessages.map(msg => (
        <div key={msg.id}>{msg.content}</div>
      ))}
    </div>
  )
}
```

---

## 5️⃣ Statistics Management

### Record Player Stats

```typescript
function RecordGameStats({ gameId }: { gameId: string }) {
  const api = useTeamFlowAPI()

  const handleRecordStats = (playerId: string) => {
    api.stats.create({
      playerId,
      gameId,
      points: 15,
      assists: 7,
      rebounds: 10,
    })

    toast.success('Stats recorded!')
  }

  return <button onClick={() => handleRecordStats('player-123')}>Record Stats</button>
}
```

### Get Player Aggregated Stats

```typescript
function PlayerStatsCard({ playerId }: { playerId: string }) {
  const api = useTeamFlowAPI()
  const aggregated = api.stats.getPlayerAggregatedStats(playerId)

  return (
    <div>
      <h3>Season Stats</h3>
      <p>Games Played: {aggregated.totalGames}</p>
      <p>Total Points: {aggregated.totalPoints}</p>
      <p>Average Points: {aggregated.averagePoints.toFixed(1)}</p>
      <p>Total Assists: {aggregated.totalAssists}</p>
      <p>Average Assists: {aggregated.averageAssists.toFixed(1)}</p>
    </div>
  )
}
```

### Get Top Scorers

```typescript
function TopScorers() {
  const api = useTeamFlowAPI()
  const topScorers = api.stats.getTeamTopScorers(5)

  return (
    <div>
      <h2>Top 5 Scorers</h2>
      {topScorers.map((scorer, index) => (
        <div key={scorer.playerId}>
          {index + 1}. Player {scorer.playerId}: {scorer.totalPoints} points
        </div>
      ))}
    </div>
  )
}
```

---

## 🔄 Complete Component Example

Here's a complete example showing multiple services working together:

```typescript
import { useTeamFlowAPI } from '@/hooks/use-teamflow-api'
import { toast } from 'sonner'

function TeamDashboard() {
  const api = useTeamFlowAPI()

  const players = api.players.getAll()
  const upcomingEvents = api.events.getUpcoming(3)
  const recentMessages = api.messages.getRecent(5)
  const topScorers = api.stats.getTeamTopScorers(3)

  const handleQuickMessage = () => {
    api.messages.create({
      sender: 'Coach',
      content: 'Practice tomorrow at 5 PM!',
      recipients: 'all',
    })
    toast.success('Announcement sent!')
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Team Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Roster Overview */}
        <div className="p-4 bg-card rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Roster</h2>
          <p className="text-3xl font-bold">{players.length}</p>
          <p className="text-muted-foreground">Total Players</p>
        </div>

        {/* Upcoming Events */}
        <div className="p-4 bg-card rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Next Event</h2>
          {upcomingEvents[0] && (
            <div>
              <p className="font-medium">{upcomingEvents[0].title}</p>
              <p className="text-sm text-muted-foreground">
                {upcomingEvents[0].date} at {upcomingEvents[0].time}
              </p>
            </div>
          )}
        </div>

        {/* Top Scorer */}
        <div className="p-4 bg-card rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Top Scorer</h2>
          {topScorers[0] && (
            <div>
              <p className="text-3xl font-bold">{topScorers[0].totalPoints}</p>
              <p className="text-muted-foreground">Points</p>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-6">
        <button
          onClick={handleQuickMessage}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg"
        >
          Send Quick Announcement
        </button>
      </div>

      {/* Recent Messages */}
      <div className="mt-6">
        <h2 className="text-xl font-semibold mb-4">Recent Messages</h2>
        {recentMessages.map(msg => (
          <div key={msg.id} className="p-3 bg-muted rounded-lg mb-2">
            <p className="font-medium">{msg.sender}</p>
            <p className="text-sm">{msg.content}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

export default TeamDashboard
```

---

## 🎓 Best Practices

### 1. Always Use Functional Updates

When updating state that depends on the current state, ALWAYS use functional updates to avoid data loss:

```typescript
// ❌ WRONG - Will cause data loss
const addPlayer = (player: Player) => {
  const newPlayer = api.players.create(player)
}

// ✅ CORRECT - Services handle functional updates internally
const addPlayer = (player: Player) => {
  api.players.create(player)
}
```

### 2. Handle Error Cases

```typescript
const deletePlayer = (id: string) => {
  const success = api.players.delete(id)
  
  if (success) {
    toast.success('Player deleted')
  } else {
    toast.error('Failed to delete player')
  }
}
```

### 3. Type Safety

All services are fully typed. Use TypeScript to catch errors:

```typescript
// TypeScript will catch invalid fields
api.players.create({
  name: 'John Doe',
  jerseyNumber: '10',
  position: 'Forward',
  email: 'john@example.com',
  phone: '555-1234',
  emergencyContact: 'Jane Doe',
  emergencyPhone: '555-5678',
})
```

### 4. Combine Multiple Services

```typescript
const createEventAndNotify = (eventData: CreateEventDTO) => {
  const newEvent = api.events.create(eventData)
  
  api.messages.create({
    sender: 'System',
    content: `New event: ${newEvent.title} on ${newEvent.date}`,
    recipients: 'all',
  })
}
```

---

## 📊 Data Flow Diagram

```
React Component
      ↓
useTeamFlowAPI Hook
      ↓
Service Layer (playerService, eventService, etc.)
      ↓
useKV Hook (Spark Runtime)
      ↓
Persistent Browser Storage
```

---

## 🚀 Next Steps

1. **Current Implementation**: All services use Spark Runtime KV storage
2. **Future Migration**: When ready to move to C# Web API + PostgreSQL, replace service implementations with HTTP calls
3. **API Compatibility**: The service interfaces remain the same, making migration seamless

For backend migration details, see [BACKEND_API.md](./BACKEND_API.md)
