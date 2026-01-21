'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'

export default function DrivePage() {
  const [user, setUser] = useState<any>(null)
  const [files, setFiles] = useState<any[]>([])
  const [uploading, setUploading] = useState(false)
  const [search, setSearch] = useState('')
  const [view, setView] = useState<'all' | 'starred' | 'trash'>('all')

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      const currentUser = data.session?.user ?? null
      setUser(currentUser)
      if (currentUser) fetchFiles(currentUser.id)
    })
  }, [])

  const fetchFiles = async (userId: string) => {
    const { data } = await supabase
      .from('files')
      .select('*')
      .eq('owner_id', userId)
      .order('created_at', { ascending: false })

    setFiles(data || [])
  }

  /* ================= FILE ACTIONS ================= */

  const uploadFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !user) return
    const file = e.target.files[0]
    setUploading(true)

    const path = `${user.id}/${Date.now()}-${file.name}`

    const { error } = await supabase.storage
      .from('user-files')
      .upload(path, file)

    if (!error) {
      await supabase.from('files').insert({
        name: file.name,
        storage_path: path,
        owner_id: user.id,
      })
      fetchFiles(user.id)
    } else alert(error.message)

    setUploading(false)
  }

  const softDelete = async (id: string) => {
    await supabase.from('files').update({ is_deleted: true }).eq('id', id)
    fetchFiles(user.id)
  }

  const restoreFile = async (id: string) => {
    await supabase.from('files').update({ is_deleted: false }).eq('id', id)
    fetchFiles(user.id)
  }

  const toggleStar = async (id: string, current: boolean) => {
    await supabase.from('files').update({ is_starred: !current }).eq('id', id)
    fetchFiles(user.id)
  }

  const downloadFile = async (path: string, name: string) => {
    const { data, error } = await supabase.storage
      .from('user-files')
      .download(path)

    if (error) return alert(error.message)

    const url = URL.createObjectURL(data)
    const a = document.createElement('a')
    a.href = url
    a.download = name
    a.click()
    URL.revokeObjectURL(url)
  }

  const makePublic = async (id: string) => {
    const publicId = crypto.randomUUID()

    await supabase
      .from('files')
      .update({ is_public: true, public_id: publicId })
      .eq('id', id)

    alert(`Public link: ${window.location.origin}/public/${publicId}`)
    fetchFiles(user.id)
  }

  /* ================= FILTERING ================= */

  const visibleFiles = files
    .filter(f =>
      view === 'trash' ? f.is_deleted :
      view === 'starred' ? f.is_starred && !f.is_deleted :
      !f.is_deleted
    )
    .filter(f => f.name.toLowerCase().includes(search.toLowerCase()))

  const logout = async () => {
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  if (!user) return <p>Loading...</p>

  return (
    <main style={container}>
      <h2>📁 My Drive</h2>
      <p>Logged in as <b>{user.email}</b></p>
      <button onClick={logout}>Logout</button>

      <hr />

      {/* Controls */}
      <input
        placeholder="Search files"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={input}
      />

      <div style={{ marginBottom: 10 }}>
        <button onClick={() => setView('all')}>All</button>{' '}
        <button onClick={() => setView('starred')}>⭐ Starred</button>{' '}
        <button onClick={() => setView('trash')}>🗑 Trash</button>
      </div>

      <input type="file" onChange={uploadFile} />
      {uploading && <p>Uploading...</p>}

      <ul style={{ listStyle: 'none', padding: 0 }}>
        {visibleFiles.map(file => (
          <li key={file.id} style={row}>
            <span>{file.name}</span>

            <span style={{ display: 'flex', gap: 8 }}>
              {!file.is_deleted && (
                <>
                  <button onClick={() => toggleStar(file.id, file.is_starred)}>
                    {file.is_starred ? '⭐' : '☆'}
                  </button>
                  <button onClick={() => downloadFile(file.storage_path, file.name)}>⬇️</button>
                  <button onClick={() => makePublic(file.id)}>🔗</button>
                  <button onClick={() => softDelete(file.id)}>🗑</button>
                </>
              )}

              {file.is_deleted && (
                <button onClick={() => restoreFile(file.id)}>♻️ Restore</button>
              )}
            </span>
          </li>
        ))}
      </ul>
    </main>
  )
}

/* ================= STYLES ================= */

const container: React.CSSProperties = {
  maxWidth: 800,
  margin: '40px auto',
  padding: 30,
  background: '#f9f9f9',
  borderRadius: 8,
  fontFamily: 'Arial',
}

const row: React.CSSProperties = {
  background: '#fff',
  padding: 10,
  marginBottom: 6,
  display: 'flex',
  justifyContent: 'space-between',
  borderRadius: 6,
}

const input: React.CSSProperties = {
  width: '100%',
  padding: 8,
  marginBottom: 10,
}
