import { useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus, PaperPlaneTilt, ChatCircle } from '@phosphor-icons/react'
import { Message } from '@/lib/types'
import { format } from 'date-fns'
import { toast } from 'sonner'

export default function MessagesView() {
  const [messages = [], setMessages] = useKV<Message[]>('messages', [])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  
  const [formData, setFormData] = useState({
    content: '',
    recipients: 'all' as Message['recipients'],
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const newMessage: Message = {
      id: Date.now().toString(),
      sender: 'Coach',
      content: formData.content,
      timestamp: Date.now(),
      recipients: formData.recipients,
    }
    
    setMessages((current = []) => [newMessage, ...current])
    toast.success('Message sent successfully')
    
    setIsDialogOpen(false)
    resetForm()
  }

  const resetForm = () => {
    setFormData({
      content: '',
      recipients: 'all',
    })
  }

  const handleDelete = (messageId: string) => {
    setMessages((current = []) => current.filter(m => m.id !== messageId))
    toast.success('Message deleted')
  }

  const sortedMessages = [...messages].sort((a, b) => b.timestamp - a.timestamp)

  const getRecipientColor = (recipients: Message['recipients']) => {
    switch (recipients) {
      case 'all':
        return 'bg-primary text-primary-foreground'
      case 'coaches':
        return 'bg-secondary text-secondary-foreground'
      case 'players':
        return 'bg-accent text-accent-foreground'
      case 'parents':
        return 'bg-muted text-muted-foreground'
      default:
        return 'bg-muted text-muted-foreground'
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 md:px-6 lg:px-8 py-6 md:py-8 space-y-6 md:space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-2">Messages</h1>
          <p className="text-muted-foreground">Team announcements and communication</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open)
          if (!open) resetForm()
        }}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus size={20} />
              <span className="hidden sm:inline">New Message</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Send Message</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="recipients">Send To</Label>
                <Select value={formData.recipients} onValueChange={(value: Message['recipients']) => setFormData({ ...formData, recipients: value })}>
                  <SelectTrigger id="recipients">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Everyone</SelectItem>
                    <SelectItem value="coaches">Coaches Only</SelectItem>
                    <SelectItem value="players">Players Only</SelectItem>
                    <SelectItem value="parents">Parents Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="content">Message</Label>
                <Textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  rows={6}
                  placeholder="Type your message here..."
                  required
                />
              </div>

              <div className="flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="gap-2">
                  <PaperPlaneTilt size={16} />
                  Send Message
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {messages.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <ChatCircle size={64} className="text-muted-foreground/50 mb-4" />
            <h3 className="text-xl font-semibold mb-2">No messages yet</h3>
            <p className="text-muted-foreground mb-4">Send your first message to the team</p>
            <Button onClick={() => setIsDialogOpen(true)} className="gap-2">
              <Plus size={20} />
              New Message
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {sortedMessages.map(message => (
            <Card key={message.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4 md:p-6">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-bold text-lg">{message.sender}</p>
                      <Badge className={getRecipientColor(message.recipients)} variant="secondary">
                        {message.recipients === 'all' ? 'Everyone' : message.recipients}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(message.timestamp), 'EEEE, MMM d, yyyy • h:mm a')}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(message.id)}
                    className="text-destructive hover:bg-destructive/10"
                  >
                    Delete
                  </Button>
                </div>
                <p className="text-foreground whitespace-pre-wrap leading-relaxed">
                  {message.content}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
