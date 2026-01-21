'use client'

import { useEffect, useState } from 'react'
import {
  Search,
  Star,
  Trash2,
  Download,
  Share2,
  LogOut,
  File
} from 'lucide-react'
import { supabase } from '../../lib/supabase'

export default function DrivePage() {
  const [user, setUser] = useState<any>(null)
  const [files, setFiles] = useState<any[]>([])
  const [query, setQuery] = useState('')

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      const u = data.session?.user
      setUser(u)
      if (u) fetchFiles(u.id)
    })
  }, [])

  const fetchFiles = async (userId: string) => {
    const { data } = await supabase.storage.from('user-files').list(userId)
    setFiles(data || [])
  }

  const downloadFile = async (name: string) => {
    const { data } = await supabase.storage
      .from('user-files')
      .download(`${user.id}/${name}`)
    const url = URL.createObjectURL(data!)
    const a = document.createElement('a')
    a.href = url
    a.download = name
    a.click()
    URL.revokeObjectURL(url)
  }

  const logout = async () => {
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  const filteredFiles = files.filter((f) =>
    f.name.toLowerCase().includes(query.toLowerCase())
  )

  if (!user) return null

  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: 'Inter, Arial' }}>
      {/* Sidebar */}
      <aside
        style={{
          width: 220,
          background: '#f8f9fa',
          padding: 20,
          borderRight: '1px solid #ddd',
        }}
      >
        <h3 style={{ marginBottom: 30 }}>☁ Cloud Drive</h3>

        {['My Drive', 'Shared', 'Starred', 'Trash'].map((item) => (
          <div
            key={item}
            style={{
              padding: '10px 8px',
              borderRadius: 6,
              cursor: 'pointer',
              marginBottom: 6,
            }}
          >
            {item}
          </div>
        ))}
      </aside>

      {/* Main */}
      <main style={{ flex: 1 }}>
        {/* Top bar */}
        <header
          style={{
            padding: 16,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid #ddd',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              background: '#f1f3f4',
              padding: '6px 12px',
              borderRadius: 20,
              width: 400,
            }}
          >
            <Search size={18} />
            <input
              placeholder="Search files"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              style={{
                border: 'none',
                outline: 'none',
                background: 'transparent',
                width: '100%',
              }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 14 }}>{user.email}</span>
            <LogOut size={18} cursor="pointer" onClick={logout} />
          </div>
        </header>

        {/* File list */}
        <div style={{ padding: 20 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ textAlign: 'left', color: '#666' }}>
                <th>Name</th>
                <th style={{ width: 160 }}>Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredFiles.map((file) => (
                <tr
                  key={file.name}
                  style={{
                    borderBottom: '1px solid #eee',
                    height: 48,
                  }}
                >
                  <td style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <File size={18} />
                    {file.name}
                  </td>

                  <td>
                    <div style={{ display: 'flex', gap: 12 }}>
                      <Download
                        size={18}
                        cursor="pointer"
                        onClick={() => downloadFile(file.name)}
                      />
                      <Star size={18} cursor="pointer" />
                      <Share2 size={18} cursor="pointer" />
                      <Trash2 size={18} cursor="pointer" />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredFiles.length === 0 && (
            <p style={{ marginTop: 40, color: '#777' }}>
              No files found
            </p>
          )}
        </div>
      </main>
    </div>
  )
}
