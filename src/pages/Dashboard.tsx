import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts'
import { ArrowDownLeft, ArrowDownRight, ArrowRight, ArrowUpRight, PieChart as PieIcon, PiggyBank, Plus, Receipt, Scale, Wallet } from 'lucide-react'
import { AXIS, ChartTooltip, GRID } from '../components/charts'
import PeriodFilter, { defaultPeriodState, presetPeriod, type PeriodPreset } from '../components/PeriodFilter'
import TransactionForm from '../components/TransactionForm'
import { Button, Card, CardTitle, cx, EmptyState, PageHeader } from '../components/ui'
import { useData } from '../contexts/DataContext'
import { monthShortLabel, todayISO } from '../lib/dates'
import { availableBalance, balanceSeries, inPeriod, monthlyFlow, sumDeposits, totals } from '../lib/finance'
import { formatBRL, formatCompact, formatDate, formatDayMonth } from '../lib/format'
import { currentWeekStatus } from '../lib/week'

const PRESETS: Array<{ id: Exclude<PeriodPreset, 'custom'>; label: string }> = [
  { id: 'month', label: 'Mês atual' },
  { id: 'last-month', label: 'Mês passado' },
  { id: '3-months', label: '3 meses' },
  { id: 'year', label: 'Este ano' },
]

const LABEL = 'font-mono text-[11px] font-semibold uppercase tracking-[0.18em]'

function StatCard({ label, value, icon, tone, glow }: { label: string; value: number; icon: React.ReactNode; tone: 'in' | 'out' | 'neutral' | 'auto'; glow?: boolean }) {
  const negative = value < 0
  const color = tone === 'in' ? 'text-brand' : tone === 'out' ? 'text-danger' : tone === 'neutral' ? 'text-neutral-50' : negative ? 'text-danger' : 'text-brand'
  return (
    <Card className={cx('!p-5', glow && (negative ? 'border-danger/30 shadow-[0_0_44px_-14px_rgba(239,68,68,0.55)]' : 'border-brand/30 shadow-[0_0_44px_-14px_rgba(34,197,94,0.55)]'))}>
      <div className="flex items-center justify-between">
        <p className={cx(LABEL, 'text-neutral-400')}>{label}</p>
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5 text-neutral-400">{icon}</span>
      </div>
      <p className={cx('mt-4 truncate text-3xl font-semibold tracking-tight', color)}>{formatBRL(value)}</p>
    </Card>
  )
}

