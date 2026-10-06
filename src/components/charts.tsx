import { formatBRL } from '../lib/format'

export const AXIS = {
  stroke: '#525252',
  tick: { fill: '#737373', fontSize: 11 },
  tickLine: false,
  axisLine: false,
} as const

export const GRID = { stroke: '#1f1f1f', vertical: false } as const

interface TooltipEntry {
  name?: string | number
  value?: number | string | Array<number | string>
  color?: string
  payload?: { fill?: string }
}

/** Tooltip escuro compartilhado por todos os gráficos. */
export function ChartTooltip({
  active, payload, label, labelFormatter,
}: {
  active?: boolean
  payload?: TooltipEntry[]
  label?: string | number
  labelFormatter?: (label: string) => string
}) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-xl border border-line bg-bg px-3 py-2 text-xs shadow-xl shadow-black">
      {label !== undefined && label !== '' && (
        <p className="mb-1 text-neutral-500">{labelFormatter ? labelFormatter(String(label)) : label}</p>
      )}
      {payload.map((entry, i) => (
        <p key={i} className="flex items-center gap-2 text-neutral-100">
          <span className="h-2 w-2 rounded-full" style={{ background: entry.color ?? entry.payload?.fill }} />
          <span className="text-neutral-400">{entry.name}</span>
          <span className="ml-auto pl-3 font-medium">{formatBRL(Number(entry.value))}</span>
        </p>
      ))}
    </div>
  )
}
