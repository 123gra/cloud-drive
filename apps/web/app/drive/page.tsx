'use client'

import { useEffect, useState } from 'react'
import {
  Search,
  Star,
  Trash2,
  Download,
  Share2,
  LogOut,
  File,
  RotateCcw,
  X,
  Copy,
} from 'lucide-react'
import { supabase } from '../../lib/supabase'

type View = 'all' | 'starred' | 'shared' | 'trash'

export default function DrivePage() {
  const [user, setUser] = useState<any>(null)
  const [files, setFiles] = useState<any[]>([])
  const [query, setQuery] = useState('')
  const [view, setView] = useState<View>('all')

  const [toast, setToast] = useState<string | null>(null)
  const [shareFile, setShareFile] = useState<any | null>(null)

  /* -------------------- Helpers -------------------- */

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 2500)
  }

  const getFileName = (path?: string) =>
    path?.split('/').pop() || 'file'

  /* -------------------- Auth & Load -------------------- */

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session?.user) {
        setUser(data.session.user)
        fetchFiles(data.session.user.id)
      }
    })
  }, [])

  const fetchFiles = async (userId: string) => {
    const { data } = await supabase
      .from('file_metadata')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    setFiles(data || [])
  }

  /* -------------------- Actions -------------------- */

  const toggleStar = async (id: string, current: boolean) => {
    await supabase
      .from('file_metadata')
      .update({ is_starred: !current })
      .eq('id', id)

    setFiles((p) =>
      p.map((f) =>
        f.id === id ? { ...f, is_starred: !current } : f
      )
    )

    showToast(current ? 'Removed from Starred' : 'Added to Starred')
  }

  const moveToTrash = async (id: string) => {
    await supabase
      .from('file_metadata')
      .update({
        is_deleted: true,
        is_starred: false,
        is_shared: false,
        public_url: null,
      })
      .eq('id', id)

    setFiles((p) =>
      p.map((f) =>
        f.id === id
          ? {
              ...f,
              is_deleted: true,
              is_starred: false,
              is_shared: false,
              public_url: null,
            }
          : f
      )
    )

    showToast('Moved to Trash')
  }

  const restoreFile = async (id: string) => {
    await supabase
      .from('file_metadata')
      .update({ is_deleted: false })
      .eq('id', id)

    setFiles((p) =>
      p.map((f) =>
        f.id === id ? { ...f, is_deleted: false } : f
      )
    )

    showToast('File restored')
  }

  const toggleShare = async (file: any) => {
    if (!file.is_shared) {
      const { data } = supabase.storage
        .from('user-files')
        .getPublicUrl(file.file_path)

      await supabase
        .from('file_metadata')
        .update({
          is_shared: true,
          public_url: data.publicUrl,
        })
        .eq('id', file.id)

      setFiles((p) =>
        p.map((f) =>
          f.id === file.id
            ? { ...f, is_shared: true, public_url: data.publicUrl }
            : f
        )
      )

      showToast('Public link created')
    }

    setShareFile({
      ...file,
      public_url: file.public_url,
    })
  }

  const downloadFile = async (path: string) => {
    const { data } = await supabase.storage
      .from('user-files')
      .download(path)

    if (!data) return

    const url = URL.createObjectURL(data)
    const a = document.createElement('a')
    a.href = url
    a.download = getFileName(path)
    a.click()
    URL.revokeObjectURL(url)

    showToast('Download started')
  }

  const logout = async () => {
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  /* -------------------- Filters (FIXED SEARCH) -------------------- */

  const visibleFiles = files.filter((f) => {
    const filename = getFileName(f.file_path).toLowerCase()
    const q = query.toLowerCase()

    if (view === 'trash')
      return f.is_deleted && filename.includes(q)

    if (f.is_deleted) return false
    if (view === 'starred' && !f.is_starred) return false
    if (view === 'shared' && !f.is_shared) return false

    return filename.includes(q)
  })

  if (!user) return null

  /* -------------------- UI -------------------- */

  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: 'Inter, Arial' }}>
      {/* Sidebar */}
      <aside
        style={{
          width: 240,
          padding: 16,
          borderRight: '1px solid #ddd',
          background: '#fafafa',
        }}
      >
        <h3 style={{ marginBottom: 24 }}>☁ Cloud Drive</h3>

        {[
          ['My Drive', 'all'],
          ['Shared', 'shared'],
          ['Starred', 'starred'],
          ['Trash', 'trash'],
        ].map(([label, key]) => (
          <div
            key={key}
            onClick={() => setView(key as View)}
            style={{
              padding: '10px 12px',
              borderRadius: 8,
              cursor: 'pointer',
              marginBottom: 6,
              background: view === key ? '#e8f0fe' : '',
              fontWeight: view === key ? 600 : 400,
            }}
          >
            {label}
          </div>
        ))}
      </aside>

      {/* Main */}
      <main style={{ flex: 1 }}>
        {/* Header */}
        <header
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            padding: 16,
            borderBottom: '1px solid #ddd',
          }}
        >
          <div
            style={{
              display: 'flex',
              gap: 10,
              background: '#f1f3f4',
              padding: '8px 14px',
              borderRadius: 24,
              width: 420,
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

          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <span style={{ fontSize: 14 }}>{user.email}</span>
            <LogOut size={18} cursor="pointer" onClick={logout} />
          </div>
        </header>

        {/* Files */}
        <div style={{ padding: 20 }}>
          {visibleFiles.map((file) => (
            <div
              key={file.id}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '12px 8px',
                borderBottom: '1px solid #eee',
              }}
            >
              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <File size={18} />
                {getFileName(file.file_path)}
              </div>

              <div style={{ display: 'flex', gap: 16 }}>
                {view === 'trash' ? (
                  <RotateCcw
                    size={18}
                    cursor="pointer"
                    onClick={() => restoreFile(file.id)}
                  />
                ) : (
                  <>
                    <Download
                      size={18}
                      cursor="pointer"
                      onClick={() => downloadFile(file.file_path)}
                    />
                    <Star
                      size={18}
                      cursor="pointer"
                      fill={file.is_starred ? '#fbbc04' : 'none'}
                      color={file.is_starred ? '#fbbc04' : '#444'}
                      onClick={() => toggleStar(file.id, file.is_starred)}
                    />
                    <Share2
                      size={18}
                      cursor="pointer"
                      onClick={() => toggleShare(file)}
                    />
                    <Trash2
                      size={18}
                      cursor="pointer"
                      onClick={() => moveToTrash(file.id)}
                    />
                  </>
                )}
              </div>
            </div>
          ))}

          {visibleFiles.length === 0 && (
            <p style={{ marginTop: 40, color: '#777' }}>No files here</p>
          )}
        </div>
      </main>

      {/* Share Modal */}
      {shareFile && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.4)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <div
            style={{
              background: '#fff',
              padding: 20,
              width: 420,
              borderRadius: 10,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <h3>Share file</h3>
              <X cursor="pointer" onClick={() => setShareFile(null)} />
            </div>

            <p style={{ fontSize: 14, margin: '12px 0' }}>
              Anyone with the link can view
            </p>

            <div
              style={{
                display: 'flex',
                gap: 8,
                background: '#f1f3f4',
                padding: 8,
                borderRadius: 6,
              }}
            >
              <input
                readOnly
                value={shareFile.public_url || ''}
                style={{
                  border: 'none',
                  background: 'transparent',
                  flex: 1,
                }}
              />
              <Copy
                cursor="pointer"
                onClick={() => {
                  navigator.clipboard.writeText(shareFile.public_url)
                  showToast('Link copied')
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div
          style={{
            position: 'fixed',
            bottom: 24,
            left: '50%',
            transform: 'translateX(-50%)',
            background: '#323232',
            color: '#fff',
            padding: '10px 16px',
            borderRadius: 6,
            fontSize: 14,
          }}
        >
          {toast}
        </div>
      )}
    </div>
  )
}
