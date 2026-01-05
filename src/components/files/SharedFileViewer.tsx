import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  DownloadSimple, 
  File as FileIcon,
  Image as ImageIcon,
  FilePdf,
  FileDoc,
  Warning
} from '@phosphor-icons/react'
import { TeamFile } from '@/lib/types'
import { format } from 'date-fns'
import { toast } from 'sonner'
import { useTeamFlowAPI } from '@/hooks/use-teamflow-api'

interface SharedFileViewerProps {
  shareId: string
  onClose: () => void
}

export default function SharedFileViewer({ shareId, onClose }: SharedFileViewerProps) {
  const api = useTeamFlowAPI()
  const [sharedFile, setSharedFile] = useState<TeamFile | null>(null)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    const file = api.files.getByShareId(shareId)
    if (file) {
      setSharedFile(file)
      setNotFound(false)
    } else {
      setSharedFile(null)
      setNotFound(true)
    }
  }, [shareId, api.files])

  const handleDownload = (file: TeamFile) => {
    const link = document.createElement('a')
    link.href = file.url
    link.download = file.name
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    toast.success('File downloaded')
  }

  const getFileIcon = (file: TeamFile) => {
    if (file.type.startsWith('image/')) return ImageIcon
    if (file.type.includes('pdf')) return FilePdf
    if (file.type.includes('document') || file.type.includes('msword')) return FileDoc
    return FileIcon
  }

  const getFileIconColor = (file: TeamFile) => {
    if (file.type.startsWith('image/')) return 'text-primary'
    if (file.type.includes('pdf')) return 'text-destructive'
    if (file.type.includes('document')) return 'text-blue-600'
    return 'text-muted-foreground'
  }

  const formatFileSize = (dataUrl: string) => {
    const base64Length = dataUrl.split(',')[1]?.length || 0
    const sizeInBytes = (base64Length * 3) / 4
    if (sizeInBytes < 1024) return `${sizeInBytes.toFixed(0)} B`
    if (sizeInBytes < 1024 * 1024) return `${(sizeInBytes / 1024).toFixed(1)} KB`
    return `${(sizeInBytes / (1024 * 1024)).toFixed(1)} MB`
  }

  if (notFound) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
              <Warning size={32} className="text-destructive" />
            </div>
            <h2 className="text-2xl font-bold mb-2">File Not Found</h2>
            <p className="text-muted-foreground text-center mb-6">
              This file doesn't exist, sharing has been disabled, or the link is invalid.
            </p>
            <Button onClick={onClose} variant="outline">
              Close
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!sharedFile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading shared file...</p>
        </div>
      </div>
    )
  }

  const Icon = getFileIcon(sharedFile)
  const iconColor = getFileIconColor(sharedFile)
  const isImage = sharedFile.type.startsWith('image/')

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="max-w-3xl w-full">
        <CardHeader className="border-b">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
              <span className="text-primary-foreground font-bold text-lg">TF</span>
            </div>
            <div>
              <CardTitle className="text-xl">Shared File</CardTitle>
              <p className="text-sm text-muted-foreground mt-0.5">
                From TeamFlow
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          {isImage ? (
            <div className="rounded-lg overflow-hidden border bg-muted">
              <img 
                src={sharedFile.url} 
                alt={sharedFile.name}
                className="w-full h-auto max-h-[500px] object-contain"
              />
            </div>
          ) : (
            <div className="flex items-center gap-4 p-6 bg-muted rounded-lg">
              <div className="w-16 h-16 rounded-lg bg-background flex items-center justify-center flex-shrink-0">
                <Icon size={32} className={iconColor} />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-lg truncate">{sharedFile.name}</h3>
                <p className="text-sm text-muted-foreground">{formatFileSize(sharedFile.url)}</p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
            <div>
              <p className="text-xs text-muted-foreground mb-1">File Name</p>
              <p className="font-medium text-sm truncate">{sharedFile.name}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">File Size</p>
              <p className="font-medium text-sm">{formatFileSize(sharedFile.url)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Uploaded By</p>
              <p className="font-medium text-sm">{sharedFile.uploadedBy}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Upload Date</p>
              <p className="font-medium text-sm">{format(new Date(sharedFile.uploadedAt), 'MMM d, yyyy')}</p>
            </div>
          </div>

          <div className="flex gap-3">
            <Button 
              onClick={() => handleDownload(sharedFile)}
              className="flex-1 gap-2"
            >
              <DownloadSimple size={20} />
              Download File
            </Button>
            <Button 
              onClick={onClose}
              variant="outline"
            >
              Close
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
