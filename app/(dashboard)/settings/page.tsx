'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/useAuth'
import { toast } from 'sonner'

export default function SettingsPage() {
  const { user } = useAuth()
  const [weeklyTarget, setWeeklyTarget] = useState(4)
  const [saving, setSaving] = useState(false)

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

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">
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
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="pt-6">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> Some settings changes may affect both you
              and your partner. Coordinate with your workout partner before
              making significant changes.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
