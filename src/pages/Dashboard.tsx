import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts'
import { ArrowDownLeft, ArrowRight, ArrowUpRight, PieChart as PieIcon, PiggyBank, Plus, Receipt, Scale, Wallet } from 'lucide-react'
import { AXIS, ChartTooltip, GRID } from '../components/charts'
import PeriodFilter, { defaultPeriodState } from '../components/PeriodFilter'
import TransactionForm from '../components/TransactionForm'
import { Button, Card, CardTitle, cx, EmptyState, PageHeader } from '../components/ui'
import { useData } from '../contexts/DataContext'
import { monthShortLabel, todayISO } from '../lib/dates'
import { availableBalance, balanceSeries, inPeriod, monthlyFlow, sumDeposits, totals } from '../lib/finance'
import { formatBRL, formatCompact, formatDate, formatDayMonth } from '../lib/format'
import { currentWeekStatus } from '../lib/week'

function StatCard({ label, value, icon, tone }: { label: string; value: number; icon: React.ReactNode; tone: 'in' | 'out' | 'auto' }) {
  const color = tone === 'in' ? 'text-brand' : tone === 'out' ? 'text-danger' : value < 0 ? 'text-danger' : 'text-neutral-50'
  return (
    <Card className="!p-5">
      <div className="flex items-center justify-between">
        <p className="eyebrow">{label}</p>
        <span className="text-neutral-600">{icon}</span>
      </div>
      <p className={cx('mt-3 truncate font-serif text-2xl', color)}>{formatBRL(value)}</p>
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

      {/* Saldo + Reserva */}
      <div className="grid gap-4 lg:grid-cols-[1.6fr_1fr]">
        <section className="relative overflow-hidden rounded-2xl border border-accent/40 bg-gradient-to-br from-accent/[0.14] via-card to-card p-6 sm:p-7">
          <div className="flex items-center justify-between">
            <p className="eyebrow">Saldo atual</p>
            <Wallet className="h-5 w-5 text-accent" />
          </div>
          <p className={cx('mt-4 font-serif text-4xl sm:text-5xl', balance < 0 ? 'text-danger' : 'text-neutral-50')}>{formatBRL(balance)}</p>
          <p className="mt-2 text-sm text-neutral-400">Disponível agora, já descontado o que foi para a Reserva.</p>
        </section>

        <Card className="flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <p className="eyebrow">Reserva</p>
            <PiggyBank className="h-5 w-5 text-brand" />
          </div>
          <div>
            <p className="mt-4 font-serif text-3xl text-brand">{formatBRL(reserve)}</p>
            <p className="mt-1 text-sm text-neutral-500">Total guardado desde o início</p>
          </div>
        </Card>
      </div>

      {/* Período */}
      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        <StatCard label="Entradas" value={periodTotals.income} tone="in" icon={<ArrowDownLeft className="h-4 w-4" />} />
        <StatCard label="Saídas" value={periodTotals.expense} tone="out" icon={<ArrowUpRight className="h-4 w-4" />} />
        <StatCard label="Saldo do período" value={periodTotals.result} tone="auto" icon={<Scale className="h-4 w-4" />} />
      </div>
      <p className="mt-2 text-xs text-neutral-600">Período: {formatDate(period.from)} a {formatDate(period.to)}</p>

      {isEmpty && (
        <Card className="mt-4">
          <EmptyState icon={<Receipt className="h-5 w-5" />} title="Comece registrando uma transação"
            text="Assim que você lançar entradas e saídas, os gráficos e o histórico aparecem aqui."
            action={<Button icon={<Plus className="h-4 w-4" />} onClick={() => setFormOpen(true)}>Nova transação</Button>} />
        </Card>
      )}

      {/* Histórico do saldo + meta */}
      <div className="mt-4 grid gap-4 lg:grid-cols-[1.6fr_1fr]">
        <Card>
          <CardTitle eyebrow="Histórico" title="Evolução do saldo" />
          <div className="h-64">
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

        <Card className="flex flex-col">
          <CardTitle eyebrow="Meta da semana" title={week.hit ? 'Meta batida!' : 'Quanto já guardei'}
            action={<Link to="/meta" aria-label="Abrir meta semanal" className="flex h-9 w-9 items-center justify-center rounded-lg text-neutral-500 hover:bg-white/5 hover:text-neutral-100"><ArrowRight className="h-4 w-4" /></Link>} />
          <p className="font-serif text-3xl text-neutral-50">{formatBRL(week.saved)}</p>
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
      </div>

      {/* Categorias + comparação mensal */}
      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Card>
          <CardTitle eyebrow="Gastos por categoria" title="Para onde foi o dinheiro" />
          {byCategory.length === 0 ? (
            <EmptyState icon={<PieIcon className="h-5 w-5" />} title="Sem saídas no período" text="Quando houver gastos neste período, eles aparecem aqui divididos por categoria." />
          ) : (
            <div className="flex flex-col items-center gap-5 sm:flex-row">
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
                  <span className="text-[10px] uppercase tracking-wider text-neutral-500">Total</span>
                  <span className="text-sm font-semibold text-neutral-100">{formatBRL(periodTotals.expense)}</span>
                </div>
              </div>
              <ul className="w-full min-w-0 flex-1 space-y-2.5">
                {byCategory.slice(0, 7).map((c) => (
                  <li key={c.name} className="flex items-center gap-2.5 text-sm">
                    <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: c.fill }} />
                    <span className="min-w-0 flex-1 truncate text-neutral-300">{c.name}</span>
                    <span className="text-xs text-neutral-500">{Math.round((c.value / periodTotals.expense) * 100)}%</span>
                    <span className="w-24 text-right font-medium text-neutral-100">{formatBRL(c.value)}</span>
                  </li>
                ))}
                {byCategory.length > 7 && <li className="text-xs text-neutral-600">+ {byCategory.length - 7} outras categorias</li>}
              </ul>
            </div>
          )}
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

      {/* Recentes */}
      {!isEmpty && (
        <Card className="mt-4 !p-0">
          <div className="px-5 pt-5 sm:px-6 sm:pt-6">
            <CardTitle eyebrow="Movimentações" title="Transações recentes"
              action={<Link to="/transacoes" className="text-xs font-medium text-accent hover:underline">Ver todas</Link>} />
          </div>
          <ul className="divide-y divide-line border-t border-line">
            {recent.map((t) => {
              const cat = t.category_id ? categoryById.get(t.category_id) : undefined
              const income = t.type === 'income'
              return (
                <li key={t.id} className="flex items-center gap-3 px-5 py-3.5 sm:px-6">
                  <span className={cx('flex h-9 w-9 shrink-0 items-center justify-center rounded-full', income ? 'bg-brand/10 text-brand' : 'bg-danger/10 text-danger')}>
                    {income ? <ArrowDownLeft className="h-4 w-4" /> : <ArrowUpRight className="h-4 w-4" />}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-neutral-100">{t.description || (cat?.name ?? (income ? 'Entrada' : 'Saída'))}</p>
                    <p className="text-xs text-neutral-500">{formatDate(t.date)} · {cat?.name ?? 'Sem categoria'}</p>
                  </div>
                  <span className={cx('shrink-0 text-sm font-semibold', income ? 'text-brand' : 'text-danger')}>{income ? '+' : '−'} {formatBRL(t.amount)}</span>
                </li>
              )
            })}
          </ul>
        </Card>
      )}

      <TransactionForm open={formOpen} onClose={() => setFormOpen(false)} />
    </>
  )
}
