export type TransactionType = 'income' | 'expense'

export interface Category {
  id: string
  user_id: string
  name: string
  color: string
  type: TransactionType
}

export interface Transaction {
  id: string
  user_id: string
  type: TransactionType
  amount: number
  description: string
  category_id: string | null
  /** Data no formato aaaa-mm-dd */
  date: string
  created_at: string
}

export interface SavingsDeposit {
  id: string
  user_id: string
  /** Data no formato aaaa-mm-dd */
  date: string
  amount: number
  /** Meta semanal vigente quando o depósito foi feito */
  goal_snapshot: number | null
  created_at: string
}

export interface Settings {
  user_id: string
  weekly_goal: number
  initial_balance: number
}

export type CategoryInput = Pick<Category, 'name' | 'color' | 'type'>
export type TransactionInput = Pick<
  Transaction,
  'type' | 'amount' | 'description' | 'category_id' | 'date'
>
export type SettingsInput = Partial<Pick<Settings, 'weekly_goal' | 'initial_balance'>>

export interface Period {
  from: string
  to: string
}
