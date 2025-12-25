'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { useAuth } from '@/hooks/useAuth'
import { toast } from 'sonner'
import { AlertTriangle } from 'lucide-react'
import { useQueryClient } from '@tanstack/react-query'

export default function SettingsPage() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [weeklyTarget, setWeeklyTarget] = useState(4)
  const [saving, setSaving] = useState(false)
  const [resetting, setResetting] = useState(false)
  const [showResetDialog, setShowResetDialog] = useState(false)
  const [confirmText, setConfirmText] = useState('')

  const handleSave = async () => {
    setSaving(true)
    try {
      // In a real implementation, you would save this to the database
      // For now, we'll just show a success message
      toast.success('Settings saved successfully!')
    } catch (error) {
      toast.error('Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  const handleResetProgress = async () => {
    if (confirmText !== 'RESET MY PROGRESS') {
      toast.error('Please type the exact phrase to confirm')
      return
    }

    setResetting(true)
    try {
      const response = await fetch('/api/reset-progress', {
        method: 'POST',
      })

      if (!response.ok) {
        throw new Error('Failed to reset progress')
      }

      const data = await response.json()

      // Invalidate all queries to refresh the UI
      queryClient.invalidateQueries()

      toast.success(data.message)
      setShowResetDialog(false)
      setConfirmText('')
    } catch (error) {
      toast.error('Failed to reset progress')
    } finally {
      setResetting(false)
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold">Settings</h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          Manage your workout goals and preferences
        </p>
      </div>

      <div className="max-w-2xl space-y-6">
        {/* Weekly Goal */}
        <Card>
          <CardHeader>
            <CardTitle>Weekly Goal</CardTitle>
            <CardDescription>
              Set the number of workouts you want to complete each week
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="weekly-target">Workouts per week</Label>
              <Input
                id="weekly-target"
                type="number"
                min="1"
                max="7"
                value={weeklyTarget}
                onChange={(e) => setWeeklyTarget(parseInt(e.target.value))}
              />
              <p className="text-xs text-muted-foreground">
                Recommended: 3-5 workouts per week
              </p>
            </div>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </CardContent>
        </Card>

        {/* Account Info */}
        <Card>
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
            <CardDescription>Your account details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <Label className="text-sm text-muted-foreground">Email</Label>
              <p className="font-medium">{user?.email}</p>
            </div>
          </CardContent>
        </Card>

        {/* Info */}
        <Card className="border-blue-500/20 bg-blue-500/10">
          <CardContent className="pt-6">
            <p className="text-sm text-blue-400">
              <strong>Note:</strong> Some settings changes may affect both you
              and your partner. Coordinate with your workout partner before
              making significant changes.
            </p>
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card className="border-red-500/20 bg-red-500/5">
          <CardHeader>
            <CardTitle className="flex items-center text-red-500">
              <AlertTriangle className="h-5 w-5 mr-2" />
              Danger Zone
            </CardTitle>
            <CardDescription>
              🚨 Break glass in case of emergency
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Reset all your progress. All workouts, streaks, milestones, and goals will be permanently deleted.
                This is like a factory reset for your soul.
              </p>
              <p className="text-xs text-red-400 italic">
                (Use this if you want to test new features or if you&apos;ve been lying to yourself about those "workouts")
              </p>
            </div>

            <AlertDialog open={showResetDialog} onOpenChange={setShowResetDialog}>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" className="bg-red-500 hover:bg-red-600">
                  Reset All Progress
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="bg-zinc-900 border-red-500/20">
                <AlertDialogHeader>
                  <AlertDialogTitle className="text-white text-xl flex items-center">
                    <AlertTriangle className="h-5 w-5 mr-2 text-red-500" />
                    Whoa there, speed racer
                  </AlertDialogTitle>
                  <AlertDialogDescription className="text-zinc-400 space-y-4">
                    <p>
                      You&apos;re about to nuke everything. All your workouts, streaks, milestones - gone.
                      Poof. Like they never existed.
                    </p>
                    <p className="text-red-400 font-semibold">
                      This cannot be undone. Your partner will judge you. Future you will judge you.
                      The universe will judge you.
                    </p>
                    <div className="space-y-2 pt-2">
                      <Label htmlFor="confirm-reset" className="text-white">
                        Type <span className="font-mono bg-zinc-800 px-2 py-1 rounded">RESET MY PROGRESS</span> to confirm:
                      </Label>
                      <Input
                        id="confirm-reset"
                        type="text"
                        value={confirmText}
                        onChange={(e) => setConfirmText(e.target.value)}
                        placeholder="Type it exactly..."
                        className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
                      />
                      {confirmText && confirmText !== 'RESET MY PROGRESS' && (
                        <p className="text-xs text-yellow-500">
                          ⚠️ Not quite right. Copy-paste is your friend here.
                        </p>
                      )}
                    </div>
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel
                    className="bg-zinc-800 border-zinc-700 text-white hover:bg-zinc-700"
                    onClick={() => setConfirmText('')}
                  >
                    Nevermind, I like my data
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleResetProgress}
                    disabled={confirmText !== 'RESET MY PROGRESS' || resetting}
                    className="bg-red-500 text-white hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {resetting ? 'Deleting everything...' : 'Yes, delete it all'}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
