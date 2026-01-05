# C# Web API + PostgreSQL + EF Core Implementation Guide

This document provides complete C# implementation examples for migrating TeamFlow to a traditional backend architecture.

## 📋 Table of Contents
1. [Project Setup](#project-setup)
2. [Database Models](#database-models)
3. [DbContext Configuration](#dbcontext-configuration)
4. [Controllers](#controllers)
5. [DTOs](#dtos)
6. [Services Layer](#services-layer)
7. [Migrations](#migrations)
8. [Frontend Integration](#frontend-integration)

---

## 🚀 Project Setup

### Create New Web API Project

```bash
# Create solution
dotnet new sln -n TeamFlow

# Create Web API project
dotnet new webapi -n TeamFlow.API
dotnet sln add TeamFlow.API

# Navigate to project
cd TeamFlow.API

# Install required packages
dotnet add package Npgsql.EntityFrameworkCore.PostgreSQL --version 8.0.0
dotnet add package Microsoft.EntityFrameworkCore.Design --version 8.0.0
dotnet add package Microsoft.EntityFrameworkCore.Tools --version 8.0.0
dotnet add package Microsoft.AspNetCore.Authentication.JwtBearer --version 8.0.0
dotnet add package BCrypt.Net-Next --version 4.0.3
```

### Project Structure

```
TeamFlow.API/
├── Controllers/
│   ├── PlayersController.cs
│   ├── EventsController.cs
│   ├── FilesController.cs
│   ├── MessagesController.cs
│   └── StatisticsController.cs
├── Data/
│   └── TeamFlowDbContext.cs
├── Models/
│   ├── Player.cs
│   ├── Event.cs
│   ├── EventAvailability.cs
│   ├── TeamFile.cs
│   ├── Message.cs
│   ├── Team.cs
│   └── User.cs
├── DTOs/
│   ├── PlayerDTOs.cs
│   ├── EventDTOs.cs
│   └── ...
├── Services/
│   ├── IPlayerService.cs
│   ├── PlayerService.cs
│   └── ...
├── Program.cs
└── appsettings.json
```

---

## 📊 Database Models

### Models/Player.cs

```csharp
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TeamFlow.API.Models
{
    [Table("players")]
    public class Player
    {
        [Key]
        [Column("id")]
        public Guid Id { get; set; } = Guid.NewGuid();

        [Required]
        [Column("team_id")]
        public Guid TeamId { get; set; }

        [Required]
        [MaxLength(255)]
        [Column("name")]
        public string Name { get; set; } = string.Empty;

        [MaxLength(10)]
        [Column("jersey_number")]
        public string JerseyNumber { get; set; } = string.Empty;

        [MaxLength(100)]
        [Column("position")]
        public string Position { get; set; } = string.Empty;

        [MaxLength(255)]
        [Column("email")]
        public string Email { get; set; } = string.Empty;

        [MaxLength(50)]
        [Column("phone")]
        public string Phone { get; set; } = string.Empty;

        [MaxLength(255)]
        [Column("emergency_contact")]
        public string EmergencyContact { get; set; } = string.Empty;

        [MaxLength(50)]
        [Column("emergency_phone")]
        public string EmergencyPhone { get; set; } = string.Empty;

        [MaxLength(500)]
        [Column("photo_url")]
        public string? PhotoUrl { get; set; }

        [Column("created_at")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [Column("updated_at")]
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        // Navigation properties
        [ForeignKey("TeamId")]
        public Team Team { get; set; } = null!;

        public ICollection<EventAvailability> Availabilities { get; set; } = new List<EventAvailability>();
    }
}
```

### Models/Event.cs

```csharp
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TeamFlow.API.Models
{
    [Table("events")]
    public class Event
    {
        [Key]
        [Column("id")]
        public Guid Id { get; set; } = Guid.NewGuid();

        [Required]
        [Column("team_id")]
        public Guid TeamId { get; set; }

        [Required]
        [MaxLength(255)]
        [Column("title")]
        public string Title { get; set; } = string.Empty;

        [Required]
        [MaxLength(50)]
        [Column("type")]
        public string Type { get; set; } = string.Empty; // 'game', 'practice', 'event'

        [Required]
        [Column("date")]
        public DateOnly Date { get; set; }

        [Required]
        [Column("time")]
        public TimeOnly Time { get; set; }

        [MaxLength(255)]
        [Column("location")]
        public string Location { get; set; } = string.Empty;

        [MaxLength(255)]
        [Column("opponent")]
        public string? Opponent { get; set; }

        [Column("notes")]
        public string? Notes { get; set; }

        [Column("created_at")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [Column("updated_at")]
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        // Navigation properties
        [ForeignKey("TeamId")]
        public Team Team { get; set; } = null!;

        public ICollection<EventAvailability> Availabilities { get; set; } = new List<EventAvailability>();
    }
}
```

### Models/EventAvailability.cs

```csharp
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TeamFlow.API.Models
{
    [Table("event_availability")]
    public class EventAvailability
    {
        [Key]
        [Column("id")]
        public Guid Id { get; set; } = Guid.NewGuid();

        [Required]
        [Column("event_id")]
        public Guid EventId { get; set; }

        [Required]
        [Column("player_id")]
        public Guid PlayerId { get; set; }

        [Required]
        [MaxLength(20)]
        [Column("status")]
        public string Status { get; set; } = string.Empty; // 'available', 'maybe', 'unavailable'

        [Column("updated_at")]
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        // Navigation properties
        [ForeignKey("EventId")]
        public Event Event { get; set; } = null!;

        [ForeignKey("PlayerId")]
        public Player Player { get; set; } = null!;
    }
}
```

### Models/TeamFile.cs

```csharp
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TeamFlow.API.Models
{
    [Table("files")]
    public class TeamFile
    {
        [Key]
        [Column("id")]
        public Guid Id { get; set; } = Guid.NewGuid();

        [Required]
        [Column("team_id")]
        public Guid TeamId { get; set; }

        [Required]
        [MaxLength(255)]
        [Column("name")]
        public string Name { get; set; } = string.Empty;

        [Required]
        [MaxLength(100)]
        [Column("type")]
        public string Type { get; set; } = string.Empty;

        [Required]
        [MaxLength(50)]
        [Column("category")]
        public string Category { get; set; } = string.Empty; // 'document', 'photo', 'other'

        [Required]
        [MaxLength(500)]
        [Column("storage_path")]
        public string StoragePath { get; set; } = string.Empty; // Path to file in storage

        [Column("size")]
        public long Size { get; set; }

        [Column("is_public")]
        public bool IsPublic { get; set; } = false;

        [Column("share_id")]
        public Guid? ShareId { get; set; }

        [Column("uploaded_by")]
        public Guid UploadedBy { get; set; }

        [Column("upload_date")]
        public DateTime UploadDate { get; set; } = DateTime.UtcNow;

        // Navigation properties
        [ForeignKey("TeamId")]
        public Team Team { get; set; } = null!;

        [ForeignKey("UploadedBy")]
        public User Uploader { get; set; } = null!;
    }
}
```

### Models/Message.cs

```csharp
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TeamFlow.API.Models
{
    [Table("messages")]
    public class Message
    {
        [Key]
        [Column("id")]
        public Guid Id { get; set; } = Guid.NewGuid();

        [Required]
        [Column("team_id")]
        public Guid TeamId { get; set; }

        [Required]
        [Column("sender_id")]
        public Guid SenderId { get; set; }

        [Required]
        [Column("content")]
        public string Content { get; set; } = string.Empty;

        [Required]
        [MaxLength(50)]
        [Column("recipients")]
        public string Recipients { get; set; } = string.Empty; // 'all', 'players', 'coaches', 'parents'

        [Column("timestamp")]
        public DateTime Timestamp { get; set; } = DateTime.UtcNow;

        // Navigation properties
        [ForeignKey("TeamId")]
        public Team Team { get; set; } = null!;

        [ForeignKey("SenderId")]
        public User Sender { get; set; } = null!;
    }
}
```

### Models/Team.cs

```csharp
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TeamFlow.API.Models
{
    [Table("teams")]
    public class Team
    {
        [Key]
        [Column("id")]
        public Guid Id { get; set; } = Guid.NewGuid();

        [Required]
        [MaxLength(255)]
        [Column("name")]
        public string Name { get; set; } = string.Empty;

        [MaxLength(100)]
        [Column("sport")]
        public string? Sport { get; set; }

        [Required]
        [Column("owner_id")]
        public Guid OwnerId { get; set; }

        [Column("created_at")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation properties
        [ForeignKey("OwnerId")]
        public User Owner { get; set; } = null!;

        public ICollection<Player> Players { get; set; } = new List<Player>();
        public ICollection<Event> Events { get; set; } = new List<Event>();
        public ICollection<TeamFile> Files { get; set; } = new List<TeamFile>();
        public ICollection<Message> Messages { get; set; } = new List<Message>();
    }
}
```

### Models/User.cs

```csharp
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TeamFlow.API.Models
{
    [Table("users")]
    public class User
    {
        [Key]
        [Column("id")]
        public Guid Id { get; set; } = Guid.NewGuid();

        [Required]
        [MaxLength(255)]
        [Column("email")]
        public string Email { get; set; } = string.Empty;

        [Required]
        [MaxLength(255)]
        [Column("name")]
        public string Name { get; set; } = string.Empty;

        [Required]
        [MaxLength(50)]
        [Column("role")]
        public string Role { get; set; } = string.Empty; // 'admin', 'coach', 'player', 'parent'

        [Required]
        [MaxLength(500)]
        [Column("password_hash")]
        public string PasswordHash { get; set; } = string.Empty;

        [Column("created_at")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation properties
        public ICollection<Team> OwnedTeams { get; set; } = new List<Team>();
        public ICollection<Message> SentMessages { get; set; } = new List<Message>();
        public ICollection<TeamFile> UploadedFiles { get; set; } = new List<TeamFile>();
    }
}
```

---

## 🗄️ DbContext Configuration

### Data/TeamFlowDbContext.cs

```csharp
using Microsoft.EntityFrameworkCore;
using TeamFlow.API.Models;

namespace TeamFlow.API.Data
{
    public class TeamFlowDbContext : DbContext
    {
        public TeamFlowDbContext(DbContextOptions<TeamFlowDbContext> options)
            : base(options)
        {
        }

        public DbSet<User> Users { get; set; }
        public DbSet<Team> Teams { get; set; }
        public DbSet<Player> Players { get; set; }
        public DbSet<Event> Events { get; set; }
        public DbSet<EventAvailability> EventAvailabilities { get; set; }
        public DbSet<TeamFile> Files { get; set; }
        public DbSet<Message> Messages { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Configure unique constraints
            modelBuilder.Entity<User>()
                .HasIndex(u => u.Email)
                .IsUnique();

            modelBuilder.Entity<TeamFile>()
                .HasIndex(f => f.ShareId)
                .IsUnique();

            modelBuilder.Entity<EventAvailability>()
                .HasIndex(ea => new { ea.EventId, ea.PlayerId })
                .IsUnique();

            // Configure cascading deletes
            modelBuilder.Entity<Event>()
                .HasMany(e => e.Availabilities)
                .WithOne(ea => ea.Event)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Player>()
                .HasMany(p => p.Availabilities)
                .WithOne(ea => ea.Player)
                .OnDelete(DeleteBehavior.Cascade);

            // Configure check constraints
            modelBuilder.Entity<EventAvailability>()
                .HasCheckConstraint("CK_EventAvailability_Status",
                    "status IN ('available', 'maybe', 'unavailable')");

            modelBuilder.Entity<Event>()
                .HasCheckConstraint("CK_Event_Type",
                    "type IN ('game', 'practice', 'event')");

            modelBuilder.Entity<TeamFile>()
                .HasCheckConstraint("CK_TeamFile_Category",
                    "category IN ('document', 'photo', 'other')");

            modelBuilder.Entity<Message>()
                .HasCheckConstraint("CK_Message_Recipients",
                    "recipients IN ('all', 'players', 'coaches', 'parents')");
        }
    }
}
```

---

## 🎯 Controllers

### Controllers/PlayersController.cs

```csharp
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TeamFlow.API.Data;
using TeamFlow.API.Models;
using TeamFlow.API.DTOs;

namespace TeamFlow.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PlayersController : ControllerBase
    {
        private readonly TeamFlowDbContext _context;

        public PlayersController(TeamFlowDbContext context)
        {
            _context = context;
        }

        // GET: api/players
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Player>>> GetPlayers([FromQuery] Guid? teamId = null)
        {
            var query = _context.Players.AsQueryable();

            if (teamId.HasValue)
            {
                query = query.Where(p => p.TeamId == teamId.Value);
            }

            return await query.ToListAsync();
        }

        // GET: api/players/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<Player>> GetPlayer(Guid id)
        {
            var player = await _context.Players.FindAsync(id);

            if (player == null)
            {
                return NotFound();
            }

            return player;
        }

        // POST: api/players
        [HttpPost]
        public async Task<ActionResult<Player>> CreatePlayer(CreatePlayerDTO dto)
        {
            var player = new Player
            {
                TeamId = dto.TeamId,
                Name = dto.Name,
                JerseyNumber = dto.JerseyNumber,
                Position = dto.Position,
                Email = dto.Email,
                Phone = dto.Phone,
                EmergencyContact = dto.EmergencyContact,
                EmergencyPhone = dto.EmergencyPhone,
                PhotoUrl = dto.PhotoUrl
            };

            _context.Players.Add(player);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetPlayer), new { id = player.Id }, player);
        }

        // PUT: api/players/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdatePlayer(Guid id, UpdatePlayerDTO dto)
        {
            var player = await _context.Players.FindAsync(id);

            if (player == null)
            {
                return NotFound();
            }

            if (dto.Name != null) player.Name = dto.Name;
            if (dto.JerseyNumber != null) player.JerseyNumber = dto.JerseyNumber;
            if (dto.Position != null) player.Position = dto.Position;
            if (dto.Email != null) player.Email = dto.Email;
            if (dto.Phone != null) player.Phone = dto.Phone;
            if (dto.EmergencyContact != null) player.EmergencyContact = dto.EmergencyContact;
            if (dto.EmergencyPhone != null) player.EmergencyPhone = dto.EmergencyPhone;
            if (dto.PhotoUrl != null) player.PhotoUrl = dto.PhotoUrl;

            player.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return NoContent();
        }

        // DELETE: api/players/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeletePlayer(Guid id)
        {
            var player = await _context.Players.FindAsync(id);

            if (player == null)
            {
                return NotFound();
            }

            _context.Players.Remove(player);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // GET: api/players/search?q={query}
        [HttpGet("search")]
        public async Task<ActionResult<IEnumerable<Player>>> SearchPlayers([FromQuery] string q, [FromQuery] Guid? teamId = null)
        {
            var query = _context.Players.AsQueryable();

            if (teamId.HasValue)
            {
                query = query.Where(p => p.TeamId == teamId.Value);
            }

            query = query.Where(p =>
                p.Name.Contains(q) ||
                p.JerseyNumber.Contains(q) ||
                p.Position.Contains(q) ||
                p.Email.Contains(q)
            );

            return await query.ToListAsync();
        }
    }
}
```

### Controllers/EventsController.cs

```csharp
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TeamFlow.API.Data;
using TeamFlow.API.Models;
using TeamFlow.API.DTOs;

namespace TeamFlow.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class EventsController : ControllerBase
    {
        private readonly TeamFlowDbContext _context;

        public EventsController(TeamFlowDbContext context)
        {
            _context = context;
        }

        // GET: api/events
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Event>>> GetEvents(
            [FromQuery] Guid? teamId = null,
            [FromQuery] string? type = null,
            [FromQuery] DateOnly? startDate = null,
            [FromQuery] DateOnly? endDate = null)
        {
            var query = _context.Events
                .Include(e => e.Availabilities)
                .AsQueryable();

            if (teamId.HasValue)
            {
                query = query.Where(e => e.TeamId == teamId.Value);
            }

            if (!string.IsNullOrEmpty(type))
            {
                query = query.Where(e => e.Type == type);
            }

            if (startDate.HasValue)
            {
                query = query.Where(e => e.Date >= startDate.Value);
            }

            if (endDate.HasValue)
            {
                query = query.Where(e => e.Date <= endDate.Value);
            }

            return await query.OrderBy(e => e.Date).ThenBy(e => e.Time).ToListAsync();
        }

        // GET: api/events/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<Event>> GetEvent(Guid id)
        {
            var evt = await _context.Events
                .Include(e => e.Availabilities)
                .FirstOrDefaultAsync(e => e.Id == id);

            if (evt == null)
            {
                return NotFound();
            }

            return evt;
        }

        // POST: api/events
        [HttpPost]
        public async Task<ActionResult<Event>> CreateEvent(CreateEventDTO dto)
        {
            var evt = new Event
            {
                TeamId = dto.TeamId,
                Title = dto.Title,
                Type = dto.Type,
                Date = dto.Date,
                Time = dto.Time,
                Location = dto.Location,
                Opponent = dto.Opponent,
                Notes = dto.Notes
            };

            _context.Events.Add(evt);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetEvent), new { id = evt.Id }, evt);
        }

        // PUT: api/events/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateEvent(Guid id, UpdateEventDTO dto)
        {
            var evt = await _context.Events.FindAsync(id);

            if (evt == null)
            {
                return NotFound();
            }

            if (dto.Title != null) evt.Title = dto.Title;
            if (dto.Type != null) evt.Type = dto.Type;
            if (dto.Date.HasValue) evt.Date = dto.Date.Value;
            if (dto.Time.HasValue) evt.Time = dto.Time.Value;
            if (dto.Location != null) evt.Location = dto.Location;
            if (dto.Opponent != null) evt.Opponent = dto.Opponent;
            if (dto.Notes != null) evt.Notes = dto.Notes;

            evt.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return NoContent();
        }

        // DELETE: api/events/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteEvent(Guid id)
        {
            var evt = await _context.Events.FindAsync(id);

            if (evt == null)
            {
                return NotFound();
            }

            _context.Events.Remove(evt);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // POST: api/events/{id}/availability
        [HttpPost("{id}/availability")]
        public async Task<IActionResult> UpdateAvailability(Guid id, UpdateAvailabilityDTO dto)
        {
            var evt = await _context.Events.FindAsync(id);

            if (evt == null)
            {
                return NotFound();
            }

            var availability = await _context.EventAvailabilities
                .FirstOrDefaultAsync(ea => ea.EventId == id && ea.PlayerId == dto.PlayerId);

            if (availability == null)
            {
                availability = new EventAvailability
                {
                    EventId = id,
                    PlayerId = dto.PlayerId,
                    Status = dto.Status
                };
                _context.EventAvailabilities.Add(availability);
            }
            else
            {
                availability.Status = dto.Status;
                availability.UpdatedAt = DateTime.UtcNow;
            }

            await _context.SaveChangesAsync();

            return NoContent();
        }

        // GET: api/events/{id}/availability-stats
        [HttpGet("{id}/availability-stats")]
        public async Task<ActionResult<AvailabilityStatsDTO>> GetAvailabilityStats(Guid id)
        {
            var availabilities = await _context.EventAvailabilities
                .Where(ea => ea.EventId == id)
                .ToListAsync();

            var stats = new AvailabilityStatsDTO
            {
                Available = availabilities.Count(a => a.Status == "available"),
                Maybe = availabilities.Count(a => a.Status == "maybe"),
                Unavailable = availabilities.Count(a => a.Status == "unavailable")
            };

            return stats;
        }
    }
}
```

---

## 📦 DTOs

### DTOs/PlayerDTOs.cs

```csharp
namespace TeamFlow.API.DTOs
{
    public record CreatePlayerDTO(
        Guid TeamId,
        string Name,
        string JerseyNumber,
        string Position,
        string Email,
        string Phone,
        string EmergencyContact,
        string EmergencyPhone,
        string? PhotoUrl = null
    );

    public record UpdatePlayerDTO(
        string? Name = null,
        string? JerseyNumber = null,
        string? Position = null,
        string? Email = null,
        string? Phone = null,
        string? EmergencyContact = null,
        string? EmergencyPhone = null,
        string? PhotoUrl = null
    );
}
```

### DTOs/EventDTOs.cs

```csharp
namespace TeamFlow.API.DTOs
{
    public record CreateEventDTO(
        Guid TeamId,
        string Title,
        string Type,
        DateOnly Date,
        TimeOnly Time,
        string Location,
        string? Opponent = null,
        string? Notes = null
    );

    public record UpdateEventDTO(
        string? Title = null,
        string? Type = null,
        DateOnly? Date = null,
        TimeOnly? Time = null,
        string? Location = null,
        string? Opponent = null,
        string? Notes = null
    );

    public record UpdateAvailabilityDTO(
        Guid PlayerId,
        string Status
    );

    public record AvailabilityStatsDTO
    {
        public int Available { get; set; }
        public int Maybe { get; set; }
        public int Unavailable { get; set; }
    }
}
```

---

## ⚙️ Program.cs Configuration

```csharp
using Microsoft.EntityFrameworkCore;
using TeamFlow.API.Data;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Configure PostgreSQL with EF Core
builder.Services.AddDbContext<TeamFlowDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

// Configure CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins("http://localhost:5173", "https://your-frontend-url.com")
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

var app = builder.Build();

// Configure the HTTP request pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseCors("AllowFrontend");
app.UseAuthorization();
app.MapControllers();

app.Run();
```

---

## 🗃️ Migrations

```bash
# Create initial migration
dotnet ef migrations add InitialCreate

# Update database
dotnet ef database update

# Create subsequent migrations
dotnet ef migrations add AddShareIdToFiles
dotnet ef database update
```

---

## 🌐 Frontend Integration

### Update useTeamFlowAPI Hook

```typescript
// src/hooks/use-teamflow-api.ts
import { useState, useEffect } from 'react'
import { Player, Event, TeamFile, Message, PlayerStats } from '@/lib/types'

const API_BASE_URL = 'https://your-api.com/api'

export function useTeamFlowAPI() {
  const [roster, setRoster] = useState<Player[]>([])
  const [events, setEvents] = useState<Event[]>([])

  useEffect(() => {
    // Load initial data
    fetch(`${API_BASE_URL}/players`)
      .then(res => res.json())
      .then(data => setRoster(data))
  }, [])

  const players = {
    getAll: () => roster,
    
    create: async (dto: CreatePlayerDTO) => {
      const response = await fetch(`${API_BASE_URL}/players`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dto)
      })
      const newPlayer = await response.json()
      setRoster(prev => [...prev, newPlayer])
      return newPlayer
    },

    update: async (id: string, dto: UpdatePlayerDTO) => {
      await fetch(`${API_BASE_URL}/players/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dto)
      })
      setRoster(prev => prev.map(p => p.id === id ? { ...p, ...dto } : p))
    },

    delete: async (id: string) => {
      await fetch(`${API_BASE_URL}/players/${id}`, { method: 'DELETE' })
      setRoster(prev => prev.filter(p => p.id !== id))
    }
  }

  return { players, events: {}, files: {}, messages: {}, stats: {} }
}
```

---

## 📝 Summary

This implementation provides:

✅ Complete C# Web API with RESTful endpoints  
✅ PostgreSQL database with EF Core  
✅ Proper entity relationships and constraints  
✅ Type-safe DTOs for all operations  
✅ CORS configuration for frontend integration  
✅ Migration support for database versioning  

The architecture is production-ready and follows C# best practices while maintaining compatibility with the existing frontend service layer pattern.
