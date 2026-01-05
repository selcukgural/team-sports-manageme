# TeamFlow - Veri Depolama Dokümantasyonu

## 📊 Mevcut Veri Depolama Sistemi

TeamFlow uygulaması şu anda **Spark Runtime'ın Key-Value (KV) depolama sistemi**ni kullanarak verileri tarayıcıda saklamaktadır.

### 🔑 Kullanılan Depolama API'si

**`useKV` React Hook** - Spark Runtime tarafından sağlanan, verileri kalıcı olarak saklayan bir React hook'u.

```typescript
import { useKV } from '@github/spark/hooks'

// Kullanım:
const [data, setData] = useKV<Type>('storage-key', defaultValue)
```

---

## 📦 Depolanan Veriler ve Anahtarlar

### 1. **Kadro Bilgileri (Roster)**
- **Anahtar:** `'roster'`
- **Dosya:** `/src/components/roster/RosterView.tsx`
- **Veri Tipi:** `Player[]`
- **İçerik:**
  - Oyuncu adı
  - Forma numarası
  - Pozisyon
  - Email
  - Telefon
  - Acil durum iletişim bilgileri

```typescript
const [roster = [], setRoster] = useKV<Player[]>('roster', [])
```

### 2. **Etkinlikler/Takvim (Schedule)**
- **Anahtar:** `'events'`
- **Dosya:** `/src/components/schedule/ScheduleView.tsx`
- **Veri Tipi:** `Event[]`
- **İçerik:**
  - Etkinlik başlığı
  - Tip (antrenman, maç, turnuva)
  - Tarih ve saat
  - Konum
  - Rakip takım (maçlar için)
  - Notlar
  - Oyuncu müsaitlik durumları

```typescript
const [events = [], setEvents] = useKV<Event[]>('events', [])
```

### 3. **Dosyalar (Files)**
- **Anahtar:** `'team-files'`
- **Dosya:** `/src/components/files/FilesView.tsx`
- **Veri Tipi:** `TeamFile[]`
- **İçerik:**
  - Dosya adı ve tipi
  - Kategori (doküman, fotoğraf, antrenman planı, diğer)
  - Base64 formatında dosya içeriği
  - Yüklenme tarihi
  - Boyut
  - Paylaşım durumu (public/private)
  - Paylaşım ID'si

```typescript
const [files = [], setFiles] = useKV<TeamFile[]>('team-files', [])
```

### 4. **Mesajlar (Messages)**
- **Anahtar:** `'messages'`
- **Dosya:** `/src/components/messages/MessagesView.tsx`
- **Veri Tipi:** `Message[]`
- **İçerik:**
  - Gönderen
  - Mesaj içeriği
  - Zaman damgası
  - Alıcılar (tüm takım, oyuncular, antrenörler, veliler)

```typescript
const [messages = [], setMessages] = useKV<Message[]>('messages', [])
```

---

## 🔧 Spark KV API Özellikleri

### Temel İşlemler:

```typescript
// Veri okuma/yazma (React hook ile)
const [data, setData, deleteData] = useKV("key", defaultValue)

// Veri güncelleme (Functional update - ÖNERİLEN)
setData((current) => [...current, newItem])

// Veri silme
deleteData()

// Direkt API kullanımı (React dışında)
await spark.kv.set("key", value)
const value = await spark.kv.get("key")
await spark.kv.delete("key")
const allKeys = await spark.kv.keys()
```

### ⚠️ Önemli Notlar:

1. **Functional Updates Kullanın:**
   ```typescript
   // ❌ YANLIŞ - Veri kaybına neden olur
   setRoster([...roster, newPlayer])
   
   // ✅ DOĞRU - Güncel veriyi alır
   setRoster((current) => [...current, newPlayer])
   ```

2. **Veri Kalıcılığı:**
   - Veriler tarayıcı oturumları arasında kalıcıdır
   - Sayfa yenilendiğinde veriler kaybolmaz
   - Her kullanıcının kendi lokal deposu vardır

3. **Depolama Sınırları:**
   - Tarayıcı depolama limitlerine tabidir (genelde 5-10 MB)
   - Büyük dosyalar Base64 formatında saklanır

