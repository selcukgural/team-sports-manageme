export type EventType = 'game' | 'practice' | 'event'

export type AvailabilityStatus = 'available' | 'maybe' | 'unavailable'

export interface Player {
  id: string
  name: string
  jerseyNumber: string
  position: string
  email: string
  phone: string
  emergencyContact: string
  emergencyPhone: string
  photoUrl?: string
}

export interface Event {
  id: string
  title: string
  type: EventType
  date: string
  time: string
  location: string
  opponent?: string
  notes?: string
  availability: Record<string, AvailabilityStatus>
}

export interface Message {
  id: string
  sender: string
  content: string
  timestamp: number
  recipients: 'all' | 'coaches' | 'players' | 'parents'
}

export interface PlayerStats {
  playerId: string
  gameId: string
  points?: number
  assists?: number
  rebounds?: number
  goals?: number
  [key: string]: string | number | undefined
}

export interface TeamFile {
  id: string
  name: string
  type: string
  url: string
  uploadedBy: string
  uploadedAt: number
  category: 'document' | 'photo' | 'other'
  shareId?: string
  shareEnabled?: boolean
  shareCreatedAt?: number
}
