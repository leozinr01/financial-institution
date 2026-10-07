import { useState, type FormEvent, type ReactNode } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { MailCheck, TrendingUp } from 'lucide-react'
import { Button, useToast } from '../components/ui'
import { useAuth } from '../contexts/AuthContext'
import { errorMessage } from '../lib/errors'
import * as auth from '../services/auth'

function AuthShell({ eyebrow, title, subtitle, children, footer }: {
  eyebrow: string; title: string; subtitle: string; children: ReactNode; footer?: ReactNode
}) {
  return (
    <div className="flex min-h-dvh items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex h-11 w-11 items-center justify-center rounded-xl bg-brand/10 text-brand">
          <TrendingUp className="h-5 w-5" />
        </div>
        <p className="eyebrow mb-1.5">{eyebrow}</p>
        <h1 className="font-serif text-3xl text-neutral-50">{title}</h1>
        <p className="mt-2 text-sm text-neutral-500">{subtitle}</p>
        <div className="mt-8 rounded-2xl border border-line bg-card p-6">{children}</div>
        {footer && <div className="mt-6 text-center text-sm text-neutral-500">{footer}</div>}
      </div>
    </div>
  )
}

function FormError({ message }: { message: string }) {
  if (!message) return null
  return <p className="rounded-lg border border-danger/30 bg-danger/5 px-3 py-2 text-xs text-danger" role="alert">{message}</p>
}

function Notice({ title, text }: { title: string; text: string }) {
  return (
    <div className="flex flex-col items-center py-2 text-center">
      <MailCheck className="mb-3 h-8 w-8 text-brand" />
      <p className="font-serif text-lg text-neutral-50">{title}</p>
      <p className="mt-1 text-sm text-neutral-400">{text}</p>
    </div>
  )
}

const link = 'font-medium text-brand hover:underline'
const isEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)

export function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function submit(e: FormEvent) {
    e.preventDefault()
    if (!isEmail(email.trim())) return setError('Informe um e-mail válido.')
    if (!password) return setError('Informe sua senha.')
    setError('')
    setLoading(true)
    try {
      await auth.signIn(email.trim(), password)
    } catch (err) {
      setError(errorMessage(err, 'Não foi possível entrar.'))
      setLoading(false)
    }
  }

  return (
    <AuthShell eyebrow="Bem-vinda de volta" title="Entrar" subtitle="Acompanhe seu dinheiro e sua meta da semana."
      footer={<>Ainda não tem conta? <Link className={link} to="/cadastro">Criar conta</Link></>}>
      <form onSubmit={submit} className="space-y-4" noValidate>
        <div>
          <label className="field-label" htmlFor="email">E-mail</label>
          <input id="email" type="email" autoComplete="email" className="field" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div>
          <div className="flex items-center justify-between">
            <label className="field-label" htmlFor="password">Senha</label>
            <Link className="mb-1.5 text-xs text-neutral-500 hover:text-brand" to="/recuperar-senha">Esqueci minha senha</Link>
          </div>
          <input id="password" type="password" autoComplete="current-password" className="field" value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        <FormError message={error} />
        <Button type="submit" loading={loading} className="w-full">Entrar</Button>
      </form>
    </AuthShell>
  )
}

