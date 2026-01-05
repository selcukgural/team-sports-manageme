import { Message } from '../types'
import { ulid } from 'ulid'

export interface CreateMessageDTO {
  sender: string
  content: string
  recipients: 'all' | 'coaches' | 'players' | 'parents'
}

export interface MessageFilters {
  recipients?: 'all' | 'coaches' | 'players' | 'parents'
  sender?: string
  startDate?: number
  endDate?: number
}

export interface MessageService {
  getAll: (filters?: MessageFilters, limit?: number) => Message[]
  getById: (id: string) => Message | undefined
  getRecent: (limit?: number) => Message[]
  create: (dto: CreateMessageDTO) => Message
  delete: (id: string) => boolean
  getByRecipients: (recipients: 'all' | 'coaches' | 'players' | 'parents') => Message[]
  getUnreadCount: () => number
}

export const createMessageService = (
  messages: Message[],
  setMessages: (updater: (current: Message[]) => Message[]) => void
): MessageService => {
  return {
    getAll: (filters?: MessageFilters, limit?: number) => {
      let filtered = messages

      if (filters?.recipients) {
        filtered = filtered.filter(m => m.recipients === filters.recipients)
      }

      if (filters?.sender) {
        filtered = filtered.filter(m => m.sender === filters.sender)
      }

      if (filters?.startDate) {
        filtered = filtered.filter(m => m.timestamp >= filters.startDate!)
      }

      if (filters?.endDate) {
        filtered = filtered.filter(m => m.timestamp <= filters.endDate!)
      }

      const sorted = filtered.sort((a, b) => b.timestamp - a.timestamp)
      
      return limit ? sorted.slice(0, limit) : sorted
    },

    getById: (id: string) => {
      return messages.find(message => message.id === id)
    },

    getRecent: (limit = 10) => {
      return messages
        .sort((a, b) => b.timestamp - a.timestamp)
        .slice(0, limit)
    },

    create: (dto: CreateMessageDTO) => {
      const newMessage: Message = {
        id: ulid(),
        timestamp: Date.now(),
        ...dto,
      }

      setMessages((current) => [...current, newMessage])
      return newMessage
    },

    delete: (id: string) => {
      let deleted = false

      setMessages((current) => {
        const filtered = current.filter(message => message.id !== id)
        deleted = filtered.length !== current.length
        return filtered
      })

      return deleted
    },

    getByRecipients: (recipients: 'all' | 'coaches' | 'players' | 'parents') => {
      return messages
        .filter(m => m.recipients === recipients)
        .sort((a, b) => b.timestamp - a.timestamp)
    },

    getUnreadCount: () => {
      return 0
    },
  }
}
