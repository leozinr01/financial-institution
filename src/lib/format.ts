const brl = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })
const plain = new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
const compact = new Intl.NumberFormat('pt-BR', { notation: 'compact', maximumFractionDigits: 1 })

/** R$ 1.234,56 */
export function formatBRL(value: number): string {
  return brl.format(round2(value))
}

/** 1.234,56 (sem o símbolo) */
export function formatNumber(value: number): string {
  return plain.format(value)
}

/** Para eixos de gráfico: 1,2 mil */
export function formatCompact(value: number): string {
  return compact.format(value)
}

/** aaaa-mm-dd -> dd/mm/aaaa */
export function formatDate(iso: string): string {
  const [y, m, d] = iso.split('-')
  return `${d}/${m}/${y}`
}

/** aaaa-mm-dd -> dd/mm */
export function formatDayMonth(iso: string): string {
  const [, m, d] = iso.split('-')
  return `${d}/${m}`
}

export function round2(value: number): number {
  const r = Math.round((value + Number.EPSILON) * 100) / 100
  return Object.is(r, -0) ? 0 : r
}
