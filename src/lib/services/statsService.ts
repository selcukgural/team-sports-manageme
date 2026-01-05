import { PlayerStats } from '../types'
import { ulid } from 'ulid'

export interface CreateStatsDTO {
  playerId: string
  gameId: string
  points?: number
  assists?: number
  rebounds?: number
  goals?: number
  [key: string]: string | number | undefined
}

export interface UpdateStatsDTO {
  points?: number
  assists?: number
  rebounds?: number
  goals?: number
  [key: string]: string | number | undefined
}

export interface PlayerStatsAggregation {
  playerId: string
  totalGames: number
  totalPoints: number
  totalAssists: number
  totalRebounds: number
  totalGoals: number
  averagePoints: number
  averageAssists: number
  averageRebounds: number
  averageGoals: number
}

export interface StatsService {
  getAll: () => PlayerStats[]
  getByPlayerId: (playerId: string) => PlayerStats[]
  getByGameId: (gameId: string) => PlayerStats[]
  create: (dto: CreateStatsDTO) => PlayerStats
  update: (playerId: string, gameId: string, dto: UpdateStatsDTO) => PlayerStats | null
  delete: (playerId: string, gameId: string) => boolean
  getPlayerAggregatedStats: (playerId: string) => PlayerStatsAggregation
  getTeamTopScorers: (limit?: number) => { playerId: string; totalPoints: number }[]
}

export const createStatsService = (
  stats: PlayerStats[],
  setStats: (updater: (current: PlayerStats[]) => PlayerStats[]) => void
): StatsService => {
  return {
    getAll: () => {
      return stats
    },

    getByPlayerId: (playerId: string) => {
      return stats.filter(s => s.playerId === playerId)
    },

    getByGameId: (gameId: string) => {
      return stats.filter(s => s.gameId === gameId)
    },

    create: (dto: CreateStatsDTO) => {
      const newStats: PlayerStats = {
        ...dto,
      }

      setStats((current) => [...current, newStats])
      return newStats
    },

    update: (playerId: string, gameId: string, dto: UpdateStatsDTO) => {
      let updatedStats: PlayerStats | null = null

      setStats((current) =>
        current.map(stat => {
          if (stat.playerId === playerId && stat.gameId === gameId) {
            updatedStats = { ...stat, ...dto }
            return updatedStats
          }
          return stat
        })
      )

      return updatedStats
    },

    delete: (playerId: string, gameId: string) => {
      let deleted = false

      setStats((current) => {
        const filtered = current.filter(
          stat => !(stat.playerId === playerId && stat.gameId === gameId)
        )
        deleted = filtered.length !== current.length
        return filtered
      })

      return deleted
    },

    getPlayerAggregatedStats: (playerId: string) => {
      const playerStats = stats.filter(s => s.playerId === playerId)
      const totalGames = playerStats.length

      const aggregation: PlayerStatsAggregation = {
        playerId,
        totalGames,
        totalPoints: 0,
        totalAssists: 0,
        totalRebounds: 0,
        totalGoals: 0,
        averagePoints: 0,
        averageAssists: 0,
        averageRebounds: 0,
        averageGoals: 0,
      }

      playerStats.forEach(stat => {
        aggregation.totalPoints += stat.points || 0
        aggregation.totalAssists += stat.assists || 0
        aggregation.totalRebounds += stat.rebounds || 0
        aggregation.totalGoals += stat.goals || 0
      })

      if (totalGames > 0) {
        aggregation.averagePoints = aggregation.totalPoints / totalGames
        aggregation.averageAssists = aggregation.totalAssists / totalGames
        aggregation.averageRebounds = aggregation.totalRebounds / totalGames
        aggregation.averageGoals = aggregation.totalGoals / totalGames
      }

      return aggregation
    },

    getTeamTopScorers: (limit = 10) => {
      const playerTotals = new Map<string, number>()

      stats.forEach(stat => {
        const current = playerTotals.get(stat.playerId) || 0
        playerTotals.set(stat.playerId, current + (stat.points || 0))
      })

      return Array.from(playerTotals.entries())
        .map(([playerId, totalPoints]) => ({ playerId, totalPoints }))
        .sort((a, b) => b.totalPoints - a.totalPoints)
        .slice(0, limit)
    },
  }
}
