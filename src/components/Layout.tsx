import { useState } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import { ArrowLeftRight, LayoutDashboard, LineChart, LogOut, PiggyBank, Settings, TrendingUp } from 'lucide-react'
import { useData } from '../contexts/DataContext'
import { errorMessage } from '../lib/errors'
import { signOut } from '../services/auth'
import { cx, ErrorBox, Spinner, useToast } from './ui'

const NAV = [
  { to: '/', label: 'Dashboard', short: 'Início', icon: LayoutDashboard, end: true },
  { to: '/transacoes', label: 'Transações', short: 'Transações', icon: ArrowLeftRight },
  { to: '/fluxo-de-caixa', label: 'Fluxo de caixa', short: 'Fluxo', icon: LineChart },
  { to: '/meta', label: 'Meta semanal', short: 'Meta', icon: PiggyBank },
  { to: '/configuracoes', label: 'Configurações', short: 'Ajustes', icon: Settings },
]

export default function Layout() {
  const { loading, error, reload } = useData()
  const toast = useToast()
  const [leaving, setLeaving] = useState(false)

  async function handleSignOut() {
    setLeaving(true)
    try {
      await signOut()
    } catch (e) {
      toast.error(errorMessage(e, 'Não foi possível sair.'))
      setLeaving(false)
    }
  }

  return (
    <div className="min-h-dvh">
      {/* Barra lateral (desktop) */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[72px] flex-col items-center border-r border-line bg-bg py-5 md:flex">
        <div className="mb-8 flex h-10 w-10 items-center justify-center rounded-xl bg-brand/10 text-brand">
          <TrendingUp className="h-5 w-5" />
        </div>
        <nav className="flex flex-1 flex-col items-center gap-2" aria-label="Principal">
          {NAV.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              title={label}
              aria-label={label}
              className={({ isActive }) =>
                cx(
                  'flex h-11 w-11 items-center justify-center rounded-xl transition',
                  isActive ? 'bg-brand/10 text-brand' : 'text-neutral-500 hover:bg-white/5 hover:text-neutral-100',
                )
              }
            >
              <Icon className="h-5 w-5" />
            </NavLink>
          ))}
        </nav>
        <button
          type="button"
          onClick={handleSignOut}
          disabled={leaving}
          title="Sair"
          aria-label="Sair"
          className="flex h-11 w-11 items-center justify-center rounded-xl text-neutral-500 transition hover:bg-danger/10 hover:text-danger disabled:opacity-50"
        >
          <LogOut className="h-5 w-5" />
        </button>
      </aside>

      {/* Topo (celular) */}
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-line bg-bg/90 px-4 py-3 backdrop-blur-sm md:hidden">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand/10 text-brand">
            <TrendingUp className="h-4 w-4" />
          </div>
          <span className="font-serif text-lg text-neutral-50">Finanças</span>
        </div>
        <button
          type="button"
          onClick={handleSignOut}
          disabled={leaving}
          className="flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-xs font-medium text-neutral-400 hover:text-danger disabled:opacity-50"
        >
          <LogOut className="h-4 w-4" /> Sair
        </button>
      </header>

      <div className="md:pl-[72px]">
        <main className="px-4 pb-28 pt-6 sm:px-6 md:px-8 md:pb-12 md:pt-8">
          {loading ? <Spinner label="Carregando seus dados…" /> : error ? <ErrorBox message={error} onRetry={reload} /> : <Outlet />}
        </main>
      </div>

      {/* Barra inferior (celular) */}
      <nav
        className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-5 border-t border-line bg-bg/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-sm md:hidden"
        aria-label="Principal"
      >
        {NAV.map(({ to, short, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              cx(
                'flex flex-col items-center gap-1 py-2.5 text-[10px] font-medium transition',
                isActive ? 'text-brand' : 'text-neutral-500',
              )
            }
          >
            <Icon className="h-5 w-5" />
            {short}
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
