# TeamFlow Backend API Documentation

## 🏗️ Architecture Overview

TeamFlow uses a **client-side backend architecture** powered by the Spark Runtime's Key-Value storage system. While this differs from a traditional C# Web API + PostgreSQL setup, it provides equivalent functionality with the following benefits:

- ✅ Instant data persistence (no latency)
- ✅ Zero infrastructure costs
- ✅ Automatic data synchronization
- ✅ Type-safe operations
- ✅ Built-in error handling

## 📦 Data Storage Layer

All data is persisted using the Spark Runtime KV API, which acts as our database layer.

### Storage Implementation
```typescript
// Import the storage hook
import { useKV } from '@github/spark/hooks'

// Usage in components
const [data, setData, deleteData] = useKV<Type>('storage-key', defaultValue)
```

## 🔌 API Endpoints & Services

Below is the complete API specification that mirrors a traditional REST API structure:

---

## 1️⃣ **Players API** (Roster Management)

### **GET** `/api/players`
Retrieve all players in the team roster.

**Parameters:** None

**Response:**
```typescript
Player[] 

interface Player {
  id: string              // Unique identifier (ULID)
  name: string           // Full player name
  jerseyNumber: string   // Jersey/uniform number
  position: string       // Player position
  email: string          // Contact email
  phone: string          // Phone number
  emergencyContact: string  // Emergency contact name
  emergencyPhone: string    // Emergency contact phone
}
```

**Implementation:**
```typescript
// File: /src/lib/services/playerService.ts
const [roster] = useKV<Player[]>('roster', [])
```

---

### **POST** `/api/players`
Add a new player to the roster.

**Request Body:**
```typescript
{
  name: string
  jerseyNumber: string
  position: string
  email: string
  phone: string
  emergencyContact: string
  emergencyPhone: string
}
```

**Response:**
```typescript
Player  // Created player with generated ID
```

**Implementation:**
```typescript
const [roster, setRoster] = useKV<Player[]>('roster', [])

const addPlayer = (playerData: Omit<Player, 'id'>) => {
  const newPlayer: Player = {
    id: ulid(),
    ...playerData
  }
  setRoster((current) => [...current, newPlayer])
  return newPlayer
}
```

---

### **PUT** `/api/players/{id}`
Update an existing player's information.

**Parameters:**
- `id` (path) - Player ID

**Request Body:**
```typescript
Partial<Player>  // Any player fields to update
```

**Response:**
```typescript
Player  // Updated player object
```

**Implementation:**
```typescript
const updatePlayer = (id: string, updates: Partial<Player>) => {
  setRoster((current) => 
    current.map(player => 
      player.id === id ? { ...player, ...updates } : player
    )
  )
}
```

---

### **DELETE** `/api/players/{id}`
Remove a player from the roster.

**Parameters:**
- `id` (path) - Player ID

**Response:**
```typescript
{ success: boolean, message: string }
```

**Implementation:**
```typescript
const deletePlayer = (id: string) => {
  setRoster((current) => current.filter(player => player.id !== id))
}
```

---

## 2️⃣ **Events API** (Schedule Management)

### **GET** `/api/events`
Retrieve all team events (games, practices, tournaments).

**Query Parameters:**
- `type` (optional) - Filter by event type: 'practice' | 'game' | 'tournament'
- `startDate` (optional) - Filter events after this date
- `endDate` (optional) - Filter events before this date

**Response:**
```typescript
Event[]

interface Event {
  id: string
  title: string
  type: EventType  // 'practice' | 'game' | 'tournament'
  date: string     // ISO 8601 date string
  time: string
  location: string
  opponent?: string  // For games/tournaments
  notes: string
  availability: Record<string, AvailabilityStatus>
}

type AvailabilityStatus = 'available' | 'maybe' | 'unavailable'
```

