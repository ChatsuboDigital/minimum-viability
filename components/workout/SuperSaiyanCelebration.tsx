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
      // Auto-close after 5 seconds
      const timer = setTimeout(() => {
        onOpenChange(false)
      }, 5000)

      return () => clearTimeout(timer)
    }
  }, [open, onOpenChange])

  return (
    <Dialog open={open} onOpenChange={onOpenChange} modal={true}>
      <DialogContent
        className="max-w-3xl border-0 bg-black/90 shadow-none p-0 overflow-hidden [&>button]:hidden"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <div className="relative w-full aspect-video flex items-center justify-center bg-black">
          {/* Super Saiyan GIF */}
          <img
            src="https://media3.giphy.com/media/v1.Y2lkPTc5MGI3NjExNDU1amhydWJyaHVleWlmdmhpYTkyNG1hMDZocnA0cm90dGF3MzR0NSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/WN16kBTKVAEuI/giphy.gif"
            alt="Super Saiyan transformation"
            className="w-full h-full object-cover rounded-lg"
            loading="eager"
          />

          {/* Overlay text */}
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-t from-black/50 to-transparent">
            <div className="text-center space-y-4 drop-shadow-[0_0_20px_rgba(0,0,0,0.9)]">
              <h2 className="text-7xl font-black text-white animate-pulse tracking-wider">
                LOCKED IN
              </h2>
              <p className="text-3xl text-yellow-400 font-bold animate-pulse">
                Power level: MAXIMUM
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
