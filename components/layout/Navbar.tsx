'use client'

import { Dumbbell, LogOut, Trophy, Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/useAuth'
import { NotificationBell } from '@/components/notifications/NotificationBell'
import { useRealtimeWorkouts } from '@/hooks/useRealtimeWorkouts'
import Link from 'next/link'

export function Navbar() {
  const { signOut, user } = useAuth()

  // Subscribe to real-time updates
  useRealtimeWorkouts(user?.id)

  return (
    <nav className="border-b bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/dashboard" className="flex items-center space-x-2">
            <Dumbbell className="h-6 w-6" />
            <span className="font-bold text-lg">Minimum Viability</span>
          </Link>

          <div className="flex items-center space-x-1">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/milestones">
                <Trophy className="h-4 w-4 mr-2" />
                Milestones
              </Link>
            </Button>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/settings">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Link>
            </Button>
            <NotificationBell />
            <Button variant="ghost" size="sm" onClick={() => signOut()}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>
    </nav>
  )
}
