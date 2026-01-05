'use client'

import { useEffect } from 'react'

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

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl aspect-video flex items-center justify-center">
        {/* Super Saiyan GIF */}
        <img
          src="https://media3.giphy.com/media/v1.Y2lkPTc5MGI3NjExNDU1amhydWJyaHVleWlmdmhpYTkyNG1hMDZocnA0cm90dGF3MzR0NSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/WN16kBTKVAEuI/giphy.gif"
          alt="Super Saiyan transformation"
          className="w-full h-full object-contain"
        />

        {/* Overlay text */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center space-y-6 drop-shadow-[0_0_30px_rgba(0,0,0,1)]">
            <h2 className="text-8xl font-black text-white animate-pulse tracking-widest">
              LOCKED IN
            </h2>
            <p className="text-4xl text-yellow-300 font-bold animate-pulse">
              ⚡ Power level: MAXIMUM ⚡
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
