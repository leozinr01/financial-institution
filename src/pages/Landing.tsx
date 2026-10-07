import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { ArrowDownLeft, ArrowRight, ArrowUpRight, Download, Lock, Trash2, TrendingUp, type LucideIcon } from 'lucide-react'
import { cx } from '../components/ui'

const container = 'mx-auto w-full max-w-6xl px-5 sm:px-8'
const pill = 'inline-flex h-11 items-center justify-center gap-2 rounded-full px-6 text-sm font-semibold transition'
const card = 'rounded-3xl border border-line bg-card'
const label = 'text-[10px] font-semibold uppercase tracking-[0.14em] text-neutral-500'

/* Números de exemplo usados nas prévias. */
const SPENDING = [
  { name: 'Moradia', value: 'R$ 1.650', share: 34, color: 'bg-emerald-500' },
  { name: 'Mercado', value: 'R$ 1.060', share: 22, color: 'bg-amber-400' },
  { name: 'Lazer', value: 'R$ 680', share: 14, color: 'bg-sky-400' },
  { name: 'Transporte', value: 'R$ 580', share: 12, color: 'bg-violet-400' },
  { name: 'Saúde', value: 'R$ 390', share: 8, color: 'bg-rose-400' },
  { name: 'Outros', value: 'R$ 472', share: 10, color: 'bg-neutral-500' },
]

const TOTALS = [
  { name: 'Entrou', value: 'R$ 8.500', tone: 'text-brand' },
  { name: 'Saiu', value: 'R$ 4.832', tone: 'text-danger' },
  { name: 'Guardou', value: 'R$ 1.200', tone: 'text-accent' },
]

const MOVES = [
  { name: 'Salário', category: 'Renda', value: '+ R$ 4.250,00', income: true },
  { name: 'Aluguel', category: 'Moradia', value: '− R$ 1.400,00', income: false },
  { name: 'Mercado da semana', category: 'Mercado', value: '− R$ 312,40', income: false },
  { name: 'Cinema', category: 'Lazer', value: '− R$ 64,00', income: false },
]

const TAGS = ['Moradia', 'Mercado', 'Transporte', 'Lazer', 'Saúde', 'Assinaturas', 'Pets', 'Estudos', 'Presentes']

const STEPS = [
  { title: 'Crie sua conta', text: 'Nome, e-mail e senha. Leva menos de um minuto.' },
  { title: 'Anote o que entra e o que sai', text: 'Cada movimentação ganha uma categoria e já aparece nos gráficos.' },
  { title: 'Descubra para onde foi', text: 'O mês inteiro em uma tela, e a Reserva crescendo toda semana.' },
]

const SECURITY: Array<{ icon: LucideIcon; title: string; text: string }> = [
  { icon: Lock, title: 'Só você vê', text: 'Cada conta enxerga apenas os próprios dados.' },
  { icon: Download, title: 'Seus dados são seus', text: 'Exporte tudo em um arquivo quando quiser.' },
  { icon: Trash2, title: 'Apague quando quiser', text: 'Um botão remove todas as suas informações.' },
]

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function Brand({ small }: { small?: boolean }) {
  return (
    <span className="flex items-center gap-2.5">
      <span className={cx('flex items-center justify-center rounded-xl bg-accent/10 text-accent', small ? 'h-7 w-7' : 'h-9 w-9')}>
        <TrendingUp className={small ? 'h-3.5 w-3.5' : 'h-4 w-4'} />
      </span>
      <span className={cx('font-serif text-neutral-50', small ? 'text-base' : 'text-lg')}>Gastei Tudo</span>
    </span>
  )
}

function SectionTitle({ eyebrow, children }: { eyebrow: string; children: ReactNode }) {
  return (
    <div className="mx-auto max-w-2xl text-center">
      <p className="eyebrow mb-3">{eyebrow}</p>
      <h2 className="font-serif text-3xl leading-tight text-neutral-50 sm:text-[2.6rem]">{children}</h2>
    </div>
  )
}

