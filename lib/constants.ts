// Points System
export const POINTS = {
  BASE_SESSION: 10,
  WEEKLY_GOAL_BONUS: 50,
  SEVEN_DAY_STREAK_BONUS: 25,
  THIRTY_DAY_STREAK_BONUS: 100,
} as const

// Milestone Definitions
export const MILESTONES = {
  TOTAL_SESSIONS: [10, 25, 50, 100, 250],
  STREAKS: [7, 14, 30, 60, 100],
  WEEKLY_GOALS: [4, 8, 12, 26],
} as const

// Default Weekly Goal
export const DEFAULT_WEEKLY_TARGET = 4

// Notification Types
export const NOTIFICATION_TYPES = {
  PARTNER_COMPLETED: 'partner_completed',
  PARTNER_AHEAD: 'partner_ahead',
  PARTNER_BEHIND: 'partner_behind',
  MILESTONE_ACHIEVED: 'milestone_achieved',
  STREAK_AT_RISK: 'streak_at_risk',
} as const

// Milestone Types
export const MILESTONE_TYPES = {
  TOTAL_SESSIONS: 'total_sessions',
  STREAK: 'streak',
  WEEKLY_GOAL: 'weekly_goal',
} as const
