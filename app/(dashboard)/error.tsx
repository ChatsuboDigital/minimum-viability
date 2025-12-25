'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { AlertTriangle, Home, RefreshCw } from 'lucide-react'
import { logger } from '@/lib/logger'

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    logger.error('Dashboard error boundary caught:', error)
  }, [error])

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950 px-4">
      <Card className="max-w-lg border-red-500/20 bg-zinc-900/50">
        <CardContent className="pt-6 space-y-6">
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="rounded-full bg-red-500/10 p-3">
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-bold text-white">
                Oops! Something broke
              </h2>
              <p className="text-sm text-zinc-400">
                The dashboard hit a snag, but your workout data is safe.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Button
              onClick={reset}
              className="w-full bg-white text-black hover:bg-zinc-100"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Try again
            </Button>

            <Button
              onClick={() => window.location.href = '/dashboard'}
              variant="ghost"
              className="w-full text-zinc-400 hover:text-white"
            >
              <Home className="h-4 w-4 mr-2" />
              Refresh dashboard
            </Button>
          </div>

          {process.env.NODE_ENV === 'development' && (
            <details className="text-left">
              <summary className="cursor-pointer text-xs text-zinc-500 hover:text-zinc-400">
                Technical details
              </summary>
              <pre className="mt-2 overflow-auto rounded bg-zinc-800 p-3 text-xs text-red-400">
                {error.message}
              </pre>
            </details>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
