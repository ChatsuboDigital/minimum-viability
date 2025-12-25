'use client'

import { Activity, LogOut, Trophy, Settings, Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { useAuth } from '@/hooks/useAuth'
import { NotificationBell } from '@/components/notifications/NotificationBell'
import { useRealtimeWorkouts } from '@/hooks/useRealtimeWorkouts'
import Link from 'next/link'
import { useState } from 'react'

export function Navbar() {
  const { signOut, user } = useAuth()
  const [open, setOpen] = useState(false)

  // Subscribe to real-time updates
  useRealtimeWorkouts(user?.id)

  return (
    <nav className="border-b border-zinc-800 bg-black sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo - centered on mobile */}
          <Link href="/dashboard" className="flex items-center space-x-2 flex-1 sm:flex-none justify-center sm:justify-start">
            <div className="w-8 h-8 bg-white rounded-md flex items-center justify-center flex-shrink-0">
              <Activity className="h-5 w-5 text-black" />
            </div>
            <span className="font-semibold text-lg tracking-tight whitespace-nowrap">Minimum Viability</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
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

          {/* Mobile Menu */}
          <div className="md:hidden flex items-center space-x-2">
            <NotificationBell />
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="bg-black border-zinc-800">
                <SheetHeader>
                  <SheetTitle className="text-white">Menu</SheetTitle>
                </SheetHeader>
                <div className="flex flex-col space-y-4 mt-8">
                  <Button
                    variant="ghost"
                    className="justify-start"
                    asChild
                    onClick={() => setOpen(false)}
                  >
                    <Link href="/milestones">
                      <Trophy className="h-4 w-4 mr-2" />
                      Milestones
                    </Link>
                  </Button>
                  <Button
                    variant="ghost"
                    className="justify-start"
                    asChild
                    onClick={() => setOpen(false)}
                  >
                    <Link href="/settings">
                      <Settings className="h-4 w-4 mr-2" />
                      Settings
                    </Link>
                  </Button>
                  <div className="border-t border-zinc-800 pt-4">
                    <Button
                      variant="ghost"
                      className="justify-start w-full"
                      onClick={() => {
                        setOpen(false)
                        signOut()
                      }}
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Logout
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  )
}
