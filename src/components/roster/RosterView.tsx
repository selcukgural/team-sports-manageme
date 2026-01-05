import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Plus, Envelope, Phone, User } from '@phosphor-icons/react'
import { Player } from '@/lib/types'
import { toast } from 'sonner'
import { useTeamFlowAPI } from '@/hooks/use-teamflow-api'

export default function RosterView() {
  const api = useTeamFlowAPI()
  const roster = api.players.getAll()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null)
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null)

  const [formData, setFormData] = useState({
    name: '',
    jerseyNumber: '',
    position: '',
    email: '',
    phone: '',
    emergencyContact: '',
    emergencyPhone: '',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (editingPlayer) {
      const updated = api.players.update(editingPlayer.id, formData)
      if (updated) {
        toast.success('Player updated successfully')
      } else {
        toast.error('Failed to update player')
      }
    } else {
      api.players.create(formData)
      toast.success('Player added successfully')
    }

    setIsDialogOpen(false)
    resetForm()
  }

  const resetForm = () => {
    setFormData({
      name: '',
      jerseyNumber: '',
      position: '',
      email: '',
      phone: '',
      emergencyContact: '',
      emergencyPhone: '',
    })
    setEditingPlayer(null)
  }

  const handleEdit = (player: Player) => {
    setEditingPlayer(player)
    setFormData({
      name: player.name,
      jerseyNumber: player.jerseyNumber,
      position: player.position,
      email: player.email,
      phone: player.phone,
      emergencyContact: player.emergencyContact,
      emergencyPhone: player.emergencyPhone,
    })
    setIsDialogOpen(true)
  }

  const handleDelete = (playerId: string) => {
    const deleted = api.players.delete(playerId)
    if (deleted) {
      setSelectedPlayer(null)
      toast.success('Player removed')
    } else {
      toast.error('Failed to remove player')
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-6 md:py-8 space-y-6 md:space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-2">Team Roster</h1>
          <p className="text-muted-foreground">Manage your team members and their information</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open)
          if (!open) resetForm()
        }}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus size={20} />
              <span className="hidden sm:inline">Add Player</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingPlayer ? 'Edit Player' : 'Add New Player'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="jerseyNumber">Jersey #</Label>
                  <Input
                    id="jerseyNumber"
                    value={formData.jerseyNumber}
                    onChange={(e) => setFormData({ ...formData, jerseyNumber: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="position">Position</Label>
                  <Input
                    id="position"
                    value={formData.position}
                    onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  required
                />
              </div>

              <div className="border-t pt-4">
                <h3 className="font-semibold mb-3">Emergency Contact</h3>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="emergencyContact">Contact Name</Label>
                    <Input
                      id="emergencyContact"
                      value={formData.emergencyContact}
                      onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="emergencyPhone">Contact Phone</Label>
                    <Input
                      id="emergencyPhone"
                      type="tel"
                      value={formData.emergencyPhone}
                      onChange={(e) => setFormData({ ...formData, emergencyPhone: e.target.value })}
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingPlayer ? 'Update' : 'Add'} Player
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {roster.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <User size={64} className="text-muted-foreground/50 mb-4" />
            <h3 className="text-xl font-semibold mb-2">No players yet</h3>
            <p className="text-muted-foreground mb-4">Add your first team member to get started</p>
            <Button onClick={() => setIsDialogOpen(true)} className="gap-2">
              <Plus size={20} />
              Add Player
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {roster.map(player => (
            <Card key={player.id} className="hover:shadow-lg transition-all hover:-translate-y-0.5">
              <CardContent className="p-6">
                <div className="flex flex-col items-center text-center mb-4">
                  <Avatar className="w-20 h-20 mb-3 border-4 border-primary/20">
                    <AvatarFallback className="bg-primary text-primary-foreground text-2xl font-bold">
                      {getInitials(player.name)}
                    </AvatarFallback>
                  </Avatar>
                  <h3 className="text-xl font-bold mb-1">{player.name}</h3>
                  <div className="flex gap-2 items-center">
                    <Badge variant="secondary" className="text-lg font-bold">
                      #{player.jerseyNumber}
                    </Badge>
                    <Badge variant="outline">{player.position}</Badge>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm">
                    <Envelope size={16} className="text-muted-foreground flex-shrink-0" />
                    <span className="truncate">{player.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Phone size={16} className="text-muted-foreground flex-shrink-0" />
                    <span>{player.phone}</span>
                  </div>
                </div>

                <div className="border-t pt-4 mb-4">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium mb-2">
                    Emergency Contact
                  </p>
                  <p className="text-sm font-medium">{player.emergencyContact}</p>
                  <p className="text-sm text-muted-foreground">{player.emergencyPhone}</p>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1" onClick={() => handleEdit(player)}>
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 text-destructive hover:bg-destructive hover:text-destructive-foreground"
                    onClick={() => handleDelete(player.id)}
                  >
                    Remove
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
