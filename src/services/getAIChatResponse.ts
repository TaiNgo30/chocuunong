import { supabase } from '@/integrations/supabase/client'

export async function getAIChatResponse(messageId: string) {
  const session = await supabase.auth.getSession()
  const token = session.data.session?.access_token

  const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/openai-message-sender`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ messageId }),
  })

  if (!res.ok) {
    throw new Error('Failed to call AI chat function')
  }

  return await res.json()
}
