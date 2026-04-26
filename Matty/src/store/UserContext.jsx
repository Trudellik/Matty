import { createContext, useContext, useState, useCallback } from 'react'

const STORAGE_KEY = 'matty_users'
const ACTIVE_KEY  = 'matty_active_user'

function loadUsers() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) ?? []
  } catch {
    return []
  }
}

function saveUsers(users) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(users))
}

const UserContext = createContext(null)

export function UserProvider({ children }) {
  const [users,      setUsers]      = useState(loadUsers)
  const [activeUser, setActiveUser] = useState(() => {
    const saved = localStorage.getItem(ACTIVE_KEY)
    const all   = loadUsers()
    return all.find(u => u.name === saved) ?? all[0] ?? null
  })

  const switchUser = useCallback((name) => {
    const user = users.find(u => u.name === name)
    if (!user) return
    localStorage.setItem(ACTIVE_KEY, name)
    setActiveUser(user)
  }, [users])

  const addUser = useCallback((name) => {
    const trimmed = name.trim()
    if (!trimmed || users.some(u => u.name === trimmed)) return
    const newUser = { name: trimmed, scores: {} }
    const next    = [...users, newUser]
    saveUsers(next)
    setUsers(next)
    localStorage.setItem(ACTIVE_KEY, trimmed)
    setActiveUser(newUser)
  }, [users])

  const updateScores = useCallback((newScores) => {
    setUsers(prev => {
      const next = prev.map(u =>
        u.name === activeUser?.name ? { ...u, scores: newScores } : u
      )
      saveUsers(next)
      return next
    })
    setActiveUser(prev => prev ? { ...prev, scores: newScores } : prev)
  }, [activeUser])

  // Returns the best value across all users for a given scoreKey.
  // reducer: (allValues: any[]) => any  — caller decides what "best" means
  function globalBest(scoreKey, reducer) {
    const vals = users
      .map(u => u.scores?.[scoreKey])
      .filter(v => v !== undefined && v !== null)
    if (vals.length === 0) return undefined
    return reducer(vals)
  }

  return (
    <UserContext.Provider value={{ users, activeUser, switchUser, addUser, updateScores, globalBest }}>
      {children}
    </UserContext.Provider>
  )
}

export function useUser() {
  return useContext(UserContext)
}
