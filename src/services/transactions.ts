import { supabase } from '../lib/supabase'
import type { Transaction, TransactionInput } from '../types'
import { requireUserId } from './auth'

const PAGE = 1000

function normalize(row: Transaction): Transaction {
  return { ...row, amount: Number(row.amount) }
}

/** Busca todas as transações do usuário (paginando de 1000 em 1000). */
export async function listTransactions(): Promise<Transaction[]> {
  const all: Transaction[] = []
  for (let from = 0; ; from += PAGE) {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .order('date', { ascending: false })
      .order('created_at', { ascending: false })
      .order('id')
      .range(from, from + PAGE - 1)
    if (error) throw error
    all.push(...(data as Transaction[]).map(normalize))
    if (data.length < PAGE) break
  }
  return all
}

export async function createTransaction(input: TransactionInput): Promise<Transaction> {
  const user_id = await requireUserId()
  const { data, error } = await supabase
    .from('transactions')
    .insert({ ...input, user_id })
    .select()
    .single()
  if (error) throw error
  return normalize(data as Transaction)
}

export async function updateTransaction(id: string, input: TransactionInput): Promise<Transaction> {
  const { data, error } = await supabase
    .from('transactions')
    .update(input)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return normalize(data as Transaction)
}

export async function deleteTransaction(id: string): Promise<void> {
  const { error } = await supabase.from('transactions').delete().eq('id', id)
  if (error) throw error
}
