# Backend Service Layer Integration

## Overview
The backend service layer has been successfully integrated into all major components of the TeamFlow application. This provides a clean, type-safe API for data management with proper separation of concerns.

## What Was Integrated

### Service Layer Architecture
All components now use the `useTeamFlowAPI()` hook instead of direct `useKV` calls. This provides:
- **Type safety** with TypeScript interfaces
- **Centralized business logic** in service classes
- **Consistent API patterns** across all components
- **Better maintainability** and testability

### Components Updated

#### 1. **RosterView** (`src/components/roster/RosterView.tsx`)
- ✅ Replaced `useKV('roster')` with `api.players.getAll()`
- ✅ Using `api.players.create()` for adding players
- ✅ Using `api.players.update()` for editing players
- ✅ Using `api.players.delete()` for removing players

**Service Methods Used:**
- `getAll()` - Get all players
- `create(dto)` - Create new player
- `update(id, dto)` - Update existing player
- `delete(id)` - Delete player

#### 2. **ScheduleView** (`src/components/schedule/ScheduleView.tsx`)
- ✅ Replaced `useKV('events')` with `api.events.getAll()`
- ✅ Using `api.events.create()` for creating events
- ✅ Using `api.events.update()` for editing events
- ✅ Using `api.events.delete()` for removing events
- ✅ Using `api.events.updateAvailability()` for availability tracking

**Service Methods Used:**
- `getAll(filters?)` - Get all events with optional filtering
- `getUpcoming(limit?)` - Get upcoming events
- `getPast(limit?)` - Get past events
- `create(dto)` - Create new event
- `update(id, dto)` - Update existing event
- `delete(id)` - Delete event
- `updateAvailability(eventId, dto)` - Update player availability
- `getAvailabilityStats(eventId)` - Get availability statistics

#### 3. **FilesView** (`src/components/files/FilesView.tsx`)
- ✅ Replaced `useKV('team-files')` with `api.files.getAll()`
- ✅ Using `api.files.create()` for file uploads
- ✅ Using `api.files.delete()` for file deletion
- ✅ Using `api.files.enableSharing()` / `disableSharing()` for share management
- ✅ Using `api.files.getByShareId()` for shared file access
- ✅ Using `api.files.getFilesByCategory()` for filtered views

**Service Methods Used:**
- `getAll(filters?)` - Get all files with optional filtering
- `getById(id)` - Get file by ID
- `getByShareId(shareId)` - Get shared file
- `create(dto)` - Upload new file
- `delete(id)` - Delete file
- `enableSharing(id)` - Enable file sharing
- `disableSharing(id)` - Disable file sharing
- `getFilesByCategory(category)` - Get files by category

#### 4. **MessagesView** (`src/components/messages/MessagesView.tsx`)
- ✅ Replaced `useKV('messages')` with `api.messages.getAll()`
- ✅ Using `api.messages.create()` for sending messages
- ✅ Using `api.messages.delete()` for deleting messages

**Service Methods Used:**
- `getAll(filters?)` - Get all messages with optional filtering
- `create(dto)` - Create new message
- `delete(id)` - Delete message

#### 5. **StatsView** (`src/components/stats/StatsView.tsx`)
- ✅ Replaced `useKV` calls with API service methods
- ✅ Using `api.players.getAll()` for roster data
- ✅ Using `api.events.getAll()` for event data
- ✅ Using `api.stats.getAll()` for player statistics

#### 6. **DashboardView** (`src/components/dashboard/DashboardView.tsx`)
- ✅ Replaced `useKV` calls with API service methods
- ✅ Using `api.events.getAll()` for event data
- ✅ Using `api.players.getAll()` for roster data
- ✅ Using `api.messages.getAll()` for message data

#### 7. **SharedFileViewer** (`src/components/files/SharedFileViewer.tsx`)
- ✅ Replaced `useKV` with `api.files.getByShareId()`
- ✅ Cleaner shared file lookup logic

## Benefits of Integration

### 1. **Type Safety**
All service methods are fully typed with TypeScript interfaces:
```typescript
interface CreatePlayerDTO {
  name: string
  jerseyNumber: string
  position: string
  email: string
  phone: string
  emergencyContact: string
  emergencyPhone: string
  photoUrl?: string
}
```

### 2. **Consistent Patterns**
All CRUD operations follow the same pattern:
```typescript
// Get all
const items = api.entity.getAll()

// Create
const newItem = api.entity.create(dto)

// Update
const updated = api.entity.update(id, dto)

// Delete
const deleted = api.entity.delete(id)
```

### 3. **Business Logic Encapsulation**
Complex logic is now centralized in services:
- ID generation using `ulid` library
- Timestamp management
- Data validation
- Filtering and sorting

### 4. **Future-Ready Architecture**
The service layer provides a clean abstraction that can be easily adapted to:
- Real backend API integration
- Different storage mechanisms
- Additional business rules
- Enhanced validation

## Service Layer Structure

### Available Services
```typescript
interface TeamFlowAPI {
  players: PlayerService      // Roster management
  events: EventService         // Schedule & events
  files: FileService           // File uploads & sharing
  messages: MessageService     // Team messaging
  stats: StatsService          // Player statistics
}
```

### Data Flow
```
Component
    ↓
useTeamFlowAPI() Hook
    ↓
Service Layer (Business Logic)
    ↓
useKV Hook (Persistence)
    ↓
Spark KV Store
```

## Next Steps

### Backend API Integration
When ready to connect to a real C# Web API backend:

1. **Update service implementations** to make HTTP calls instead of using useKV
2. **Add API configuration** for base URL and endpoints
3. **Implement authentication** using the spark.user() API
4. **Add error handling** for network failures
5. **Implement caching** for better performance

### Example API Service Update:
```typescript
// Before (using useKV)
create: (dto: CreatePlayerDTO) => {
  const newPlayer = { id: ulid(), ...dto }
  setRoster(current => [...current, newPlayer])
  return newPlayer
}

// After (using real API)
create: async (dto: CreatePlayerDTO) => {
  const response = await fetch('/api/players', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dto)
  })
  return await response.json()
}
```

## Testing Recommendations

1. **Test all CRUD operations** in each component
2. **Verify data persistence** across page refreshes
3. **Test file sharing** functionality
4. **Verify availability tracking** in schedule
5. **Test message filtering** and deletion

## Documentation References

- Service implementations: `src/lib/services/`
- Type definitions: `src/lib/types.ts`
- Hook integration: `src/hooks/use-teamflow-api.ts`
- Backend API spec: `BACKEND_API.md`
- C# implementation guide: `CSHARP_IMPLEMENTATION.md`
