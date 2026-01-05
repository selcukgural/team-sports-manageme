import { useState, useRef } from 'react'
import { useKV } from '@github/spark/hooks'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Plus, 
  UploadSimple, 
  File as FileIcon, 
  Image as ImageIcon, 
  FilePdf, 
  FileDoc,
  Trash,
  DownloadSimple,
  FolderOpen
} from '@phosphor-icons/react'
import { TeamFile } from '@/lib/types'
import { format } from 'date-fns'
import { toast } from 'sonner'

export default function FilesView() {
  const [files = [], setFiles] = useKV<TeamFile[]>('team-files', [])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<TeamFile['category']>('document')
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [previewFile, setPreviewFile] = useState<TeamFile | null>(null)

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files
    if (!selectedFiles || selectedFiles.length === 0) return

    setUploading(true)

    try {
      const newFiles: TeamFile[] = []

      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i]
        
        const reader = new FileReader()
        const fileData = await new Promise<string>((resolve, reject) => {
          reader.onload = (event) => {
            if (event.target?.result) {
              resolve(event.target.result as string)
            } else {
              reject(new Error('Failed to read file'))
            }
          }
          reader.onerror = () => reject(reader.error)
          reader.readAsDataURL(file)
        })

        const category = file.type.startsWith('image/') ? 'photo' : 
                        file.type.includes('pdf') || file.type.includes('document') ? 'document' : 
                        'other'

        const newFile: TeamFile = {
          id: `${Date.now()}-${i}`,
          name: file.name,
          type: file.type,
          url: fileData,
          uploadedBy: 'Current User',
          uploadedAt: Date.now(),
          category: selectedCategory || category
        }

        newFiles.push(newFile)
      }

      setFiles((current = []) => [...newFiles, ...current])
      toast.success(`${newFiles.length} file${newFiles.length > 1 ? 's' : ''} uploaded successfully`)
      setIsDialogOpen(false)
      
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    } catch (error) {
      toast.error('Failed to upload file')
      console.error('Upload error:', error)
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = (fileId: string) => {
    setFiles((current = []) => current.filter(f => f.id !== fileId))
    setPreviewFile(null)
    toast.success('File deleted')
  }

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

  const documentFiles = files.filter(f => f.category === 'document')
  const photoFiles = files.filter(f => f.category === 'photo')
  const otherFiles = files.filter(f => f.category === 'other')

  const FileCard = ({ file }: { file: TeamFile }) => {
    const Icon = getFileIcon(file)
    const iconColor = getFileIconColor(file)
    const isImage = file.type.startsWith('image/')

    return (
      <Card className="hover:shadow-lg transition-all hover:-translate-y-0.5 overflow-hidden">
        <CardContent className="p-0">
          {isImage && (
            <div 
              className="w-full h-40 bg-muted cursor-pointer overflow-hidden"
              onClick={() => setPreviewFile(file)}
            >
              <img 
                src={file.url} 
                alt={file.name}
                className="w-full h-full object-cover hover:scale-105 transition-transform"
              />
            </div>
          )}
          
          <div className="p-4">
            {!isImage && (
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                  <Icon size={24} className={iconColor} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold truncate text-sm">{file.name}</h3>
                  <p className="text-xs text-muted-foreground">{formatFileSize(file.url)}</p>
                </div>
              </div>
            )}

            {isImage && (
              <div className="mb-3">
                <h3 className="font-semibold truncate text-sm">{file.name}</h3>
                <p className="text-xs text-muted-foreground">{formatFileSize(file.url)}</p>
              </div>
            )}

            <div className="space-y-2 mb-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Uploaded by</span>
                <span className="font-medium">{file.uploadedBy}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Date</span>
                <span className="font-medium">{format(new Date(file.uploadedAt), 'MMM d, yyyy')}</span>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                className="flex-1 gap-1"
                onClick={() => handleDownload(file)}
              >
                <DownloadSimple size={16} />
                Download
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => handleDelete(file.id)}
                className="text-destructive"
              >
                <Trash size={16} />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  const EmptyState = ({ category }: { category: string }) => (
    <div className="text-center py-16">
      <FolderOpen size={64} className="mx-auto text-muted-foreground/50 mb-4" />
      <h3 className="text-xl font-semibold mb-2">No {category} yet</h3>
      <p className="text-muted-foreground mb-4">Upload your first {category} to get started</p>
      <Button onClick={() => setIsDialogOpen(true)} className="gap-2">
        <Plus size={20} />
        Upload {category}
      </Button>
    </div>
  )

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-6 md:py-8 space-y-6 md:space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-2">Team Files</h1>
          <p className="text-muted-foreground">Share practice plans, photos, and documents</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus size={20} />
              <span className="hidden sm:inline">Upload Files</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Upload Files</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="category">Category</Label>
                <Select 
                  value={selectedCategory} 
                  onValueChange={(value: TeamFile['category']) => setSelectedCategory(value)}
                >
                  <SelectTrigger id="category">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="document">Practice Plans & Documents</SelectItem>
                    <SelectItem value="photo">Team Photos</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="file-upload">Select Files</Label>
                <div className="mt-2">
                  <input
                    ref={fileInputRef}
                    id="file-upload"
                    type="file"
                    multiple
                    accept="image/*,.pdf,.doc,.docx,.txt"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full h-32 border-dashed gap-3 flex-col"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                  >
                    <UploadSimple size={32} className="text-muted-foreground" />
                    <div className="text-center">
                      <p className="text-sm font-medium">
                        {uploading ? 'Uploading...' : 'Click to select files'}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Images, PDFs, and documents
                      </p>
                    </div>
                  </Button>
                </div>
              </div>

              <div className="text-xs text-muted-foreground bg-muted p-3 rounded-md">
                <p className="font-medium mb-1">Tips:</p>
                <ul className="space-y-0.5 list-disc list-inside">
                  <li>You can select multiple files at once</li>
                  <li>Images will be automatically categorized as photos</li>
                  <li>Files are stored securely with your team data</li>
                </ul>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {files.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <FolderOpen size={64} className="text-muted-foreground/50 mb-4" />
            <h3 className="text-xl font-semibold mb-2">No files yet</h3>
            <p className="text-muted-foreground mb-4">Upload practice plans, team photos, and other documents</p>
            <Button onClick={() => setIsDialogOpen(true)} className="gap-2">
              <Plus size={20} />
              Upload Files
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="all">
              All Files
              <Badge variant="secondary" className="ml-2">{files.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="documents">
              Documents
              <Badge variant="secondary" className="ml-2">{documentFiles.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="photos">
              Photos
              <Badge variant="secondary" className="ml-2">{photoFiles.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="other">
              Other
              <Badge variant="secondary" className="ml-2">{otherFiles.length}</Badge>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all">
            {files.length === 0 ? (
              <EmptyState category="files" />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {files.map(file => (
                  <FileCard key={file.id} file={file} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="documents">
            {documentFiles.length === 0 ? (
              <EmptyState category="documents" />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {documentFiles.map(file => (
                  <FileCard key={file.id} file={file} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="photos">
            {photoFiles.length === 0 ? (
              <EmptyState category="photos" />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {photoFiles.map(file => (
                  <FileCard key={file.id} file={file} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="other">
            {otherFiles.length === 0 ? (
              <EmptyState category="files" />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {otherFiles.map(file => (
                  <FileCard key={file.id} file={file} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      )}

      {previewFile && previewFile.type.startsWith('image/') && (
        <Dialog open={!!previewFile} onOpenChange={() => setPreviewFile(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
            <DialogHeader>
              <DialogTitle>{previewFile.name}</DialogTitle>
            </DialogHeader>
            <div className="flex flex-col gap-4">
              <img 
                src={previewFile.url} 
                alt={previewFile.name}
                className="w-full h-auto rounded-lg"
              />
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1 gap-2"
                  onClick={() => handleDownload(previewFile)}
                >
                  <DownloadSimple size={20} />
                  Download
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => handleDelete(previewFile.id)}
                  className="gap-2"
                >
                  <Trash size={20} />
                  Delete
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
