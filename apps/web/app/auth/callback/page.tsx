'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../../lib/supabase'

export default function AuthCallbackPage() {
  const router = useRouter()

  useEffect(() => {
    const completeLogin = async () => {
      await supabase.auth.getSession()
      router.replace('/')
    }

    completeLogin()
  }, [router])

  return <p style={{ padding: 40 }}>Signing you in…</p>
}
