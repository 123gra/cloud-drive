'use client'

import { useEffect, useState } from 'react'
import { supabase } from './../lib/supabase'

export default function Page() {
  const [user, setUser] = useState<any>(null)
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      const sessionUser = data.session?.user ?? null
      setUser(sessionUser)
      setLoading(false)

      if (sessionUser) {
        window.location.href = '/drive'
      }
    })

    const { data: sub } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        const sessionUser = session?.user ?? null
        setUser(sessionUser)

        if (sessionUser) {
          window.location.href = '/drive'
        }
      }
    )

    return () => sub.subscription.unsubscribe()
  }, [])

  const login = async () => {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/drive`,
      },
    })

    if (error) alert(error.message)
    else alert('Check your email for the login link ✉️')
  }

  if (loading) return null

  return (
    <main
      style={{
        height: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        fontFamily: 'Arial, sans-serif',
        background: '#eef2f7',
      }}
    >
      <div
        style={{
          width: 350,
          padding: 30,
          background: '#fff',
          borderRadius: 10,
          boxShadow: '0 0 12px rgba(0,0,0,0.15)',
          textAlign: 'center',
        }}
      >
        <h1 style={{ marginBottom: 10 }}> Cloud Drive</h1>
        <p style={{ color: '#666', marginBottom: 20 }}>
          Login with your email
        </p>

        <input
          type="email"
          placeholder="Enter email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{
            width: '100%',
            padding: 10,
            marginBottom: 15,
            borderRadius: 5,
            border: '1px solid #ccc',
          }}
        />

        <button
          onClick={login}
          style={{
            width: '100%',
            padding: 10,
            background: '#3498db',
            color: '#fff',
            border: 'none',
            borderRadius: 5,
            cursor: 'pointer',
          }}
        >
          Login
        </button>
      </div>
    </main>
  )
}