export function RegisterPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const toast = useToast()

  async function submit(e: FormEvent) {
    e.preventDefault()
    if (!name.trim()) return setError('Informe seu nome.')
    if (!isEmail(email.trim())) return setError('Informe um e-mail válido.')
    if (password.length < 6) return setError('A senha precisa ter pelo menos 6 caracteres.')
    if (password !== confirm) return setError('As senhas não conferem.')
    setError('')
    setLoading(true)
    try {
      const loggedIn = await auth.signUp(name.trim(), email.trim(), password)
      if (loggedIn) toast.success('Cadastrado com sucesso!')
      else setSent(true)
    } catch (err) {
      setError(errorMessage(err, 'Não foi possível criar a conta.'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthShell eyebrow="Comece agora" title="Criar conta" subtitle="Leva um minuto. Seus dados ficam só com você."
      footer={<>Já tem conta? <Link className={link} to="/login">Entrar</Link></>}>
      {sent ? (
        <Notice title="Confirme seu e-mail" text={`Enviamos um link de confirmação para ${email.trim()}. Abra o link e depois entre com sua senha.`} />
      ) : (
        <form onSubmit={submit} className="space-y-4" noValidate>
          <div>
            <label className="field-label" htmlFor="name">Nome</label>
            <input id="name" type="text" autoComplete="given-name" className="field" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div>
            <label className="field-label" htmlFor="email">E-mail</label>
            <input id="email" type="email" autoComplete="email" className="field" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div>
            <label className="field-label" htmlFor="password">Senha</label>
            <input id="password" type="password" autoComplete="new-password" className="field" placeholder="Mínimo de 6 caracteres" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          <div>
            <label className="field-label" htmlFor="confirm">Confirmar senha</label>
            <input id="confirm" type="password" autoComplete="new-password" className="field" value={confirm} onChange={(e) => setConfirm(e.target.value)} />
          </div>
          <FormError message={error} />
          <Button type="submit" loading={loading} className="w-full">Criar conta</Button>
        </form>
      )}
    </AuthShell>
  )
}

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  async function submit(e: FormEvent) {
    e.preventDefault()
    if (!isEmail(email.trim())) return setError('Informe um e-mail válido.')
    setError('')
    setLoading(true)
    try {
      await auth.sendPasswordReset(email.trim())
      setSent(true)
    } catch (err) {
      setError(errorMessage(err, 'Não foi possível enviar o e-mail.'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthShell eyebrow="Recuperação" title="Esqueci minha senha" subtitle="Enviaremos um link para você criar uma nova senha."
      footer={<Link className={link} to="/login">Voltar para o login</Link>}>
      {sent ? (
        <Notice title="Verifique seu e-mail" text={`Se existir uma conta para ${email.trim()}, o link de recuperação chega em instantes.`} />
      ) : (
        <form onSubmit={submit} className="space-y-4" noValidate>
          <div>
            <label className="field-label" htmlFor="email">E-mail</label>
            <input id="email" type="email" autoComplete="email" className="field" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <FormError message={error} />
          <Button type="submit" loading={loading} className="w-full">Enviar link</Button>
        </form>
      )}
    </AuthShell>
  )
}

/** Tela aberta pelo link do e-mail de recuperação (o link já deixa a pessoa autenticada). */
export function ResetPasswordPage() {
  const { user, loading: authLoading } = useAuth()
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function submit(e: FormEvent) {
    e.preventDefault()
    if (password.length < 6) return setError('A senha precisa ter pelo menos 6 caracteres.')
    if (password !== confirm) return setError('As senhas não conferem.')
    setError('')
    setLoading(true)
    try {
      await auth.updatePassword(password)
      navigate('/', { replace: true })
    } catch (err) {
      setError(errorMessage(err, 'Não foi possível alterar a senha.'))
      setLoading(false)
    }
  }

  return (
    <AuthShell eyebrow="Recuperação" title="Nova senha" subtitle="Escolha a senha que você vai usar daqui em diante.">
      {!authLoading && !user ? (
        <div className="text-center text-sm text-neutral-400">
          <p>Este link expirou ou já foi usado.</p>
          <Link className={`${link} mt-3 inline-block`} to="/recuperar-senha">Pedir um novo link</Link>
        </div>
      ) : (
        <form onSubmit={submit} className="space-y-4" noValidate>
          <div>
            <label className="field-label" htmlFor="password">Nova senha</label>
            <input id="password" type="password" autoComplete="new-password" className="field" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          <div>
            <label className="field-label" htmlFor="confirm">Confirmar nova senha</label>
            <input id="confirm" type="password" autoComplete="new-password" className="field" value={confirm} onChange={(e) => setConfirm(e.target.value)} />
          </div>
          <FormError message={error} />
          <Button type="submit" loading={loading || authLoading} className="w-full">Salvar nova senha</Button>
        </form>
      )}
    </AuthShell>
  )
}
