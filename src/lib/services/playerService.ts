import { Player } from '../types'
import { ulid } from 'ulid'

export interface CreatePlayerDTO {
  name: string
  jerseyNumber: string
  position: string
  email: string
  phone: string
  emergencyContact: string
  emergencyPhone: string
  photoUrl?: string
}

export interface UpdatePlayerDTO {
  name?: string
  jerseyNumber?: string
  position?: string
  email?: string
  phone?: string
  emergencyContact?: string
  emergencyPhone?: string
  photoUrl?: string
}

export interface PlayerService {
  getAll: () => Player[]
  getById: (id: string) => Player | undefined
  create: (dto: CreatePlayerDTO) => Player
  update: (id: string, dto: UpdatePlayerDTO) => Player | null
  delete: (id: string) => boolean
  search: (query: string) => Player[]
}

export const createPlayerService = (
  roster: Player[],
  setRoster: (updater: (current: Player[]) => Player[]) => void
): PlayerService => {
  return {
    getAll: () => {
      return roster
    },

    getById: (id: string) => {
      return roster.find(player => player.id === id)
    },

    create: (dto: CreatePlayerDTO) => {
      const newPlayer: Player = {
        id: ulid(),
        ...dto,
      }

      setRoster((current) => [...current, newPlayer])
      return newPlayer
    },

    update: (id: string, dto: UpdatePlayerDTO) => {
      let updatedPlayer: Player | null = null

      setRoster((current) =>
        current.map(player => {
          if (player.id === id) {
            updatedPlayer = { ...player, ...dto }
            return updatedPlayer
          }
          return player
        })
      )

      return updatedPlayer
    },

    delete: (id: string) => {
      let deleted = false

      setRoster((current) => {
        const filtered = current.filter(player => player.id !== id)
        deleted = filtered.length !== current.length
        return filtered
      })

      return deleted
    },

    search: (query: string) => {
      const lowerQuery = query.toLowerCase()
      return roster.filter(player =>
        player.name.toLowerCase().includes(lowerQuery) ||
        player.jerseyNumber.toLowerCase().includes(lowerQuery) ||
        player.position.toLowerCase().includes(lowerQuery) ||
        player.email.toLowerCase().includes(lowerQuery)
      )
    },
  }
}
