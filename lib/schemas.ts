import { z } from 'zod'

/**
 * Validation schemas for API requests
 * Ensures type safety and prevents malformed data from reaching the database
 */

// Module (Habit) schemas
export const createModuleSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(100, 'Title must be 100 characters or less')
    .trim(),
  description: z
    .string()
    .max(500, 'Description must be 500 characters or less')
    .trim()
    .optional()
    .nullable(),
})

export const updateModuleSchema = z.object({
  id: z.string().uuid('Invalid module ID'),
  title: z
    .string()
    .min(1, 'Title is required')
    .max(100, 'Title must be 100 characters or less')
    .trim(),
  description: z
    .string()
    .max(500, 'Description must be 500 characters or less')
    .trim()
    .optional()
    .nullable(),
})

export const deleteModuleSchema = z.object({
  id: z.string().uuid('Invalid module ID'),
})

// User preferences schemas
export const updatePreferencesSchema = z.object({
  weekly_target: z
    .number()
    .int('Weekly target must be a whole number')
    .min(1, 'Weekly target must be at least 1')
    .max(7, 'Weekly target cannot exceed 7'),
})

// Workout schema (minimal - user comes from auth)
export const logWorkoutSchema = z.object({
  userId: z.string().uuid().optional(), // Optional since we get from auth
})

// Helper function for validation with clear error messages
export function validateRequest<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; error: string } {
  try {
    const validated = schema.parse(data)
    return { success: true, data: validated }
  } catch (error) {
    if (error instanceof z.ZodError) {
      // Format validation errors into a readable message
      const errors = error.errors.map((e) => {
        const path = e.path.length > 0 ? `${e.path.join('.')}: ` : ''
        return `${path}${e.message}`
      })
      return {
        success: false,
        error: errors.join(', '),
      }
    }
    return { success: false, error: 'Validation failed' }
  }
}

// Type exports for use in API routes
export type CreateModuleInput = z.infer<typeof createModuleSchema>
export type UpdateModuleInput = z.infer<typeof updateModuleSchema>
export type DeleteModuleInput = z.infer<typeof deleteModuleSchema>
export type UpdatePreferencesInput = z.infer<typeof updatePreferencesSchema>
export type LogWorkoutInput = z.infer<typeof logWorkoutSchema>
