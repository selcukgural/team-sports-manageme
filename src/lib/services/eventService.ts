import { Event, EventType, AvailabilityStatus } from '../types'
import { ulid } from 'ulid'

export interface CreateEventDTO {
  title: string
  type: EventType
  date: string
  time: string
  location: string
  opponent?: string
  notes?: string
}

export interface UpdateEventDTO {
  title?: string
  type?: EventType
  date?: string
  time?: string
  location?: string
  opponent?: string
  notes?: string
}

export interface UpdateAvailabilityDTO {
  playerId: string
  status: AvailabilityStatus
}

export interface EventFilters {
  type?: EventType
  startDate?: string
  endDate?: string
}

export interface EventService {
  getAll: (filters?: EventFilters) => Event[]
  getById: (id: string) => Event | undefined
  getUpcoming: (limit?: number) => Event[]
  getPast: (limit?: number) => Event[]
  create: (dto: CreateEventDTO) => Event
  update: (id: string, dto: UpdateEventDTO) => Event | null
  delete: (id: string) => boolean
  updateAvailability: (eventId: string, dto: UpdateAvailabilityDTO) => Event | null
  getAvailabilityStats: (eventId: string) => {
    available: number
    maybe: number
    unavailable: number
    noResponse: number
  }
}

export const createEventService = (
  events: Event[],
  setEvents: (updater: (current: Event[]) => Event[]) => void
): EventService => {
  return {
    getAll: (filters?: EventFilters) => {
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

      return filtered.sort((a, b) => {
        const dateA = new Date(`${a.date}T${a.time}`)
        const dateB = new Date(`${b.date}T${b.time}`)
        return dateA.getTime() - dateB.getTime()
      })
    },

    getById: (id: string) => {
      return events.find(event => event.id === id)
    },

    getUpcoming: (limit = 10) => {
      const now = new Date()
      return events
        .filter(event => {
          const eventDate = new Date(`${event.date}T${event.time}`)
          return eventDate >= now
        })
        .sort((a, b) => {
          const dateA = new Date(`${a.date}T${a.time}`)
          const dateB = new Date(`${b.date}T${b.time}`)
          return dateA.getTime() - dateB.getTime()
        })
        .slice(0, limit)
    },

    getPast: (limit = 10) => {
      const now = new Date()
      return events
        .filter(event => {
          const eventDate = new Date(`${event.date}T${event.time}`)
          return eventDate < now
        })
        .sort((a, b) => {
          const dateA = new Date(`${a.date}T${a.time}`)
          const dateB = new Date(`${b.date}T${b.time}`)
          return dateB.getTime() - dateA.getTime()
        })
        .slice(0, limit)
    },

    create: (dto: CreateEventDTO) => {
      const newEvent: Event = {
        id: ulid(),
        ...dto,
        availability: {},
      }

      setEvents((current) => [...current, newEvent])
      return newEvent
    },

    update: (id: string, dto: UpdateEventDTO) => {
      let updatedEvent: Event | null = null

      setEvents((current) =>
        current.map(event => {
          if (event.id === id) {
            updatedEvent = { ...event, ...dto }
            return updatedEvent
          }
          return event
        })
      )

      return updatedEvent
    },

    delete: (id: string) => {
      let deleted = false

      setEvents((current) => {
        const filtered = current.filter(event => event.id !== id)
        deleted = filtered.length !== current.length
        return filtered
      })

      return deleted
    },

    updateAvailability: (eventId: string, dto: UpdateAvailabilityDTO) => {
      let updatedEvent: Event | null = null

      setEvents((current) =>
        current.map(event => {
          if (event.id === eventId) {
            updatedEvent = {
              ...event,
              availability: {
                ...event.availability,
                [dto.playerId]: dto.status,
              },
            }
            return updatedEvent
          }
          return event
        })
      )

      return updatedEvent
    },

    getAvailabilityStats: (eventId: string) => {
      const event = events.find(e => e.id === eventId)
      
      if (!event) {
        return { available: 0, maybe: 0, unavailable: 0, noResponse: 0 }
      }

      const availability = event.availability
      const stats = {
        available: 0,
        maybe: 0,
        unavailable: 0,
        noResponse: 0,
      }

      Object.values(availability).forEach(status => {
        if (status === 'available') stats.available++
        else if (status === 'maybe') stats.maybe++
        else if (status === 'unavailable') stats.unavailable++
      })

      return stats
    },
  }
}
