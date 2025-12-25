'use client'

import { Activity, LogOut, Trophy, Settings } from 'lucide-react'
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
    <nav className="border-b border-zinc-800 bg-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/dashboard" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-white rounded-md flex items-center justify-center">
              <Activity className="h-5 w-5 text-black" />
            </div>
            <span className="font-semibold text-lg tracking-tight">Minimum Viability</span>
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
