import { differenceInDays, startOfDay } from 'date-fns'
import { POINTS, MILESTONES, MILESTONE_TYPES } from './constants'

export interface StreakUpdate {
  currentStreak: number
  streakBroken: boolean
  bonusPoints: number
}

/**
 * Calculate updated streak based on last session date
 * Grace period: 1 rest day allowed (2 days since last session)
 * Streak breaks if 3+ days since last session
 *
 * @param lastWorkoutDate - Last workout date from database
 * @param currentStreak - Current streak count
 * @param todayDate - Today's date (should be in Sydney timezone from server)
 */
export function calculateStreakUpdate(
  lastWorkoutDate: Date | null,
  currentStreak: number,
  todayDate: Date = new Date() // Default for backwards compatibility, but should always pass explicitly
): StreakUpdate {
  const today = startOfDay(todayDate)

  // First session ever
  if (!lastWorkoutDate) {
    return {
      currentStreak: 1,
      streakBroken: false,
      bonusPoints: 0,
    }
  }

  const lastWorkout = startOfDay(new Date(lastWorkoutDate))
  const daysSinceLastWorkout = differenceInDays(today, lastWorkout)

  // Same day - no change
  if (daysSinceLastWorkout === 0) {
    return {
      currentStreak,
      streakBroken: false,
      bonusPoints: 0,
    }
  }

  // Continue streak (1 day apart)
  if (daysSinceLastWorkout === 1) {
    const newStreak = currentStreak + 1
    let bonusPoints = 0

    // Award streak bonuses
    if (newStreak % 7 === 0) {
      bonusPoints += POINTS.SEVEN_DAY_STREAK_BONUS
    }
    if (newStreak === 30) {
      bonusPoints += POINTS.THIRTY_DAY_STREAK_BONUS
    }

    return {
      currentStreak: newStreak,
      streakBroken: false,
      bonusPoints,
    }
  }

  // Grace period (2 days apart - maintain streak)
  if (daysSinceLastWorkout === 2) {
    return {
      currentStreak,
      streakBroken: false,
      bonusPoints: 0,
    }
  }

  // Streak broken (3+ days apart)
  return {
    currentStreak: 1,
    streakBroken: true,
    bonusPoints: 0,
  }
}

/**
 * Calculate total points for a session
 */
export function calculateWorkoutPoints(
  isWeeklyGoalComplete: boolean,
  streakBonusPoints: number
): number {
  let points = POINTS.BASE_SESSION

  if (isWeeklyGoalComplete) {
    points += POINTS.WEEKLY_GOAL_BONUS
  }

  points += streakBonusPoints

  return points
}

/**
 * Check if a milestone has been achieved
 */
export function checkMilestoneAchieved(
  milestoneType: string,
  currentValue: number,
  achievedMilestones: number[]
): number | null {
  let milestoneValues: readonly number[]

  switch (milestoneType) {
    case MILESTONE_TYPES.TOTAL_SESSIONS:
      milestoneValues = MILESTONES.TOTAL_SESSIONS
      break
    case MILESTONE_TYPES.STREAK:
      milestoneValues = MILESTONES.STREAKS
      break
    case MILESTONE_TYPES.WEEKLY_GOAL:
      milestoneValues = MILESTONES.WEEKLY_GOALS
      break
    default:
      return null
  }

  // Find the highest milestone achieved at this value
  for (const milestone of milestoneValues) {
    if (currentValue === milestone && !achievedMilestones.includes(milestone)) {
      return milestone
    }
  }

  return null
}

/**
 * Get the next milestone for a given type
 */
export function getNextMilestone(
  milestoneType: string,
  currentValue: number
): number | null {
  let milestoneValues: readonly number[]

  switch (milestoneType) {
    case MILESTONE_TYPES.TOTAL_SESSIONS:
      milestoneValues = MILESTONES.TOTAL_SESSIONS
      break
    case MILESTONE_TYPES.STREAK:
      milestoneValues = MILESTONES.STREAKS
      break
    case MILESTONE_TYPES.WEEKLY_GOAL:
      milestoneValues = MILESTONES.WEEKLY_GOALS
      break
    default:
      return null
  }

  for (const milestone of milestoneValues) {
    if (milestone > currentValue) {
      return milestone
    }
  }

  return null
}

/**
 * Calculate progress percentage to next milestone
 */
export function getMilestoneProgress(
  milestoneType: string,
  currentValue: number
): { current: number; next: number | null; progress: number } {
  const next = getNextMilestone(milestoneType, currentValue)

  if (!next) {
    return { current: currentValue, next: null, progress: 100 }
  }

  const progress = Math.min((currentValue / next) * 100, 100)

  return { current: currentValue, next, progress }
}
