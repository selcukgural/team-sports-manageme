# 🏗️ TeamFlow Backend Architecture

## Overview

TeamFlow has a **complete backend service layer** implementation that provides a clean, type-safe API for all data operations. The architecture is designed to work seamlessly with both the current Spark Runtime KV storage and a future C# Web API + PostgreSQL backend.

## 📁 Backend Structure

```
src/
├── lib/
│   ├── services/
│   │   ├── playerService.ts      # Player/roster management
│   │   ├── eventService.ts       # Event/schedule management
│   │   ├── fileService.ts        # File upload and sharing
│   │   ├── messageService.ts     # Team messaging
│   │   ├── statsService.ts       # Player statistics
│   │   └── index.ts              # Service exports
│   └── types.ts                  # TypeScript interfaces
├── hooks/
│   └── use-teamflow-api.ts       # Main API hook
```

## 🚀 Quick Start

### Using the API in Components

```typescript
import { useTeamFlowAPI } from '@/hooks/use-teamflow-api'

function MyComponent() {
  const api = useTeamFlowAPI()

  // Players
  const players = api.players.getAll()
  api.players.create({ name: 'John Doe', ... })

  // Events
  const upcoming = api.events.getUpcoming(5)
  api.events.updateAvailability(eventId, { playerId, status: 'available' })

  // Files
  api.files.create({ name: 'photo.jpg', ... })
  const shareLink = api.files.enableSharing(fileId)

  // Messages
  api.messages.create({ sender: 'Coach', content: 'Practice tomorrow!', recipients: 'all' })

  // Stats
  const playerStats = api.stats.getPlayerAggregatedStats(playerId)
}
```

## 📚 Documentation

Comprehensive documentation is available in the following files:

### 1. [BACKEND_API.md](./BACKEND_API.md)
**Complete API Reference**
- All endpoint specifications (GET, POST, PUT, DELETE)
- Request/Response types
- Query parameters
- Implementation examples
- PostgreSQL database schema
- Migration guide to C# Web API

### 2. [BACKEND_USAGE.md](./BACKEND_USAGE.md)
**Usage Guide & Examples**
- `useTeamFlowAPI` hook documentation
- Service usage examples
- Complete component examples
- Best practices
- Common patterns

### 3. [CSHARP_IMPLEMENTATION.md](./CSHARP_IMPLEMENTATION.md)
**C# Backend Implementation**
- Complete C# Web API code
- Entity Framework Core models
- DbContext configuration
- Controller implementations
- DTO definitions
- Migration commands
- Frontend integration guide

### 4. [DATA_STORAGE.md](./DATA_STORAGE.md)
**Data Storage Documentation** (Turkish)
- Current storage implementation
- Data persistence details
- Storage keys and structure
- Backend migration notes

## 🎯 Available Services

### PlayerService
```typescript
api.players.getAll()                      // Get all players
api.players.getById(id)                   // Get player by ID
api.players.create(dto)                   // Create new player
api.players.update(id, dto)               // Update player
api.players.delete(id)                    // Delete player
api.players.search(query)                 // Search players
```

### EventService
```typescript
api.events.getAll(filters)                // Get all events with filters
api.events.getById(id)                    // Get event by ID
api.events.getUpcoming(limit)             // Get upcoming events
api.events.getPast(limit)                 // Get past events
api.events.create(dto)                    // Create new event
api.events.update(id, dto)                // Update event
api.events.delete(id)                     // Delete event
api.events.updateAvailability(id, dto)    // Update player availability
api.events.getAvailabilityStats(id)       // Get availability statistics
```

### FileService
```typescript
api.files.getAll(filters)                 // Get all files with filters
api.files.getById(id)                     // Get file by ID
api.files.getByShareId(shareId)           // Get shared file
api.files.create(dto)                     // Upload new file
api.files.delete(id)                      // Delete file
api.files.enableSharing(id)               // Enable file sharing (returns share URL)
api.files.disableSharing(id)              // Disable file sharing
api.files.isShareEnabled(id)              // Check if sharing is enabled
api.files.getFilesByCategory(category)    // Get files by category
```

### MessageService
```typescript
api.messages.getAll(filters, limit)       // Get all messages with filters
api.messages.getById(id)                  // Get message by ID
api.messages.getRecent(limit)             // Get recent messages
api.messages.create(dto)                  // Send new message
api.messages.delete(id)                   // Delete message
api.messages.getByRecipients(recipients)  // Get messages by recipient group
api.messages.getUnreadCount()             // Get unread message count
```