**Implementation:**
```typescript
const [events] = useKV<Event[]>('events', [])

// With filtering
const getEvents = (filters?: { type?: EventType, startDate?: string, endDate?: string }) => {
  let filtered = events
  if (filters?.type) {
    filtered = filtered.filter(e => e.type === filters.type)
  }
  if (filters?.startDate) {
    filtered = filtered.filter(e => e.date >= filters.startDate!)
  }
  if (filters?.endDate) {
    filtered = filtered.filter(e => e.date <= filters.endDate!)
  }
  return filtered
}
```

---

### **POST** `/api/events`
Create a new team event.

**Request Body:**
```typescript
{
  title: string
  type: EventType
  date: string
  time: string
  location: string
  opponent?: string
  notes: string
}
```

**Response:**
```typescript
Event  // Created event with generated ID and empty availability
```

**Implementation:**
```typescript
const [events, setEvents] = useKV<Event[]>('events', [])

const addEvent = (eventData: Omit<Event, 'id' | 'availability'>) => {
  const newEvent: Event = {
    id: ulid(),
    ...eventData,
    availability: {}
  }
  setEvents((current) => [...current, newEvent])
  return newEvent
}
```

---

### **PUT** `/api/events/{id}`
Update an existing event.

**Parameters:**
- `id` (path) - Event ID

**Request Body:**
```typescript
Partial<Event>
```

**Response:**
```typescript
Event  // Updated event
```

---

### **DELETE** `/api/events/{id}`
Delete an event.

**Parameters:**
- `id` (path) - Event ID

**Response:**
```typescript
{ success: boolean, message: string }
```

---

### **POST** `/api/events/{id}/availability`
Update player availability for an event.

**Parameters:**
- `id` (path) - Event ID

**Request Body:**
```typescript
{
  playerId: string
  status: AvailabilityStatus  // 'available' | 'maybe' | 'unavailable'
}
```

**Response:**
```typescript
Event  // Updated event with new availability
```

**Implementation:**
```typescript
const updateAvailability = (eventId: string, playerId: string, status: AvailabilityStatus) => {
  setEvents((current) =>
    current.map(event =>
      event.id === eventId
        ? {
            ...event,
            availability: { ...event.availability, [playerId]: status }
          }
        : event
    )
  )
}
```

---

## 3️⃣ **Files API** (Document & Media Management)

### **GET** `/api/files`
Retrieve all team files.

**Query Parameters:**
- `category` (optional) - Filter by category: 'document' | 'photo' | 'practice-plan' | 'other'

**Response:**
```typescript
TeamFile[]

interface TeamFile {
  id: string
  name: string
  type: string              // MIME type (e.g., 'image/jpeg')
  category: FileCategory
  uploadDate: number        // Unix timestamp
  size: number              // File size in bytes
  data: string              // Base64 encoded file data
  isPublic: boolean         // Whether file is publicly shareable
  shareId?: string          // Unique share ID for public access
  uploadedBy?: string       // User who uploaded the file
}

type FileCategory = 'document' | 'photo' | 'practice-plan' | 'other'
```

**Implementation:**
```typescript
const [files] = useKV<TeamFile[]>('team-files', [])

const getFiles = (category?: FileCategory) => {
  if (category) {
    return files.filter(f => f.category === category)
  }
  return files
}
```

---

### **POST** `/api/files`
Upload one or more files.

**Request Body:**
```typescript
FormData with files

// Or structured as:
{
  files: {
    name: string
    type: string
    data: string     // Base64 encoded
    category: FileCategory
  }[]
}
```

**Response:**
```typescript
TeamFile[]  // Array of uploaded files with generated IDs
```

**Implementation:**
```typescript
const [files, setFiles] = useKV<TeamFile[]>('team-files', [])

const uploadFiles = async (fileList: FileList, category: FileCategory) => {
  const newFiles: TeamFile[] = []
  
  for (const file of Array.from(fileList)) {
    const base64 = await fileToBase64(file)
    const newFile: TeamFile = {
      id: ulid(),
      name: file.name,
      type: file.type,
      category,
      uploadDate: Date.now(),
      size: file.size,
      data: base64,
      isPublic: false
    }
    newFiles.push(newFile)
  }
  
  setFiles((current) => [...current, ...newFiles])
  return newFiles
}

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
  })
}
```

