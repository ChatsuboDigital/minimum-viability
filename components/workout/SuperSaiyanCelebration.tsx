'use client'

import { useEffect } from 'react'
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog'

interface SuperSaiyanCelebrationProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SuperSaiyanCelebration({
  open,
  onOpenChange,
}: SuperSaiyanCelebrationProps) {
  useEffect(() => {
    if (open) {
      // Auto-close after 3 seconds
      const timer = setTimeout(() => {
        onOpenChange(false)
      }, 3000)

      return () => clearTimeout(timer)
    }
  }, [open, onOpenChange])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl border-0 bg-transparent shadow-none p-0 overflow-hidden">
        <div className="relative w-full aspect-video flex items-center justify-center">
          {/* Super Saiyan GIF */}
          <img
            src="https://media3.giphy.com/media/v1.Y2lkPTc5MGI3NjExNDU1amhydWJyaHVleWlmdmhpYTkyNG1hMDZocnA0cm90dGF3MzR0NSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/WN16kBTKVAEuI/giphy.gif"
            alt="Super Saiyan transformation"
            className="w-full h-full object-contain rounded-lg"
          />

          {/* Overlay text */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center space-y-2 drop-shadow-2xl">
              <h2 className="text-6xl font-bold text-white animate-pulse">
                LOCKED IN
              </h2>
              <p className="text-2xl text-yellow-400 font-semibold">
                Power level: MAXIMUM
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