/** Prévia ilustrativa: o gasto do mês dividido por categoria em uma única barra. */
function MonthPreview() {
  return (
    <div className={cx(card, 'relative mx-auto max-w-4xl p-5 text-left shadow-2xl shadow-black sm:p-7')} aria-hidden>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className={label}>Para onde foi · exemplo</p>
          <p className="mt-1.5 font-serif text-3xl text-neutral-50 sm:text-4xl">R$ 4.832</p>
        </div>
        <div className="flex divide-x divide-line">
          {TOTALS.map((total) => (
            <div key={total.name} className="px-4 first:pl-0 last:pr-0">
              <p className={label}>{total.name}</p>
              <p className={cx('mt-1 text-sm font-semibold', total.tone)}>{total.value}</p>
            </div>
          ))}
        </div>
      </div>
      <div className="mt-6 flex h-4 gap-1 overflow-hidden rounded-full">
        {SPENDING.map((item) => (
          <div key={item.name} className={cx('h-full first:rounded-l-full last:rounded-r-full', item.color)} style={{ width: `${item.share}%` }} />
        ))}
      </div>
      <div className="mt-6 grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-3">
        {SPENDING.map((item) => (
          <div key={item.name} className="flex items-center gap-2.5 text-sm">
            <span className={cx('h-2.5 w-2.5 shrink-0 rounded-full', item.color)} />
            <span className="text-neutral-400">{item.name}</span>
            <span className="ml-auto font-medium text-neutral-100">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function GoalRing() {
  const radius = 52
  const length = 2 * Math.PI * radius
  return (
    <div className="relative mx-auto h-36 w-36" aria-hidden>
      <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90">
        <circle cx="60" cy="60" r={radius} fill="none" strokeWidth="9" className="stroke-line" />
        <circle cx="60" cy="60" r={radius} fill="none" strokeWidth="9" strokeLinecap="round" className="stroke-accent"
          strokeDasharray={length} strokeDashoffset={length * 0.28} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-serif text-2xl text-neutral-50">72%</span>
        <span className="text-[11px] text-neutral-500">da meta</span>
      </div>
    </div>
  )
}

function CashLine() {
  return (
    <svg viewBox="0 0 300 110" className="h-28 w-full" preserveAspectRatio="none" aria-hidden>
      <defs>
        <linearGradient id="cash-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#22c55e" stopOpacity="0.28" />
          <stop offset="100%" stopColor="#22c55e" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d="M0 86 C40 80 55 58 90 62 S140 84 170 54 S230 30 300 14 V110 H0 Z" fill="url(#cash-fill)" />
      <path d="M0 86 C40 80 55 58 90 62 S140 84 170 54 S230 30 300 14" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  )
}

function Bento({ eyebrow, title, text, className, children }: {
  eyebrow: string; title: string; text: string; className?: string; children: ReactNode
}) {
  return (
    <article className={cx(card, 'flex flex-col overflow-hidden p-6 transition hover:border-neutral-700 sm:p-7', className)}>
      <p className={label}>{eyebrow}</p>
      <h3 className="mt-2 font-serif text-xl text-neutral-50">{title}</h3>
      <p className="mt-2 max-w-sm text-sm leading-relaxed text-neutral-400">{text}</p>
      <div className="mt-6 flex flex-1 flex-col justify-end">{children}</div>
    </article>
  )
}

export default function LandingPage() {
  return (
    <div className="min-h-dvh overflow-x-clip">
      <header className="sticky top-0 z-30 bg-bg/80 backdrop-blur-md">
        <div className={cx(container, 'flex h-16 items-center justify-between gap-4')}>
          <Link to="/" onClick={scrollToTop} aria-label="Gastei Tudo — voltar ao início da página"><Brand /></Link>
          <nav className="flex items-center gap-1 sm:gap-2" aria-label="Principal">
            <a className="hidden rounded-full px-3.5 py-2 text-sm text-neutral-400 transition hover:text-neutral-100 md:block" href="#recursos">Recursos</a>
            <a className="hidden rounded-full px-3.5 py-2 text-sm text-neutral-400 transition hover:text-neutral-100 md:block" href="#como-funciona">Como funciona</a>
            <a className="hidden rounded-full px-3.5 py-2 text-sm text-neutral-400 transition hover:text-neutral-100 md:block" href="#seguranca">Segurança</a>
            <Link to="/login" className="rounded-full px-3.5 py-2 text-sm font-medium text-neutral-200 transition hover:text-white">Entrar</Link>
            <Link to="/cadastro" className={cx(pill, 'h-10 bg-accent px-5 text-black hover:bg-yellow-400')}>Criar conta</Link>
          </nav>
        </div>
      </header>

      <main>
        <section className="relative">
          <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden>
            <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:56px_56px] [mask-image:radial-gradient(ellipse_70%_60%_at_50%_0%,black,transparent)]" />
            <div className="absolute left-1/2 top-[-12rem] h-[30rem] w-[46rem] -translate-x-1/2 rounded-full bg-accent/10 blur-3xl" />
            <div className="absolute left-[12%] top-[18rem] h-72 w-72 rounded-full bg-brand/10 blur-3xl" />
          </div>

          <div className={cx(container, 'pb-20 pt-16 text-center sm:pt-24')}>
            <p className="animate-fade-in inline-flex items-center gap-2 rounded-full border border-line bg-card/70 px-4 py-1.5 text-xs text-neutral-300">
              <span className="h-1.5 w-1.5 rounded-full bg-brand" /> Controle financeiro sem planilha
            </p>
            <h1 className="animate-fade-in mx-auto mt-7 max-w-3xl font-serif text-5xl leading-[1.05] text-neutral-50 sm:text-7xl">
              Gastei tudo. <span className="block italic text-accent">Mas em quê?</span>
            </h1>
            <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-neutral-400">
              Anote o que entra e o que sai, veja para onde o dinheiro foi e guarde um pouco toda semana.
            </p>
            <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
              <Link to="/cadastro" className={cx(pill, 'h-12 bg-accent px-7 text-black shadow-lg shadow-accent/20 hover:bg-yellow-400')}>
                Começar agora <ArrowRight className="h-4 w-4" />
              </Link>
              <Link to="/login" className={cx(pill, 'h-12 border border-line px-7 text-neutral-200 hover:border-neutral-600')}>Já tenho conta</Link>
            </div>
            <div className="mt-16">
              <MonthPreview />
            </div>
          </div>
        </section>

        <section id="recursos" className="scroll-mt-20 py-20 sm:py-24">
          <div className={container}>
            <SectionTitle eyebrow="Recursos">Tudo o que o seu mês precisa, <span className="block italic text-neutral-400">e nada além.</span></SectionTitle>
            <div className="mt-12 grid gap-4 lg:grid-cols-3">
              <Bento className="lg:col-span-2" eyebrow="Transações" title="Cada real no seu lugar"
                text="Registre entradas e saídas em segundos. O saldo se atualiza na hora.">
                <ul className="divide-y divide-line rounded-2xl border border-line bg-bg" aria-hidden>
                  {MOVES.map((move) => (
                    <li key={move.name} className="flex items-center gap-3 px-4 py-3">
                      <span className={cx('flex h-8 w-8 shrink-0 items-center justify-center rounded-full', move.income ? 'bg-brand/10 text-brand' : 'bg-danger/10 text-danger')}>
                        {move.income ? <ArrowDownLeft className="h-4 w-4" /> : <ArrowUpRight className="h-4 w-4" />}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium text-neutral-100">{move.name}</span>
                        <span className="block text-xs text-neutral-500">{move.category}</span>
                      </span>
                      <span className={cx('text-sm font-semibold', move.income ? 'text-brand' : 'text-neutral-200')}>{move.value}</span>
                    </li>
                  ))}
                </ul>
              </Bento>

              <Bento eyebrow="Meta semanal" title="Guarde toda semana"
                text="Defina um valor e acompanhe a Reserva crescer.">
                <GoalRing />
                <p className="mt-4 text-center text-sm text-neutral-400">
                  <span className="font-semibold text-neutral-100">R$ 180</span> de R$ 250 nesta semana
                </p>
              </Bento>

              <Bento eyebrow="Fluxo de caixa" title="O saldo mês a mês"
                text="Veja quanto entrou, quanto saiu e para onde o saldo está indo.">
                <div className="-mx-6 -mb-6 sm:-mx-7 sm:-mb-7">
                  <CashLine />
                </div>
              </Bento>

              <Bento className="lg:col-span-2" eyebrow="Categorias" title="Do seu jeito"
                text="Crie as categorias que fazem sentido para a sua rotina e descubra qual delas pesa mais.">
                <div className="flex flex-wrap gap-2" aria-hidden>
                  {TAGS.map((tag, index) => (
                    <span key={tag} className={cx(
                      'rounded-full border px-3.5 py-1.5 text-sm',
                      index % 4 === 0 ? 'border-accent/40 bg-accent/10 text-accent' : index % 4 === 2 ? 'border-brand/40 bg-brand/10 text-brand' : 'border-line bg-bg text-neutral-300',
                    )}>{tag}</span>
                  ))}
                </div>
              </Bento>
            </div>
          </div>
        </section>

        <section id="como-funciona" className="scroll-mt-20 py-20 sm:py-24">
          <div className={container}>
            <SectionTitle eyebrow="Como funciona">Três passos e o mês fica claro.</SectionTitle>
            <ol className="relative mt-14 grid gap-10 md:grid-cols-3 md:gap-8">
              <div className="absolute left-0 right-0 top-7 hidden h-px bg-gradient-to-r from-transparent via-line to-transparent md:block" aria-hidden />
              {STEPS.map((step, index) => (
                <li key={step.title} className="relative text-center">
                  <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-accent/40 bg-bg font-serif text-xl text-accent">{index + 1}</span>
                  <h3 className="mt-5 font-serif text-xl text-neutral-50">{step.title}</h3>
                  <p className="mx-auto mt-2 max-w-xs text-sm leading-relaxed text-neutral-400">{step.text}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section id="seguranca" className="scroll-mt-20 py-20 sm:py-24">
          <div className={container}>
            <div className={cx(card, 'grid gap-10 p-7 sm:p-10 lg:grid-cols-[1fr_1.4fr] lg:items-center')}>
              <div>
                <p className="eyebrow mb-3">Segurança</p>
                <h2 className="font-serif text-3xl leading-tight text-neutral-50 sm:text-4xl">Seus dados ficam só com você.</h2>
              </div>
              <ul className="space-y-6">
                {SECURITY.map(({ icon: Icon, title, text }) => (
                  <li key={title} className="flex items-start gap-4">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand/10 text-brand">
                      <Icon className="h-5 w-5" />
                    </span>
                    <div>
                      <h3 className="text-base font-semibold text-neutral-100">{title}</h3>
                      <p className="mt-1 text-sm leading-relaxed text-neutral-400">{text}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section className="pb-24 pt-4">
          <div className={container}>
            <div className="relative overflow-hidden rounded-[2rem] border border-accent/25 bg-card px-6 py-16 text-center sm:py-20">
              <div className="pointer-events-none absolute left-1/2 top-0 h-64 w-[36rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent/15 blur-3xl" aria-hidden />
              <h2 className="relative mx-auto max-w-xl font-serif text-3xl leading-tight text-neutral-50 sm:text-5xl">
                No mês que vem, <span className="block italic text-accent">você vai saber.</span>
              </h2>
              <p className="relative mx-auto mt-4 max-w-md text-base text-neutral-400">Crie sua conta e lance a primeira transação em menos de um minuto.</p>
              <Link to="/cadastro" className={cx(pill, 'relative mt-8 h-12 bg-accent px-7 text-black hover:bg-yellow-400')}>
                Criar minha conta <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-line py-8">
        <div className={cx(container, 'flex flex-col items-center justify-between gap-4 text-sm text-neutral-500 sm:flex-row')}>
          <Link to="/" onClick={scrollToTop} aria-label="Gastei Tudo — voltar ao início da página"><Brand small /></Link>
          <div className="flex items-center gap-6">
            <Link className="transition hover:text-neutral-200" to="/login">Entrar</Link>
            <Link className="transition hover:text-neutral-200" to="/cadastro">Criar conta</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