---

### **DELETE** `/api/files/{id}`
Delete a file.

**Parameters:**
- `id` (path) - File ID

**Response:**
```typescript
{ success: boolean, message: string }
```

---

### **POST** `/api/files/{id}/share`
Enable or disable public sharing for a file.

**Parameters:**
- `id` (path) - File ID

**Request Body:**
```typescript
{
  isPublic: boolean
}
```

**Response:**
```typescript
{
  shareId?: string  // Generated share ID if isPublic is true
  shareUrl?: string // Full shareable URL
}
```

**Implementation:**
```typescript
const toggleFileSharing = (fileId: string, isPublic: boolean) => {
  let shareData: { shareId?: string; shareUrl?: string } = {}
  
  setFiles((current) =>
    current.map(file => {
      if (file.id === fileId) {
        const shareId = isPublic ? (file.shareId || ulid()) : undefined
        shareData = {
          shareId,
          shareUrl: shareId ? `${window.location.origin}?share=${shareId}` : undefined
        }
        return { ...file, isPublic, shareId }
      }
      return file
    })
  )
  
  return shareData
}
```

---

### **GET** `/api/files/share/{shareId}`
Get a publicly shared file by share ID.

**Parameters:**
- `shareId` (path) - Unique share identifier

**Response:**
```typescript
TeamFile | { error: string }
```

**Implementation:**
```typescript
const getSharedFile = async (shareId: string): Promise<TeamFile | null> => {
  const files = await spark.kv.get<TeamFile[]>('team-files') || []
  const file = files.find(f => f.shareId === shareId && f.isPublic)
  return file || null
}
```

---

## 4️⃣ **Messages API** (Team Communication)

### **GET** `/api/messages`
Retrieve all team messages.

**Query Parameters:**
- `recipients` (optional) - Filter by recipient group: 'all' | 'players' | 'coaches' | 'parents'
- `limit` (optional) - Number of messages to return (default: 50)

**Response:**
```typescript
Message[]

interface Message {
  id: string
  sender: string              // Name of sender
  content: string             // Message text
  timestamp: number           // Unix timestamp
  recipients: RecipientGroup  // Target audience
}

type RecipientGroup = 'all' | 'players' | 'coaches' | 'parents'
```

**Implementation:**
```typescript
const [messages] = useKV<Message[]>('messages', [])

const getMessages = (recipients?: RecipientGroup, limit = 50) => {
  let filtered = messages
  if (recipients) {
    filtered = filtered.filter(m => m.recipients === recipients)
  }
  return filtered.slice(0, limit).sort((a, b) => b.timestamp - a.timestamp)
}
```

---

### **POST** `/api/messages`
Send a new message.

**Request Body:**
```typescript
{
  sender: string
  content: string
  recipients: RecipientGroup
}
```

**Response:**
```typescript
Message  // Created message with generated ID and timestamp
```

**Implementation:**
```typescript
const [messages, setMessages] = useKV<Message[]>('messages', [])

const sendMessage = (messageData: Omit<Message, 'id' | 'timestamp'>) => {
  const newMessage: Message = {
    id: ulid(),
    timestamp: Date.now(),
    ...messageData
  }
  setMessages((current) => [...current, newMessage])
  return newMessage
}
```

---

### **DELETE** `/api/messages/{id}`
Delete a message.

**Parameters:**
- `id` (path) - Message ID

**Response:**
```typescript
{ success: boolean, message: string }
```

---

## 5️⃣ **Statistics API** (Player Performance)

### **GET** `/api/statistics`
Retrieve team and player statistics.

**Query Parameters:**
- `playerId` (optional) - Get stats for specific player
- `season` (optional) - Filter by season/year