### StatsService
```typescript
api.stats.getAll()                        // Get all stats
api.stats.getByPlayerId(playerId)         // Get stats for player
api.stats.getByGameId(gameId)             // Get stats for game
api.stats.create(dto)                     // Record new stats
api.stats.update(playerId, gameId, dto)   // Update stats
api.stats.delete(playerId, gameId)        // Delete stats
api.stats.getPlayerAggregatedStats(id)    // Get aggregated player stats
api.stats.getTeamTopScorers(limit)        // Get top scorers
```

## 🏗️ Architecture

### Current Implementation (Spark Runtime)
```
┌─────────────────┐
│ React Component │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ useTeamFlowAPI  │
│     Hook        │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Service Layer   │
│ (playerService, │
│  eventService,  │
│  etc.)          │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Spark KV Store  │
│ (Browser)       │
└─────────────────┘
```

### Future Implementation (C# Web API)
```
┌─────────────────┐
│ React Component │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ useTeamFlowAPI  │
│     Hook        │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ HTTP Client     │
│ (fetch/axios)   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ C# Web API      │
│ Controllers     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ EF Core         │
│ DbContext       │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ PostgreSQL      │
│ Database        │
└─────────────────┘
```

## ✨ Key Features

### ✅ Type Safety
All services are fully typed with TypeScript interfaces, ensuring compile-time type checking.

### ✅ Consistent API
Service interfaces remain the same regardless of backend implementation, making migration seamless.

### ✅ Functional Updates
All services use functional updates internally to prevent data loss and race conditions.

### ✅ RESTful Design
API follows REST principles with standard HTTP methods (GET, POST, PUT, DELETE).

### ✅ Data Validation
DTOs provide clear contracts for data input and output.

### ✅ Query Filtering
Support for filtering, sorting, and pagination in list endpoints.

### ✅ Relationship Management
Proper handling of related data (e.g., event availability, player stats).

## 🔄 Migration Path

### Step 1: Current State (✅ Complete)
- Service layer implemented
- All CRUD operations functional
- Data persisted via Spark KV

### Step 2: C# Backend Development
1. Set up C# Web API project
2. Configure PostgreSQL with EF Core
3. Implement entity models
4. Create controllers
5. Set up authentication

### Step 3: Frontend Integration
1. Update `useTeamFlowAPI` to use HTTP calls
2. Add authentication headers
3. Handle loading states
4. Implement error handling

### Step 4: Data Migration
1. Export data from Spark KV
2. Transform to PostgreSQL format
3. Import into database
4. Verify data integrity

## 🎓 Best Practices

### Always Use Functional Updates
Services handle this internally, but when working with state:

```typescript
// ❌ Wrong
setRoster([...roster, newPlayer])

// ✅ Correct
setRoster((current) => [...current, newPlayer])
```

### Handle Errors Gracefully
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

### Combine Services for Complex Operations
```typescript
const createEventAndNotify = (eventData: CreateEventDTO) => {
  const newEvent = api.events.create(eventData)
  api.messages.create({
    sender: 'System',
    content: `New event: ${newEvent.title}`,
    recipients: 'all'
  })
}
```

## 📊 Database Schema

The PostgreSQL schema is fully documented in [BACKEND_API.md](./BACKEND_API.md#-database-schema-conceptual) with:
- Table definitions
- Foreign key relationships
- Indexes and constraints
- Check constraints for data integrity

## 🔐 Security Considerations

### Current Implementation
- Single-user mode (browser-based)
- No authentication required
- Data isolated per browser

### Future Implementation
- JWT authentication
- Role-based access control
- Team-based data isolation
- Encrypted passwords
- HTTPS-only communication

## 📈 Performance

### Current Performance
- Instant read operations (browser storage)
- No network latency
- Limited by browser storage (~5-10 MB)

### Future Performance
- Database indexing for fast queries
- Pagination for large datasets
- Caching strategies
- CDN for file delivery

## 🧪 Testing

Service layer is designed for easy testing:

```typescript
// Mock the KV store
const mockRoster = [{ id: '1', name: 'John Doe', ... }]
const mockSetRoster = vi.fn()

const playerService = createPlayerService(mockRoster, mockSetRoster)

// Test operations
const result = playerService.search('John')
expect(result).toHaveLength(1)
```

## 📞 Support & Contribution

For questions or contributions:
1. Check documentation files
2. Review example implementations
3. Follow TypeScript best practices
4. Maintain service interface compatibility

## 📝 Summary

TeamFlow has a **production-ready backend service layer** that:

✅ Provides clean, type-safe API  
✅ Works with current Spark KV storage  
✅ Ready for C# Web API migration  
✅ Follows REST principles  
✅ Includes comprehensive documentation  
✅ Supports complex queries and relationships  

The architecture allows for seamless migration to a traditional backend while maintaining a consistent developer experience.
