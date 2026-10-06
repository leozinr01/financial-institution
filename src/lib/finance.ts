import type { Period, SavingsDeposit, Settings, Transaction } from '../types'
import {
  addDays, monthEnd, monthKey, monthsBetween, monthStart, todayISO, weekStartOf,
} from './dates'
import { round2 } from './format'

export function inPeriod<T extends { date: string }>(items: T[], period: Period): T[] {
  return items.filter((i) => i.date >= period.from && i.date <= period.to)
}

export function totals(transactions: Transaction[]) {
  let income = 0
  let expense = 0
  for (const t of transactions) {
    if (t.type === 'income') income += t.amount
    else expense += t.amount
  }
  return { income: round2(income), expense: round2(expense), result: round2(income - expense) }
}

export function sumDeposits(deposits: SavingsDeposit[]): number {
  return round2(deposits.reduce((s, d) => s + d.amount, 0))
}

/** Saldo disponível = saldo inicial + entradas - saídas - valores enviados à Reserva. */
export function availableBalance(
  settings: Settings,
  transactions: Transaction[],
  deposits: SavingsDeposit[],
): number {
  const t = totals(transactions)
  return round2(settings.initial_balance + t.result - sumDeposits(deposits))
}

/** Variação do saldo disponível por dia. */
function dailyDeltas(transactions: Transaction[], deposits: SavingsDeposit[]): Map<string, number> {
  const map = new Map<string, number>()
  for (const t of transactions) {
    map.set(t.date, (map.get(t.date) ?? 0) + (t.type === 'income' ? t.amount : -t.amount))
  }
  for (const d of deposits) {
    map.set(d.date, (map.get(d.date) ?? 0) - d.amount)
  }
  return map
}

export interface BalancePoint {
  date: string
  balance: number
}

/** Saldo disponível ao fim de cada dia do período. */
export function balanceSeries(
  settings: Settings,
  transactions: Transaction[],
  deposits: SavingsDeposit[],
  period: Period,
): BalancePoint[] {
  const deltas = dailyDeltas(transactions, deposits)
  let balance = settings.initial_balance
  for (const [date, delta] of deltas) if (date < period.from) balance += delta

  const points: BalancePoint[] = []
  for (let d = period.from; d <= period.to; d = addDays(d, 1)) {
    balance += deltas.get(d) ?? 0
    points.push({ date: d, balance: round2(balance) })
    if (points.length > 1100) break // proteção contra intervalos absurdos
  }
  return points
}

export interface MonthRow {
  month: string
  income: number
  expense: number
  saved: number
  result: number
  balance: number
}

/** Fluxo de caixa mês a mês, do primeiro lançamento até o mês atual. */
export function monthlyFlow(
  settings: Settings,
  transactions: Transaction[],
  deposits: SavingsDeposit[],
): MonthRow[] {
  const current = monthKey(todayISO())
  let first = current
  let last = current
  for (const i of [...transactions, ...deposits]) {
    const m = monthKey(i.date)
    if (m < first) first = m
    if (m > last) last = m
  }

  const rows = new Map<string, MonthRow>()
  for (const m of monthsBetween(first, last)) {
    rows.set(m, { month: m, income: 0, expense: 0, saved: 0, result: 0, balance: 0 })
  }
  for (const t of transactions) {
    const r = rows.get(monthKey(t.date))!
    if (t.type === 'income') r.income += t.amount
    else r.expense += t.amount
  }
  for (const d of deposits) rows.get(monthKey(d.date))!.saved += d.amount

  let balance = settings.initial_balance
  const out: MonthRow[] = []
  for (const r of rows.values()) {
    r.income = round2(r.income)
    r.expense = round2(r.expense)
    r.saved = round2(r.saved)
    r.result = round2(r.income - r.expense)
    balance = round2(balance + r.result - r.saved)
    r.balance = balance
    out.push(r)
  }
  return out
}

export interface DayRow {
  date: string
  income: number
  expense: number
  saved: number
  balance: number
}

/** Visão diária de um mês: só os dias com movimentação. */
export function dailyFlow(
  month: string,
  settings: Settings,
  transactions: Transaction[],
  deposits: SavingsDeposit[],
): { opening: number; days: DayRow[] } {
  const from = monthStart(month)
  const to = monthEnd(month)
  const series = balanceSeries(settings, transactions, deposits, { from, to })
  const opening = round2(
    settings.initial_balance +
      totals(transactions.filter((t) => t.date < from)).result -
      sumDeposits(deposits.filter((d) => d.date < from)),
  )

  const days = new Map<string, DayRow>()
  const get = (date: string) => {
    let r = days.get(date)
    if (!r) {
      r = { date, income: 0, expense: 0, saved: 0, balance: 0 }
      days.set(date, r)
    }
    return r
  }
  for (const t of transactions) {
    if (t.date < from || t.date > to) continue
    if (t.type === 'income') get(t.date).income += t.amount
    else get(t.date).expense += t.amount
  }
  for (const d of deposits) {
    if (d.date < from || d.date > to) continue
    get(d.date).saved += d.amount
  }
  const balanceByDate = new Map(series.map((p) => [p.date, p.balance]))
  const list = [...days.values()].sort((a, b) => a.date.localeCompare(b.date))
  for (const r of list) {
    r.income = round2(r.income)
    r.expense = round2(r.expense)
    r.saved = round2(r.saved)
    r.balance = balanceByDate.get(r.date) ?? 0
  }
  return { opening, days: list }
}

export interface WeekSummary {
  weekStart: string
  weekEnd: string
  goal: number
  saved: number
  hit: boolean
  isCurrent: boolean
}

/**
 * Resumo de cada semana (domingo a sábado), da primeira em que houve depósito até a atual.
 * A semana atual usa a meta das Configurações; as anteriores usam a meta que valia
 * quando o último depósito daquela semana foi feito.
 */
export function weeklySummaries(
  deposits: SavingsDeposit[],
  settings: Settings,
  today = todayISO(),
): WeekSummary[] {
  const currentWeek = weekStartOf(today)
  const byWeek = new Map<string, { saved: number; goal: number | null; lastDate: string }>()
  let first = currentWeek

  for (const d of deposits) {
    const w = weekStartOf(d.date)
    if (w < first) first = w
    const cur = byWeek.get(w) ?? { saved: 0, goal: null, lastDate: '' }
    cur.saved += d.amount
    if (d.date >= cur.lastDate) {
      cur.lastDate = d.date
      cur.goal = d.goal_snapshot
    }
    byWeek.set(w, cur)
  }

  const out: WeekSummary[] = []
  for (let w = first; w <= currentWeek; w = addDays(w, 7)) {
    const info = byWeek.get(w)
    const isCurrent = w === currentWeek
    const goal = isCurrent ? settings.weekly_goal : info?.goal ?? settings.weekly_goal
    const saved = round2(info?.saved ?? 0)
    out.push({
      weekStart: w,
      weekEnd: addDays(w, 6),
      goal,
      saved,
      hit: goal > 0 && saved >= goal,
      isCurrent,
    })
  }
  return out
}

/** Semanas seguidas batendo a meta. A semana atual, ainda em andamento, não quebra a sequência. */
export function goalStreak(weeks: WeekSummary[]): number {
  let streak = 0
  for (let i = weeks.length - 1; i >= 0; i--) {
    const w = weeks[i]
    if (w.hit) streak++
    else if (w.isCurrent) continue
    else break
  }
  return streak
}