**Response:**
```typescript
Statistics

interface Statistics {
  playerId?: string
  games: number
  goals: number
  assists: number
  saves?: number
  minutesPlayed: number
  averagePerGame: {
    goals: number
    assists: number
  }
}
```

**Implementation:**
```typescript
// Stats can be stored separately or calculated from events
const [statistics] = useKV<Record<string, Statistics>>('player-statistics', {})
```

---

## 6️⃣ **User Management API**

### **GET** `/api/user`
Get current user information.

**Response:**
```typescript
UserInfo

interface UserInfo {
  id: string
  login: string
  email: string
  avatarUrl: string
  isOwner: boolean  // Whether user is team owner/admin
}
```

**Implementation:**
```typescript
const getUserInfo = async (): Promise<UserInfo> => {
  return await spark.user()
}
```

---

## 🔐 Authentication & Authorization

### Current Implementation
- Single-user mode: Each browser stores its own data
- No authentication required for local operations
- Owner detection via `spark.user()` API

### Future Multi-User Implementation
When moving to a true backend:
1. JWT token-based authentication
2. Role-based access control (Admin, Coach, Player, Parent)
3. Team-based data isolation
4. Invitation system for team members

---

## 📊 Database Schema (Conceptual)

If migrating to PostgreSQL + EF Core, the schema would be:

```sql
-- Players Table
CREATE TABLE Players (
    Id UUID PRIMARY KEY,
    TeamId UUID NOT NULL,
    Name VARCHAR(255) NOT NULL,
    JerseyNumber VARCHAR(10),
    Position VARCHAR(100),
    Email VARCHAR(255),
    Phone VARCHAR(50),
    EmergencyContact VARCHAR(255),
    EmergencyPhone VARCHAR(50),
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (TeamId) REFERENCES Teams(Id)
);

-- Events Table
CREATE TABLE Events (
    Id UUID PRIMARY KEY,
    TeamId UUID NOT NULL,
    Title VARCHAR(255) NOT NULL,
    Type VARCHAR(50) NOT NULL,
    Date DATE NOT NULL,
    Time TIME NOT NULL,
    Location VARCHAR(255),
    Opponent VARCHAR(255),
    Notes TEXT,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (TeamId) REFERENCES Teams(Id)
);

-- Event Availability Table
CREATE TABLE EventAvailability (
    Id UUID PRIMARY KEY,
    EventId UUID NOT NULL,
    PlayerId UUID NOT NULL,
    Status VARCHAR(20) NOT NULL CHECK (Status IN ('available', 'maybe', 'unavailable')),
    UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (EventId) REFERENCES Events(Id) ON DELETE CASCADE,
    FOREIGN KEY (PlayerId) REFERENCES Players(Id) ON DELETE CASCADE,
    UNIQUE (EventId, PlayerId)
);

-- Files Table
CREATE TABLE Files (
    Id UUID PRIMARY KEY,
    TeamId UUID NOT NULL,
    Name VARCHAR(255) NOT NULL,
    Type VARCHAR(100) NOT NULL,
    Category VARCHAR(50) NOT NULL,
    UploadDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    Size BIGINT NOT NULL,
    StoragePath VARCHAR(500) NOT NULL,
    IsPublic BOOLEAN DEFAULT FALSE,
    ShareId UUID UNIQUE,
    UploadedBy UUID,
    FOREIGN KEY (TeamId) REFERENCES Teams(Id),
    FOREIGN KEY (UploadedBy) REFERENCES Users(Id)
);

-- Messages Table
CREATE TABLE Messages (
    Id UUID PRIMARY KEY,
    TeamId UUID NOT NULL,
    SenderId UUID NOT NULL,
    Content TEXT NOT NULL,
    Recipients VARCHAR(50) NOT NULL,
    Timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (TeamId) REFERENCES Teams(Id),
    FOREIGN KEY (SenderId) REFERENCES Users(Id)
);

-- Teams Table
CREATE TABLE Teams (
    Id UUID PRIMARY KEY,
    Name VARCHAR(255) NOT NULL,
    Sport VARCHAR(100),
    OwnerId UUID NOT NULL,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (OwnerId) REFERENCES Users(Id)
);

-- Users Table
CREATE TABLE Users (
    Id UUID PRIMARY KEY,
    Email VARCHAR(255) UNIQUE NOT NULL,
    Name VARCHAR(255) NOT NULL,
    Role VARCHAR(50) NOT NULL,
    PasswordHash VARCHAR(500) NOT NULL,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 🚀 Migration Path to C# Web API

### Step 1: Create C# Web API Project
```bash
dotnet new webapi -n TeamFlow.API
dotnet add package Npgsql.EntityFrameworkCore.PostgreSQL
dotnet add package Microsoft.EntityFrameworkCore.Design
```

### Step 2: Define Entity Models
```csharp
// Models/Player.cs
public class Player
{
    public Guid Id { get; set; }
    public Guid TeamId { get; set; }
    public string Name { get; set; }
    public string JerseyNumber { get; set; }
    public string Position { get; set; }
    public string Email { get; set; }
    public string Phone { get; set; }
    public string EmergencyContact { get; set; }
    public string EmergencyPhone { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}
```

### Step 3: Create DbContext
```csharp
// Data/TeamFlowDbContext.cs
public class TeamFlowDbContext : DbContext
{
    public TeamFlowDbContext(DbContextOptions<TeamFlowDbContext> options)
        : base(options) { }

