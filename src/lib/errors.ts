const AUTH_MESSAGES: Array<[RegExp, string]> = [
  [/invalid login credentials/i, 'E-mail ou senha incorretos.'],
  [/email not confirmed/i, 'Confirme seu e-mail antes de entrar. Verifique sua caixa de entrada.'],
  [/user already registered/i, 'Já existe uma conta com este e-mail.'],
  [/password should be at least/i, 'A senha precisa ter pelo menos 8 caracteres.'],
  [/should be different from the old password/i, 'A nova senha precisa ser diferente da anterior.'],
  [/unable to validate email|invalid email|is invalid/i, 'Informe um e-mail válido.'],
  [/rate limit|security purposes|too many requests/i, 'Muitas tentativas. Aguarde um instante e tente de novo.'],
  [/session missing|jwt expired|invalid jwt/i, 'Sua sessão expirou. Entre novamente.'],
  [/failed to fetch|networkerror|load failed/i, 'Sem conexão com o servidor. Verifique sua internet e tente de novo.'],
  [/row-level security/i, 'Você não tem permissão para fazer esta operação.'],
  [/relation .* does not exist|could not find the table|schema cache/i,
    'O banco ainda não foi configurado. Rode o arquivo supabase/schema.sql no SQL Editor do Supabase.'],
]

/** Converte qualquer erro em uma mensagem legível em português. */
export function errorMessage(error: unknown, fallback = 'Algo deu errado. Tente novamente.'): string {
  const raw =
    typeof error === 'string'
      ? error
      : error && typeof error === 'object' && 'message' in error
        ? String((error as { message: unknown }).message)
        : ''
  if (!raw) return fallback
  for (const [pattern, message] of AUTH_MESSAGES) if (pattern.test(raw)) return message
  return `${fallback} (${raw})`
}
