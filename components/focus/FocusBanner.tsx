'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { useFocus } from '@/hooks/useFocus'
import { Target, Edit2 } from 'lucide-react'

export function FocusBanner() {
  const { focus, isLoading, updateFocus, isUpdating } = useFocus()
  const [newFocus, setNewFocus] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)

  const handleUpdate = () => {
    if (newFocus.trim()) {
      updateFocus(newFocus)
      setDialogOpen(false)
      setNewFocus('')
    }
  }

  if (isLoading) {
    return null
  }

  return (
    <Card className="border-zinc-800 bg-gradient-to-r from-blue-500/10 to-purple-500/10">
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3 flex-1">
            <div className="mt-1">
              <Target className="h-5 w-5 text-blue-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-medium text-zinc-400 mb-1">
                Minimum Viability Focus
              </h3>
              <p className="text-lg font-semibold text-white">
                {focus}
              </p>
              <p className="text-xs text-zinc-500 mt-1">
                Shared goal for both partners
              </p>
            </div>
          </div>

          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="text-zinc-400 hover:text-white"
                onClick={() => setNewFocus(focus)}
              >
                <Edit2 className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-zinc-900 border-zinc-800">
              <DialogHeader>
                <DialogTitle className="text-white">Update Focus</DialogTitle>
                <DialogDescription className="text-zinc-400">
                  Set the current minimum viability goal. This will be visible to both you and your partner.
                  You can increase the difficulty over time as you progress.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="focus" className="text-white">
                    Current Focus
                  </Label>
                  <Input
                    id="focus"
                    value={newFocus}
                    onChange={(e) => setNewFocus(e.target.value)}
                    placeholder="e.g., 4 workouts per week"
                    className="bg-zinc-800 border-zinc-700 text-white"
                  />
                  <p className="text-xs text-zinc-500">
                    Examples: "4 workouts per week", "30 min daily movement", "5 strength sessions per week"
                  </p>
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="ghost"
                  onClick={() => setDialogOpen(false)}
                  className="text-zinc-400 hover:text-white"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleUpdate}
                  disabled={!newFocus.trim() || isUpdating}
                  className="bg-white text-black hover:bg-zinc-100"
                >
                  {isUpdating ? 'Updating...' : 'Update Focus'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardContent>
    </Card>
  )
}
