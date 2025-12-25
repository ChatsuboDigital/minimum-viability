import { NextResponse } from 'next/server'
import { z } from 'zod'
import { logger } from './logger'

/**
 * Standardized API error handling
 * Prevents leaking sensitive database details to clients
 */

export function handleApiError(error: unknown, context: string): NextResponse {
  // Log the full error server-side for debugging
  logger.error(`${context}:`, error)

  // Validation errors - return specific message
  if (error instanceof z.ZodError) {
    const zodError = error as z.ZodError
    const errorMessages = zodError.issues
      .map((e: z.ZodIssue) => `${e.path.join('.')}: ${e.message}`)
      .join(', ')
    return NextResponse.json(
      { error: `Validation error: ${errorMessages}` },
      { status: 400 }
    )
  }

  // Known error with message property
  if (error instanceof Error) {
    // Check for specific error types we want to expose
    if (error.message.includes('already logged')) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    if (error.message.includes('Unauthorized') || error.message.includes('Not authenticated')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (error.message.includes('not found') || error.message.includes('Not found')) {
      return NextResponse.json({ error: 'Resource not found' }, { status: 404 })
    }

    // Generic error - don't expose details
    return NextResponse.json(
      { error: 'An error occurred. Please try again.' },
      { status: 500 }
    )
  }

  // Unknown error type
  return NextResponse.json(
    { error: 'An unexpected error occurred. Please try again.' },
    { status: 500 }
  )
}

/**
 * Handle authentication errors
 */
export function handleAuthError(): NextResponse {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
}

/**
 * Handle validation errors with custom message
 */
export function handleValidationError(message: string): NextResponse {
  return NextResponse.json({ error: message }, { status: 400 })
}

/**
 * Handle success responses consistently
 */
export function handleSuccess<T>(data: T, status = 200): NextResponse {
  return NextResponse.json(data, { status })
}