export default function DashboardPage() {
  const { transactions, deposits, settings, categories } = useData()
  const [filter, setFilter] = useState(defaultPeriodState)
  const [formOpen, setFormOpen] = useState(false)
  const { period } = filter

  const balance = availableBalance(settings, transactions, deposits)
  const reserve = sumDeposits(deposits)
  const periodTx = useMemo(() => inPeriod(transactions, period), [transactions, period])
  const periodTotals = totals(periodTx)
  const week = useMemo(() => currentWeekStatus(deposits, settings), [deposits, settings])

  const history = useMemo(
    () => {
      // Não projeta dias futuros: o gráfico vai até hoje (ou até o fim do período, se já passou).
      const today = todayISO()
      const to = period.from <= today && today < period.to ? today : period.to
      return balanceSeries(settings, transactions, deposits, { from: period.from, to }).map((p) => ({ date: p.date, Saldo: p.balance }))
    },
    [settings, transactions, deposits, period],
  )

  const byCategory = useMemo(() => {
    const names = new Map(categories.map((c) => [c.id, c]))
    const map = new Map<string, { name: string; value: number; fill: string }>()
    for (const t of periodTx) {
      if (t.type !== 'expense') continue
      const cat = t.category_id ? names.get(t.category_id) : undefined
      const key = cat?.id ?? 'none'
      const cur = map.get(key) ?? { name: cat?.name ?? 'Sem categoria', value: 0, fill: cat?.color ?? '#525252' }
      cur.value += t.amount
      map.set(key, cur)
    }
    return [...map.values()].map((c) => ({ ...c, value: Math.round(c.value * 100) / 100 })).sort((a, b) => b.value - a.value)
  }, [periodTx, categories])

  const monthly = useMemo(
    () => monthlyFlow(settings, transactions, deposits).slice(-6).map((m) => ({ label: monthShortLabel(m.month), Entradas: m.income, Saídas: m.expense })),
    [settings, transactions, deposits],
  )

  const recent = transactions.slice(0, 6)
  const categoryById = useMemo(() => new Map(categories.map((c) => [c.id, c])), [categories])
  const isEmpty = transactions.length === 0

  return (
    <>
      <PageHeader eyebrow="Visão geral" title="Dashboard">
        <PeriodFilter value={filter} onChange={setFilter} />
        <Button icon={<Plus className="h-4 w-4" />} onClick={() => setFormOpen(true)}>Nova transação</Button>
      </PageHeader>

      {/* Saldo + histórico */}
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
        <div className="flex flex-col gap-4">
          <section className="relative flex min-h-56 flex-1 flex-col overflow-hidden rounded-2xl border border-accent/30 bg-linear-to-br from-accent/[0.18] via-card to-card p-6">
            <div className="flex items-start justify-between">
              <p className={cx(LABEL, 'text-accent')}>Saldo</p>
              <div className="flex flex-col items-center gap-3">
                <Wallet className="h-5 w-5 text-accent" />
                <PiggyBank className="h-5 w-5 text-neutral-500" />
              </div>
            </div>
            <p className={cx('mt-2 truncate text-4xl font-semibold tracking-tight xl:text-[2.6rem]', balance < 0 ? 'text-danger' : 'text-neutral-50')}>{formatBRL(balance)}</p>
            <div className="mt-auto flex items-end justify-between gap-3 pt-6">
              <p className="font-mono text-xs tracking-wider text-neutral-500">{formatDate(period.from)} — {formatDate(period.to)}</p>
              <p className="text-sm font-medium text-neutral-100">Disponível</p>
            </div>
          </section>

          <div className="flex flex-wrap gap-2" role="group" aria-label="Período">
            {PRESETS.map((p) => {
              const active = filter.preset === p.id
              return (
                <button
                  key={p.id}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setFilter({ preset: p.id, period: presetPeriod(p.id) })}
                  className={cx(
                    'h-9 rounded-full border px-4 text-sm transition',
                    active ? 'border-accent bg-accent/15 text-accent' : 'border-line bg-card text-neutral-400 hover:border-neutral-600 hover:text-neutral-100',
                  )}
                >
                  {p.label}
                </button>
              )
            })}
          </div>
        </div>

        <Card>
          <CardTitle eyebrow="Fluxo no tempo" title="Histórico de saldo" />
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={history} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="balanceFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#22c55e" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#22c55e" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid {...GRID} />
                <XAxis dataKey="date" {...AXIS} tickFormatter={formatDayMonth} minTickGap={28} />
                <YAxis {...AXIS} width={48} tickFormatter={formatCompact} />
                <Tooltip content={<ChartTooltip labelFormatter={formatDate} />} cursor={{ stroke: '#333' }} />
                <Area type="monotone" dataKey="Saldo" stroke="#22c55e" strokeWidth={2} fill="url(#balanceFill)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Período */}
      <div className="mt-5 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Entrada" value={periodTotals.income} tone="in" icon={<ArrowUpRight className="h-4 w-4" />} />
        <StatCard label="Gasto" value={periodTotals.expense} tone="out" icon={<ArrowDownRight className="h-4 w-4" />} />
        <StatCard label="Reserva" value={reserve} tone="neutral" icon={<PiggyBank className="h-4 w-4" />} />
        <StatCard label="Saldo" value={periodTotals.result} tone="auto" glow icon={<Scale className="h-4 w-4" />} />
      </div>

      {isEmpty && (
        <Card className="mt-5">
          <EmptyState icon={<Receipt className="h-5 w-5" />} title="Comece registrando uma transação"
            text="Assim que você lançar entradas e saídas, os gráficos e o histórico aparecem aqui."
            action={<Button icon={<Plus className="h-4 w-4" />} onClick={() => setFormOpen(true)}>Nova transação</Button>} />
        </Card>
      )}

      {/* Categorias + recentes */}
      <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <Card>
          <CardTitle eyebrow="Gastos por categoria" title="Para onde foi o dinheiro" />
          {byCategory.length === 0 ? (
            <EmptyState icon={<PieIcon className="h-5 w-5" />} title="Sem saídas no período" text="Quando houver gastos neste período, eles aparecem aqui divididos por categoria." />
          ) : (
            <div className="flex flex-col items-center gap-8 sm:flex-row">
              <div className="relative h-48 w-48 shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={byCategory} dataKey="value" nameKey="name" innerRadius={58} outerRadius={86} paddingAngle={2} stroke="#141414" strokeWidth={2}>
                      {byCategory.map((c) => <Cell key={c.name} fill={c.fill} />)}
                    </Pie>
                    <Tooltip content={<ChartTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                  <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-neutral-500">Total</span>
                  <span className="text-sm font-semibold text-neutral-100">{formatBRL(periodTotals.expense)}</span>
                </div>
              </div>
              <ul className="w-full min-w-0 flex-1 space-y-3.5">
                {byCategory.slice(0, 9).map((c) => (
                  <li key={c.name} className="flex items-center gap-3 text-sm">
                    <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: c.fill }} />
                    <span className="min-w-0 truncate font-medium text-neutral-100">{c.name}</span>
                    <span className="font-mono text-xs text-neutral-500">{Math.round((c.value / periodTotals.expense) * 100)}%</span>
                    <span className="ml-auto shrink-0 pl-3 font-mono text-neutral-400">{formatBRL(c.value)}</span>
                  </li>
                ))}
                {byCategory.length > 9 && <li className="text-xs text-neutral-600">+ {byCategory.length - 9} outras categorias</li>}
              </ul>
            </div>
          )}
        </Card>

        <Card>
          <CardTitle eyebrow="Movimentações" title="Transações recentes"
            action={<Link to="/transacoes" className="text-xs font-medium text-accent hover:underline">Ver todas</Link>} />
          {isEmpty ? (
            <EmptyState icon={<Receipt className="h-5 w-5" />} title="Nada por aqui ainda" text="Suas últimas movimentações aparecem nesta lista." />
          ) : (
            <ul className="space-y-1">
              {recent.map((t) => {
                const cat = t.category_id ? categoryById.get(t.category_id) : undefined
                const income = t.type === 'income'
                return (
                  <li key={t.id} className="flex items-center gap-3 rounded-xl px-2 py-2.5">
                    <span className={cx('flex h-9 w-9 shrink-0 items-center justify-center rounded-lg', income ? 'bg-brand/10 text-brand' : 'bg-danger/10 text-danger')}>
                      {income ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownLeft className="h-4 w-4" />}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-neutral-100">{t.description || (cat?.name ?? (income ? 'Entrada' : 'Saída'))}</p>
                      <p className="truncate text-xs text-neutral-500">{cat?.name ?? 'Sem categoria'} · {formatDate(t.date)}</p>
                    </div>
                    <span className={cx('shrink-0 font-mono text-sm', income ? 'text-brand' : 'text-neutral-200')}>{income ? '+' : '−'}{formatBRL(t.amount)}</span>
                  </li>
                )
              })}
            </ul>
          )}
        </Card>
      </div>

      {/* Meta da semana + comparação mensal */}
      <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
        <Card className="flex flex-col">
          <CardTitle eyebrow="Meta da semana" title={week.hit ? 'Meta batida!' : 'Quanto já guardei'}
            action={<Link to="/meta" aria-label="Abrir meta semanal" className="flex h-9 w-9 items-center justify-center rounded-lg text-neutral-500 hover:bg-white/5 hover:text-neutral-100"><ArrowRight className="h-4 w-4" /></Link>} />
          <p className="text-3xl font-semibold tracking-tight text-neutral-50">{formatBRL(week.saved)}</p>
          <p className="mt-1 text-sm text-neutral-500">de {formatBRL(week.goal)} · {week.percent}%</p>
          <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-bg">
            <div className="h-full rounded-full bg-brand transition-all duration-500" style={{ width: `${week.percent}%` }} />
          </div>
          <div className="mt-4 flex gap-1.5" aria-hidden>
            {week.days.map((d) => (
              <span key={d.date} title={formatDate(d.date)}
                className={cx('h-1.5 flex-1 rounded-full', d.deposit ? 'bg-brand' : d.isPast ? 'bg-danger/50' : d.isToday ? 'bg-accent/70' : 'bg-line')} />
            ))}
          </div>
          <p className="mt-auto pt-5 text-sm text-neutral-400">
            {week.hit
              ? 'Parabéns, a meta desta semana está garantida.'
              : week.daysLeft > 0
                ? <>Faltam <b className="text-neutral-100">{formatBRL(week.remaining)}</b>. Guarde <b className="text-accent">{formatBRL(week.suggestion)}</b> por dia até sábado.</>
                : <>Faltam <b className="text-neutral-100">{formatBRL(week.remaining)}</b> para a meta.</>}
          </p>
        </Card>

        <Card>
          <CardTitle eyebrow="Últimos meses" title="Entradas x saídas" />
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthly} margin={{ top: 8, right: 8, left: 0, bottom: 0 }} barGap={4}>
                <CartesianGrid {...GRID} />
                <XAxis dataKey="label" {...AXIS} />
                <YAxis {...AXIS} width={48} tickFormatter={formatCompact} />
                <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12, color: '#a3a3a3' }} />
                <Bar dataKey="Entradas" fill="#22c55e" radius={[4, 4, 0, 0]} maxBarSize={28} />
                <Bar dataKey="Saídas" fill="#ef4444" radius={[4, 4, 0, 0]} maxBarSize={28} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <TransactionForm open={formOpen} onClose={() => setFormOpen(false)} />
    </>
  )
}
