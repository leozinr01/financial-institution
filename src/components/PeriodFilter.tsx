import { addMonths, monthEnd, monthKey, monthStart, todayISO } from '../lib/dates'
import type { Period } from '../types'

export type PeriodPreset = 'month' | 'last-month' | '3-months' | 'year' | 'custom'

export interface PeriodState {
  preset: PeriodPreset
  period: Period
}

export function presetPeriod(preset: Exclude<PeriodPreset, 'custom'>): Period {
  const month = monthKey(todayISO())
  switch (preset) {
    case 'month':
      return { from: monthStart(month), to: monthEnd(month) }
    case 'last-month': {
      const m = addMonths(month, -1)
      return { from: monthStart(m), to: monthEnd(m) }
    }
    case '3-months':
      return { from: monthStart(addMonths(month, -2)), to: monthEnd(month) }
    case 'year':
      return { from: `${month.slice(0, 4)}-01-01`, to: `${month.slice(0, 4)}-12-31` }
  }
}

export const defaultPeriodState = (): PeriodState => ({ preset: 'month', period: presetPeriod('month') })

export default function PeriodFilter({ value, onChange }: { value: PeriodState; onChange: (v: PeriodState) => void }) {
  const { preset, period } = value
  return (
    <div className="flex flex-wrap items-center gap-2">
      <select
        aria-label="Período"
        className="field h-10 w-auto min-w-[10rem] bg-card"
        value={preset}
        onChange={(e) => {
          const p = e.target.value as PeriodPreset
          onChange({ preset: p, period: p === 'custom' ? period : presetPeriod(p) })
        }}
      >
        <option value="month">Mês atual</option>
        <option value="last-month">Mês passado</option>
        <option value="3-months">Últimos 3 meses</option>
        <option value="year">Este ano</option>
        <option value="custom">Personalizado</option>
      </select>
      {preset === 'custom' && (
        <>
          <input
            type="date"
            aria-label="Data inicial"
            className="field h-10 w-auto bg-card"
            value={period.from}
            max={period.to}
            onChange={(e) => e.target.value && onChange({ preset, period: { ...period, from: e.target.value } })}
          />
          <span className="text-xs text-neutral-500">até</span>
          <input
            type="date"
            aria-label="Data final"
            className="field h-10 w-auto bg-card"
            value={period.to}
            min={period.from}
            onChange={(e) => e.target.value && onChange({ preset, period: { ...period, to: e.target.value } })}
          />
        </>
      )}
    </div>
  )
}
