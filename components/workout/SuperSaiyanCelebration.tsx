'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

interface SuperSaiyanCelebrationProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SuperSaiyanCelebration({
  open,
  onOpenChange,
}: SuperSaiyanCelebrationProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    return () => setMounted(false)
  }, [])

  useEffect(() => {
    if (open) {
      console.log('🔥 SUPER SAIYAN CELEBRATION TRIGGERED!')
      document.body.style.overflow = 'hidden'

      // Auto-close after 5 seconds
      const timer = setTimeout(() => {
        console.log('🔥 Closing celebration')
        onOpenChange(false)
      }, 5000)

      return () => {
        clearTimeout(timer)
        document.body.style.overflow = 'unset'
      }
    }
  }, [open, onOpenChange])

  if (!open || !mounted) return null

  return createPortal(
    <div
      className="fixed inset-0 flex items-center justify-center bg-black"
      style={{
        zIndex: 99999,
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
      }}
    >
      <div className="relative w-full h-full max-w-6xl flex items-center justify-center p-4">
        {/* Super Saiyan GIF - Using direct Giphy URL */}
        <img
          src="https://media.giphy.com/media/WN16kBTKVAEuI/giphy.gif"
          alt="Super Saiyan transformation"
          className="w-full h-full object-contain"
          style={{ maxHeight: '90vh' }}
          onLoad={() => console.log('🔥 GIF loaded!')}
          onError={(e) => console.error('🔥 GIF failed to load:', e)}
        />

        {/* Overlay text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <div className="text-center space-y-8">
            <h2
              className="font-black text-white animate-pulse tracking-widest"
              style={{
                fontSize: 'clamp(3rem, 15vw, 10rem)',
                textShadow: '0 0 40px rgba(0,0,0,1), 0 0 20px rgba(255,215,0,0.5)'
              }}
            >
              LOCKED IN
            </h2>
            <p
              className="text-yellow-300 font-bold animate-pulse"
              style={{
                fontSize: 'clamp(1.5rem, 5vw, 4rem)',
                textShadow: '0 0 20px rgba(0,0,0,1)'
              }}
            >
              ⚡ Power level: MAXIMUM ⚡
            </p>
          </div>
        </div>
      </div>
    </div>,
    document.body
  )
}
