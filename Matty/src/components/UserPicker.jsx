import { useState, useRef, useEffect } from 'react'
import { useUser } from '../store/UserContext'
import './UserPicker.css'

export default function UserPicker() {
  const { users, activeUser, switchUser, addUser } = useUser()
  const [open,    setOpen]    = useState(false)
  const [newName, setNewName] = useState('')
  const rootRef   = useRef(null)
  const inputRef  = useRef(null)

  // Close on outside click
  useEffect(() => {
    if (!open) return
    function onDown(e) {
      if (!rootRef.current?.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [open])

  // Focus input when dropdown opens
  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 50)
  }, [open])

  function handleAdd(e) {
    e.preventDefault()
    const name = newName.trim()
    if (!name) return
    addUser(name)
    setNewName('')
    setOpen(false)
  }

  const initial = activeUser?.name?.[0]?.toUpperCase() ?? '?'

  return (
    <div className="up-root" ref={rootRef}>
      <button className="up-trigger" onClick={() => setOpen(o => !o)} aria-label="Switch user">
        <span className="up-avatar">{initial}</span>
        <span className="up-name">{activeUser?.name ?? 'Guest'}</span>
        <span className="up-caret">{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div className="up-dropdown">
          {users.length > 0 && (
            <div className="up-user-list">
              {users.map(u => (
                <button
                  key={u.name}
                  className={`up-user-item${u.name === activeUser?.name ? ' up-user-item--active' : ''}`}
                  onClick={() => { switchUser(u.name); setOpen(false) }}
                >
                  <span className="up-item-avatar">{u.name[0].toUpperCase()}</span>
                  <span className="up-item-name">{u.name}</span>
                  {u.name === activeUser?.name && <span className="up-item-check">✓</span>}
                </button>
              ))}
            </div>
          )}

          <div className="up-divider" />

          <form className="up-add-form" onSubmit={handleAdd}>
            <input
              ref={inputRef}
              className="up-add-input"
              placeholder="New player name…"
              value={newName}
              onChange={e => setNewName(e.target.value)}
              maxLength={24}
            />
            <button className="up-add-btn" type="submit" disabled={!newName.trim()}>
              Add
            </button>
          </form>
        </div>
      )}
    </div>
  )
}
