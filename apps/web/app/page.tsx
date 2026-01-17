'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export default function Page() {
  const [mounted, setMounted] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState('Checking session...')

  useEffect(() => {
    setMounted(true)

    // 🔑 IMPORTANT: handle magic link session
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null)
      setStatus('Ready')
    })

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null)
      }
    )

    return () => {
      listener.subscription.unsubscribe()
    }
  }, [])

  if (!mounted) return null

const login = async () => {
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${window.location.origin}/auth/callback`,
    },
  })

  if (error) alert(error.message)
  else alert('Check your email for login link ✉️')
}




  const logout = async () => {
    await supabase.auth.signOut()
    setUser(null)
  }

  return (
    <main style={{ padding: 40 }}>
      <h1>Cloud Drive</h1>

      {user ? (
        <>
          <p>Logged in as: {user.email}</p>
          <button onClick={logout}>Logout</button>
        </>
      ) : (
        <>
          <input
            placeholder="Enter email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <button onClick={login}>Login</button>
        </>
      )}

      <p style={{ marginTop: 20 }}>{status}</p>
    </main>
  )
}
