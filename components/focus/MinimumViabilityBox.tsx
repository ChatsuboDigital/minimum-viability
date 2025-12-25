'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
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
import { useModules } from '@/hooks/useModules'
import { Target, Plus, X } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'

export function MinimumViabilityBox() {
  const { modules, isLoading, addModule, updateModule, deleteModule, isAdding, isUpdating } = useModules()
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [newModule, setNewModule] = useState({ title: '', description: '' })
  const [editingModule, setEditingModule] = useState<{ id: string; title: string; description: string } | null>(null)

  const handleAdd = () => {
    if (newModule.title.trim()) {
      addModule(newModule)
      setAddDialogOpen(false)
      setNewModule({ title: '', description: '' })
    }
  }

  const handleEdit = () => {
    if (editingModule && editingModule.title.trim()) {
      updateModule({
        id: editingModule.id,
        title: editingModule.title,
        description: editingModule.description,
      })
      setEditDialogOpen(false)
      setEditingModule(null)
    }
  }

  const openEditDialog = (module: any) => {
    setEditingModule({
      id: module.id,
      title: module.title,
      description: module.description || '',
    })
    setEditDialogOpen(true)
  }

  if (isLoading) {
    return (
      <Card className="border-zinc-800 bg-zinc-900/50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Target className="h-5 w-5 text-zinc-400" />
              <Skeleton className="h-6 w-48" />
            </div>
            <Skeleton className="h-9 w-32" />
          </div>
          <Skeleton className="h-4 w-64 mt-1" />
        </CardHeader>
        <CardContent className="space-y-2">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-zinc-800 bg-zinc-900/50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Target className="h-5 w-5 text-zinc-400" />
            <CardTitle className="text-lg">Minimum Viability Modules</CardTitle>
          </div>
          <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
            <DialogTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="text-zinc-400 hover:text-white"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Module
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-zinc-900 border-zinc-800">
              <DialogHeader>
                <DialogTitle className="text-white">Add Habit Module</DialogTitle>
                <DialogDescription className="text-zinc-400">
                  Add a new habit to your minimum viability stack. Both you and your partner will see this.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-white">
                    Habit <span className="text-red-400">*</span>
                  </Label>
                  <Input
                    id="title"
                    value={newModule.title}
                    onChange={(e) => setNewModule({ ...newModule, title: e.target.value })}
                    placeholder="e.g., 10 push-ups"
                    className="bg-zinc-800 border-zinc-700 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description" className="text-white">
                    Details (optional)
                  </Label>
                  <Textarea
                    id="description"
                    value={newModule.description}
                    onChange={(e) => setNewModule({ ...newModule, description: e.target.value })}
                    placeholder="Add any extra details..."
                    className="bg-zinc-800 border-zinc-700 text-white resize-none"
                    rows={2}
                  />
                </div>
                <p className="text-xs text-zinc-500">
                  Examples: "10 push-ups", "Read 10 pages", "5 min meditation", "Drink 2L water"
                </p>
              </div>
              <DialogFooter>
                <Button
                  variant="ghost"
                  onClick={() => {
                    setAddDialogOpen(false)
                    setNewModule({ title: '', description: '' })
                  }}
                  className="text-zinc-400 hover:text-white"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleAdd}
                  disabled={!newModule.title.trim() || isAdding}
                  className="bg-white text-black hover:bg-zinc-100"
                >
                  {isAdding ? 'Adding...' : 'Add Module'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Edit Dialog */}
          <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
            <DialogContent className="bg-zinc-900 border-zinc-800">
              <DialogHeader>
                <DialogTitle className="text-white">Edit Habit Module</DialogTitle>
                <DialogDescription className="text-zinc-400">
                  Update your habit and add details like specific exercises or tasks.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-title" className="text-white">
                    Habit <span className="text-red-400">*</span>
                  </Label>
                  <Input
                    id="edit-title"
                    value={editingModule?.title || ''}
                    onChange={(e) => setEditingModule(editingModule ? { ...editingModule, title: e.target.value } : null)}
                    placeholder="e.g., Workout"
                    className="bg-zinc-800 border-zinc-700 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-description" className="text-white">
                    Details
                  </Label>
                  <Textarea
                    id="edit-description"
                    value={editingModule?.description || ''}
                    onChange={(e) => setEditingModule(editingModule ? { ...editingModule, description: e.target.value } : null)}
                    placeholder="e.g., 10 push-ups, 10 sit-ups, 10 squats"
                    className="bg-zinc-800 border-zinc-700 text-white resize-none"
                    rows={4}
                  />
                  <p className="text-xs text-zinc-500">
                    Add specific details about what this habit includes
                  </p>
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="ghost"
                  onClick={() => {
                    setEditDialogOpen(false)
                    setEditingModule(null)
                  }}
                  className="text-zinc-400 hover:text-white"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleEdit}
                  disabled={!editingModule?.title.trim() || isUpdating}
                  className="bg-white text-black hover:bg-zinc-100"
                >
                  {isUpdating ? 'Saving...' : 'Save Changes'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
        <p className="text-xs text-zinc-500 mt-1">
          Complete all modules daily to maintain your streak
        </p>
      </CardHeader>
      <CardContent className="space-y-2">
        {modules.length === 0 ? (
          <div className="text-center py-8 text-zinc-500">
            <Target className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No modules yet. Add your first habit to get started!</p>
          </div>
        ) : (
          modules.map((module, index) => (
            <button
              key={module.id}
              type="button"
              className="group flex items-start justify-between p-3 rounded-lg bg-zinc-800/50 hover:bg-zinc-800 transition-colors cursor-pointer w-full text-left"
              onClick={() => openEditDialog(module)}
              aria-label={`Edit module: ${module.title}`}
            >
              <div className="flex items-start space-x-3 flex-1">
                <div className="mt-0.5 text-zinc-500 text-sm font-mono">
                  {(index + 1).toString().padStart(2, '0')}
                </div>
                <div className="flex-1">
                  <p className="text-white font-medium">{module.title}</p>
                  {module.description && (
                    <p className="text-xs text-zinc-500 mt-1 whitespace-pre-wrap">{module.description}</p>
                  )}
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation()
                  deleteModule(module.id)
                }}
                className="opacity-0 group-hover:opacity-100 transition-opacity text-zinc-500 hover:text-red-400 h-8 w-8 p-0"
                aria-label={`Delete module: ${module.title}`}
              >
                <X className="h-4 w-4" />
              </Button>
            </button>
          ))
        )}
      </CardContent>
    </Card>
  )
}