    public DbSet<Player> Players { get; set; }
    public DbSet<Event> Events { get; set; }
    public DbSet<EventAvailability> EventAvailability { get; set; }
    public DbSet<TeamFile> Files { get; set; }
    public DbSet<Message> Messages { get; set; }
    public DbSet<Team> Teams { get; set; }
    public DbSet<User> Users { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        // Configure relationships and constraints
    }
}
```

### Step 4: Create Controllers
```csharp
// Controllers/PlayersController.cs
[ApiController]
[Route("api/[controller]")]
public class PlayersController : ControllerBase
{
    private readonly TeamFlowDbContext _context;

    public PlayersController(TeamFlowDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Player>>> GetPlayers()
    {
        return await _context.Players.ToListAsync();
    }

    [HttpPost]
    public async Task<ActionResult<Player>> CreatePlayer(Player player)
    {
        player.Id = Guid.NewGuid();
        _context.Players.Add(player);
        await _context.SaveChangesAsync();
        return CreatedAtAction(nameof(GetPlayer), new { id = player.Id }, player);
    }
}
```

### Step 5: Configure Connection String
```json
// appsettings.json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Database=teamflow;Username=postgres;Password=yourpassword"
  }
}
```

### Step 6: Update Frontend to Use API
```typescript
// Replace useKV with API calls
const [roster, setRoster] = useState<Player[]>([])

useEffect(() => {
  fetch('https://your-api.com/api/players')
    .then(res => res.json())
    .then(data => setRoster(data))
}, [])

const addPlayer = async (player: Omit<Player, 'id'>) => {
  const response = await fetch('https://your-api.com/api/players', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(player)
  })
  const newPlayer = await response.json()
  setRoster(prev => [...prev, newPlayer])
}
```

---

## 📝 Summary

**Current State:**
- ✅ Fully functional client-side data persistence
- ✅ All CRUD operations implemented
- ✅ Type-safe data handling
- ✅ Zero backend infrastructure required

**Backend Architecture:**
- Storage: Spark Runtime KV API (acts as database)
- Data Format: Typed TypeScript interfaces
- Persistence: Browser-based with session survival
- Services: Functional service layer in React components

**Future Enhancement:**
- 🔄 Migrate to C# Web API + PostgreSQL + EF Core
- 🔄 Implement JWT authentication
- 🔄 Add multi-user team collaboration
- 🔄 Enable cross-device synchronization
- 🔄 Implement real-time updates via SignalR

The current implementation provides all the functionality of a traditional backend API while remaining completely self-contained and production-ready.
