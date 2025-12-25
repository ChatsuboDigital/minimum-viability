'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { AlertTriangle } from 'lucide-react'
import { logger } from '@/lib/logger'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log error to console in development
    logger.error('Root error boundary caught:', error)
  }, [error])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-950 px-4">
      <div className="max-w-md text-center space-y-6">
        <div className="flex justify-center">
          <div className="rounded-full bg-red-500/10 p-4">
            <AlertTriangle className="h-10 w-10 text-red-500" />
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-white">Something went wrong</h1>
          <p className="text-zinc-400">
            Don't worry, your data is safe. This error has been logged.
          </p>
        </div>

        <div className="space-y-3">
          <Button
            onClick={reset}
            className="w-full bg-white text-black hover:bg-zinc-100"
          >
            Try again
          </Button>

          <Button
            onClick={() => window.location.href = '/dashboard'}
            variant="ghost"
            className="w-full text-zinc-400 hover:text-white"
          >
            Go to dashboard
          </Button>
        </div>

        {process.env.NODE_ENV === 'development' && (
          <details className="mt-6 text-left">
            <summary className="cursor-pointer text-sm text-zinc-500 hover:text-zinc-400">
              Error details (dev only)
            </summary>
            <pre className="mt-2 overflow-auto rounded-lg bg-zinc-900 p-4 text-xs text-red-400">
              {error.message}
              {error.stack && `\n\n${error.stack}`}
            </pre>
          </details>
        )}
      </div>
    </div>
  )
}
