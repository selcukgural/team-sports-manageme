import { useKV } from '@github/spark/hooks'
import { Player, Event, TeamFile, Message, PlayerStats } from '@/lib/types'
import {
  createPlayerService,
  createEventService,
  createFileService,
  createMessageService,
  createStatsService,
  type PlayerService,
  type EventService,
  type FileService,
  type MessageService,
  type StatsService,
} from '@/lib/services'

export interface TeamFlowAPI {
  players: PlayerService
  events: EventService
  files: FileService
  messages: MessageService
  stats: StatsService
}

export function useTeamFlowAPI(): TeamFlowAPI {
  const [roster = [], setRoster] = useKV<Player[]>('roster', [])
  const [events = [], setEvents] = useKV<Event[]>('events', [])
  const [files = [], setFiles] = useKV<TeamFile[]>('team-files', [])
  const [messages = [], setMessages] = useKV<Message[]>('messages', [])
  const [stats = [], setStats] = useKV<PlayerStats[]>('player-stats', [])

  const players = createPlayerService(roster, setRoster)
  const eventsService = createEventService(events, setEvents)
  const filesService = createFileService(files, setFiles)
  const messagesService = createMessageService(messages, setMessages)
  const statsService = createStatsService(stats, setStats)

  return {
    players,
    events: eventsService,
    files: filesService,
    messages: messagesService,
    stats: statsService,
  }
}