---

## 🎯 Veri Tipleri

Tüm veri tipleri `/src/lib/types.ts` dosyasında tanımlanmıştır:

```typescript
// Oyuncu
interface Player {
  id: string
  name: string
  jerseyNumber: string
  position: string
  email: string
  phone: string
  emergencyContact: string
  emergencyPhone: string
}

// Etkinlik
interface Event {
  id: string
  title: string
  type: EventType
  date: string
  time: string
  location: string
  opponent?: string
  notes: string
  availability: Record<string, AvailabilityStatus>
}

// Dosya
interface TeamFile {
  id: string
  name: string
  type: string
  category: 'document' | 'photo' | 'practice-plan' | 'other'
  uploadDate: number
  size: number
  data: string
  isPublic: boolean
  shareId?: string
}

// Mesaj
interface Message {
  id: string
  sender: string
  content: string
  timestamp: number
  recipients: 'all' | 'players' | 'coaches' | 'parents'
}
```

---

## 🔄 Backend Entegrasyonu için Öneriler

Şu anda veriler **client-side (tarayıcıda)** saklanıyor. Backend (C# Web API + PostgreSQL + EF Core) entegrasyonu için detaylı rehberler hazırlanmıştır:

### 📚 Backend Dokümantasyonu

TeamFlow için kapsamlı backend implementasyonu hazırlanmıştır:

1. **[BACKEND_API.md](./BACKEND_API.md)** - Tüm API endpoint'lerinin detaylı dokümantasyonu
   - RESTful API yapısı
   - Request/Response formatları
   - Her endpoint için TypeScript arayüzleri
   - PostgreSQL veritabanı şeması
   - C# Web API'ye migrasyon yol haritası

2. **[BACKEND_USAGE.md](./BACKEND_USAGE.md)** - Backend servislerini kullanma rehberi
   - `useTeamFlowAPI` hook kullanımı
   - Tüm servisler için örnek kod
   - Best practice'ler
   - Component örnekleri

3. **[CSHARP_IMPLEMENTATION.md](./CSHARP_IMPLEMENTATION.md)** - C# implementasyon rehberi
   - Tam C# Web API kodu
   - Entity Framework Core modelleri
   - DbContext konfigürasyonu
   - Controller implementasyonları
   - DTO tanımları
   - Migration yönetimi
   - Frontend entegrasyonu

### 🎯 Hızlı Başlangıç

Mevcut uygulama **service layer pattern** kullanıyor. Tüm backend işlemleri şu servislerde organize edilmiş:

```typescript
import { useTeamFlowAPI } from '@/hooks/use-teamflow-api'

function MyComponent() {
  const api = useTeamFlowAPI()

  // Kullanım:
  const players = api.players.getAll()
  api.players.create({ name: 'John Doe', ... })
  api.events.getUpcoming(5)
  api.files.enableSharing(fileId)
  api.messages.create({ sender: 'Coach', content: '...' })
}
```

### ⚡ Backend Mimarisi

**Şu anki durum:**
```
React Component → useTeamFlowAPI Hook → Service Layer → Spark KV Storage
```

**C# Backend ile:**
```
React Component → useTeamFlowAPI Hook → HTTP API Client → C# Web API → PostgreSQL
```

Service layer arayüzü aynı kalır, sadece implementasyon değişir!

---

## 📝 Özet

**TeamFlow şu anda tamamen client-side bir uygulamadır ve tüm veriler Spark Runtime'ın KV storage sistemi ile tarayıcıda saklanmaktadır.**

- ✅ Veriler kalıcıdır (sayfa yenilemeye dayanıklı)
- ✅ Her kullanıcı kendi verisini görür
- ❌ Veriler kullanıcılar arası paylaşılmaz
- ❌ Backend veritabanı yok (henüz)
- ❌ Çoklu cihaz senkronizasyonu yok

Backend entegrasyonu ile bu sınırlamalar ortadan kalkacak ve gerçek bir çok kullanıcılı takım yönetim sistemi haline gelecektir.
