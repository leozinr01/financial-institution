import type { SavingsDeposit, Settings } from '../types'
import { todayISO, weekDays, weekStartOf } from './dates'
import { round2 } from './format'

export interface WeekDayStatus {
  date: string
  deposit: SavingsDeposit | undefined
  isToday: boolean
  isPast: boolean
  isFuture: boolean
}

export interface WeekStatus {
  weekStart: string
  weekEnd: string
  days: WeekDayStatus[]
  goal: number
  saved: number
  remaining: number
  percent: number
  hit: boolean
  /** Dias de hoje até sábado que ainda não foram marcados. */
  daysLeft: number
  /** Quanto guardar por dia nos dias restantes para bater a meta. */
  suggestion: number
}

/** Situação da semana atual (domingo a sábado). */
export function currentWeekStatus(
  deposits: SavingsDeposit[],
  settings: Settings,
  today = todayISO(),
): WeekStatus {
  const weekStart = weekStartOf(today)
  const dates = weekDays(weekStart)
  const byDate = new Map(deposits.map((d) => [d.date, d]))

  const days = dates.map<WeekDayStatus>((date) => ({
    date,
    deposit: byDate.get(date),
    isToday: date === today,
    isPast: date < today,
    isFuture: date > today,
  }))

  const goal = settings.weekly_goal
  const saved = round2(days.reduce((s, d) => s + (d.deposit?.amount ?? 0), 0))
  const remaining = round2(Math.max(0, goal - saved))
  const daysLeft = days.filter((d) => !d.isPast && !d.deposit).length
  // Arredonda para cima nos centavos, para a soma dos dias nunca ficar abaixo da meta.
  const suggestion = daysLeft > 0 ? Math.ceil(round2((remaining / daysLeft) * 100)) / 100 : 0

  return {
    weekStart,
    weekEnd: dates[6],
    days,
    goal,
    saved,
    remaining,
    percent: goal > 0 ? Math.min(100, Math.round((saved / goal) * 100)) : 0,
    hit: goal > 0 && saved >= goal,
    daysLeft,
    suggestion,
  }
}
