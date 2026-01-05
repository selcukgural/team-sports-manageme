import { useState } from 'react'
import { CalendarBlank, Users, ChatCircle, ChartBar, Plus } from '@phosphor-icons/react'
import { Toaster } from '@/components/ui/sonner'
import { Button } from '@/components/ui/button'
import { useIsMobile } from '@/hooks/use-mobile'
import ScheduleView from '@/components/schedule/ScheduleView'
import RosterView from '@/components/roster/RosterView'
import MessagesView from '@/components/messages/MessagesView'
import StatsView from '@/components/stats/StatsView'
import DashboardView from '@/components/dashboard/DashboardView'

type View = 'dashboard' | 'schedule' | 'roster' | 'messages' | 'stats'

function App() {
  const [currentView, setCurrentView] = useState<View>('dashboard')
  const isMobile = useIsMobile()

  const navigation = [
    { id: 'dashboard' as View, label: 'Home', icon: ChartBar },
    { id: 'schedule' as View, label: 'Schedule', icon: CalendarBlank },
    { id: 'roster' as View, label: 'Roster', icon: Users },
    { id: 'messages' as View, label: 'Messages', icon: ChatCircle },
    { id: 'stats' as View, label: 'Stats', icon: ChartBar },
  ]

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <DashboardView onNavigate={setCurrentView} />
      case 'schedule':
        return <ScheduleView />
      case 'roster':
        return <RosterView />
      case 'messages':
        return <MessagesView />
      case 'stats':
        return <StatsView />
      default:
        return <DashboardView onNavigate={setCurrentView} />
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {!isMobile && (
        <header className="border-b border-border bg-card sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 h-16 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-xl">TF</span>
              </div>
              <h1 className="text-2xl font-bold tracking-tight">TeamFlow</h1>
            </div>
            <nav className="flex gap-2">
              {navigation.map((item) => {
                const Icon = item.icon
                return (
                  <Button
                    key={item.id}
                    variant={currentView === item.id ? 'default' : 'ghost'}
                    onClick={() => setCurrentView(item.id)}
                    className="gap-2"
                  >
                    <Icon size={20} />
                    {item.label}
                  </Button>
                )
              })}
            </nav>
          </div>
        </header>
      )}

      <main className="flex-1 pb-20 md:pb-6">
        {renderView()}
      </main>

      {isMobile && (
        <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50">
          <div className="flex justify-around items-center h-16">
            {navigation.map((item) => {
              const Icon = item.icon
              const isActive = currentView === item.id
              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentView(item.id)}
                  className={`flex flex-col items-center justify-center gap-1 px-3 py-2 transition-colors ${
                    isActive ? 'text-primary' : 'text-muted-foreground'
                  }`}
                >
                  <Icon size={24} weight={isActive ? 'fill' : 'regular'} />
                  <span className="text-xs font-medium">{item.label}</span>
                </button>
              )
            })}
          </div>
        </nav>
      )}

      <Toaster />
    </div>
  )
}

export default App
