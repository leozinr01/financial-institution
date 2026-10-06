import { useMemo, useState } from 'react'
import { ArrowDownLeft, ArrowUpRight, Pencil, Plus, Receipt, Search, Tags, Trash2 } from 'lucide-react'
import CategoryManager from '../components/CategoryManager'
import TransactionForm from '../components/TransactionForm'
import { Button, Card, ConfirmDialog, cx, EmptyState, IconButton, Modal, PageHeader, useToast } from '../components/ui'
import { useData } from '../contexts/DataContext'
import { errorMessage } from '../lib/errors'
import { totals } from '../lib/finance'
import { formatBRL, formatDate } from '../lib/format'
import type { Transaction } from '../types'

const PAGE_SIZE = 50

export default function TransactionsPage() {
  const { transactions, categories, removeTransaction } = useData()
  const toast = useToast()
  const [search, setSearch] = useState('')
  const [type, setType] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Transaction | null>(null)
  const [categoriesOpen, setCategoriesOpen] = useState(false)
  const [toDelete, setToDelete] = useState<Transaction | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [limit, setLimit] = useState(PAGE_SIZE)

  const categoryById = useMemo(() => new Map(categories.map((c) => [c.id, c])), [categories])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return transactions.filter(
      (t) =>
        (!q || t.description.toLowerCase().includes(q)) &&
        (!type || t.type === type) &&
        (!categoryId || (categoryId === 'none' ? !t.category_id : t.category_id === categoryId)) &&
        (!from || t.date >= from) &&
        (!to || t.date <= to),
    )
  }, [transactions, search, type, categoryId, from, to])

  const sum = totals(filtered)
  const hasFilters = Boolean(search || type || categoryId || from || to)

  function clearFilters() {
    setSearch(''); setType(''); setCategoryId(''); setFrom(''); setTo('')
  }

  function openNew() { setEditing(null); setFormOpen(true) }
  function openEdit(t: Transaction) { setEditing(t); setFormOpen(true) }

  async function confirmDelete() {
    if (!toDelete) return
    setDeleting(true)
    try {
      await removeTransaction(toDelete.id)
      toast.success('Transação excluída.')
      setToDelete(null)
    } catch (e) {
      toast.error(errorMessage(e, 'Não foi possível excluir a transação.'))
    } finally {
      setDeleting(false)
    }
  }

  return (
    <>
      <PageHeader eyebrow="Entradas e saídas" title="Transações">
        <Button variant="secondary" icon={<Tags className="h-4 w-4" />} onClick={() => setCategoriesOpen(true)}>Categorias</Button>
        <Button icon={<Plus className="h-4 w-4" />} onClick={openNew}>Nova transação</Button>
      </PageHeader>

      <Card className="mb-4 !p-4">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[1.6fr_1fr_1fr_1fr_1fr]">
          <div className="relative sm:col-span-2 lg:col-span-1">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-600" />
            <input className="field pl-10" placeholder="Buscar por descrição" aria-label="Buscar por descrição" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <select className="field" aria-label="Tipo" value={type} onChange={(e) => setType(e.target.value)}>
            <option value="">Todos os tipos</option>
            <option value="income">Entradas</option>
            <option value="expense">Saídas</option>
          </select>
          <select className="field" aria-label="Categoria" value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
            <option value="">Todas as categorias</option>
            {categories.filter((c) => !type || c.type === type).map((c) => (
              <option key={c.id} value={c.id}>{c.name}{type ? '' : c.type === 'income' ? ' (entrada)' : ' (saída)'}</option>
            ))}
            <option value="none">Sem categoria</option>
          </select>
          <input type="date" className="field" aria-label="A partir de" title="A partir de" value={from} max={to || undefined} onChange={(e) => setFrom(e.target.value)} />
          <input type="date" className="field" aria-label="Até" title="Até" value={to} min={from || undefined} onChange={(e) => setTo(e.target.value)} />
        </div>
        {transactions.length > 0 && (
          <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1 text-xs text-neutral-500">
            <span>{filtered.length} {filtered.length === 1 ? 'transação' : 'transações'}</span>
            <span>Entradas <b className="font-medium text-brand">{formatBRL(sum.income)}</b></span>
            <span>Saídas <b className="font-medium text-danger">{formatBRL(sum.expense)}</b></span>
            {hasFilters && <button type="button" className="ml-auto text-accent hover:underline" onClick={clearFilters}>Limpar filtros</button>}
          </div>
        )}
      </Card>

      <Card className="!p-0">
        {transactions.length === 0 ? (
          <EmptyState icon={<Receipt className="h-5 w-5" />} title="Nenhuma transação ainda"
            text="Registre sua primeira entrada ou saída para começar a acompanhar seu dinheiro."
            action={<Button icon={<Plus className="h-4 w-4" />} onClick={openNew}>Nova transação</Button>} />
        ) : filtered.length === 0 ? (
          <EmptyState icon={<Search className="h-5 w-5" />} title="Nada encontrado"
            text="Nenhuma transação combina com os filtros escolhidos."
            action={<Button variant="secondary" onClick={clearFilters}>Limpar filtros</Button>} />
        ) : (
          <>
            <ul className="divide-y divide-line">
              {filtered.slice(0, limit).map((t) => {
                const cat = t.category_id ? categoryById.get(t.category_id) : undefined
                const income = t.type === 'income'
                return (
                  <li key={t.id} className="flex items-center gap-3 px-4 py-3.5 sm:px-6">
                    <span className={cx('flex h-9 w-9 shrink-0 items-center justify-center rounded-full', income ? 'bg-brand/10 text-brand' : 'bg-danger/10 text-danger')}>
                      {income ? <ArrowDownLeft className="h-4 w-4" /> : <ArrowUpRight className="h-4 w-4" />}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-neutral-100">{t.description || (cat?.name ?? (income ? 'Entrada' : 'Saída'))}</p>
                      <p className="mt-0.5 flex items-center gap-1.5 text-xs text-neutral-500">
                        {formatDate(t.date)}
                        <span>·</span>
                        {cat && <span className="h-2 w-2 rounded-full" style={{ background: cat.color }} />}
                        <span className="truncate">{cat?.name ?? 'Sem categoria'}</span>
                      </p>
                    </div>
                    <span className={cx('shrink-0 text-sm font-semibold', income ? 'text-brand' : 'text-danger')}>
                      {income ? '+' : '−'} {formatBRL(t.amount)}
                    </span>
                    <div className="flex shrink-0">
                      <IconButton label="Editar" onClick={() => openEdit(t)}><Pencil className="h-4 w-4" /></IconButton>
                      <IconButton label="Excluir" onClick={() => setToDelete(t)} className="hover:!text-danger"><Trash2 className="h-4 w-4" /></IconButton>
                    </div>
                  </li>
                )
              })}
            </ul>
            {filtered.length > limit && (
              <div className="border-t border-line p-4 text-center">
                <Button variant="ghost" onClick={() => setLimit((n) => n + PAGE_SIZE)}>Mostrar mais ({filtered.length - limit} restantes)</Button>
              </div>
            )}
          </>
        )}
      </Card>

      <TransactionForm open={formOpen} editing={editing} onClose={() => setFormOpen(false)} />
      <Modal open={categoriesOpen} onClose={() => setCategoriesOpen(false)} eyebrow="Organização" title="Categorias">
        <CategoryManager />
      </Modal>
      <ConfirmDialog
        open={Boolean(toDelete)}
        title="Excluir transação?"
        text={toDelete ? `${toDelete.description || 'Transação'} de ${formatBRL(toDelete.amount)} em ${formatDate(toDelete.date)} será excluída. Essa ação não pode ser desfeita.` : ''}
        loading={deleting}
        onConfirm={confirmDelete}
        onClose={() => setToDelete(null)}
      />
    </>
  )
}
