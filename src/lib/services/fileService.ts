import { TeamFile } from '../types'
import { ulid } from 'ulid'

export interface CreateFileDTO {
  name: string
  type: string
  url: string
  uploadedBy: string
  category: 'document' | 'photo' | 'other'
}

export interface FileFilters {
  category?: 'document' | 'photo' | 'other'
  uploadedBy?: string
  startDate?: number
  endDate?: number
}

export interface ShareFileResponse {
  shareId: string
  shareUrl: string
}

export interface FileService {
  getAll: (filters?: FileFilters) => TeamFile[]
  getById: (id: string) => TeamFile | undefined
  getByShareId: (shareId: string) => TeamFile | undefined
  create: (dto: CreateFileDTO) => TeamFile
  delete: (id: string) => boolean
  enableSharing: (id: string) => ShareFileResponse | null
  disableSharing: (id: string) => boolean
  isShareEnabled: (id: string) => boolean
  getFilesByCategory: (category: 'document' | 'photo' | 'other') => TeamFile[]
}

export const createFileService = (
  files: TeamFile[],
  setFiles: (updater: (current: TeamFile[]) => TeamFile[]) => void
): FileService => {
  return {
    getAll: (filters?: FileFilters) => {
      let filtered = files

      if (filters?.category) {
        filtered = filtered.filter(f => f.category === filters.category)
      }

      if (filters?.uploadedBy) {
        filtered = filtered.filter(f => f.uploadedBy === filters.uploadedBy)
      }

      if (filters?.startDate) {
        filtered = filtered.filter(f => f.uploadedAt >= filters.startDate!)
      }

      if (filters?.endDate) {
        filtered = filtered.filter(f => f.uploadedAt <= filters.endDate!)
      }

      return filtered.sort((a, b) => b.uploadedAt - a.uploadedAt)
    },

    getById: (id: string) => {
      return files.find(file => file.id === id)
    },

    getByShareId: (shareId: string) => {
      return files.find(file => file.shareId === shareId && file.shareEnabled)
    },

    create: (dto: CreateFileDTO) => {
      const newFile: TeamFile = {
        id: ulid(),
        uploadedAt: Date.now(),
        shareEnabled: false,
        ...dto,
      }

      setFiles((current) => [...current, newFile])
      return newFile
    },

    delete: (id: string) => {
      let deleted = false

      setFiles((current) => {
        const filtered = current.filter(file => file.id !== id)
        deleted = filtered.length !== current.length
        return filtered
      })

      return deleted
    },

    enableSharing: (id: string) => {
      let shareResponse: ShareFileResponse | null = null

      setFiles((current) =>
        current.map(file => {
          if (file.id === id) {
            const shareId = file.shareId || ulid()
            const shareUrl = `${window.location.origin}?share=${shareId}`
            
            shareResponse = { shareId, shareUrl }
            
            return {
              ...file,
              shareEnabled: true,
              shareId,
              shareCreatedAt: Date.now(),
            }
          }
          return file
        })
      )

      return shareResponse
    },

    disableSharing: (id: string) => {
      let disabled = false

      setFiles((current) =>
        current.map(file => {
          if (file.id === id) {
            disabled = true
            return {
              ...file,
              shareEnabled: false,
            }
          }
          return file
        })
      )

      return disabled
    },

    isShareEnabled: (id: string) => {
      const file = files.find(f => f.id === id)
      return file?.shareEnabled || false
    },

    getFilesByCategory: (category: 'document' | 'photo' | 'other') => {
      return files
        .filter(f => f.category === category)
        .sort((a, b) => b.uploadedAt - a.uploadedAt)
    },
  }
}
