import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { onAuthStateChanged, signOut as fbSignOut } from 'firebase/auth'
import { doc, onSnapshot } from 'firebase/firestore'
import { auth, db } from '../firebase'

const AuthCtx = createContext({ user: null, profile: null, loading: true, signOut: async () => {} })

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const unsubProfileRef = useRef(null)

  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, (u) => {
      setUser(u)
      setLoading(true)
      if (unsubProfileRef.current) {
        unsubProfileRef.current()
        unsubProfileRef.current = null
      }
      setProfile(null)
      if (u?.uid) {
        const ref = doc(db, 'users', u.uid)
        unsubProfileRef.current = onSnapshot(ref, (snap) => {
          setProfile(snap.exists() ? { id: snap.id, ...snap.data() } : null)
          setLoading(false)
        }, () => setLoading(false))
      } else {
        setLoading(false)
      }
    })
    return () => {
      if (unsubProfileRef.current) unsubProfileRef.current()
      unsubAuth()
    }
  }, [])

  const value = useMemo(() => ({
    user,
    profile,
    loading,
    signOut: async () => { await fbSignOut(auth) }
  }), [user, profile, loading])

  return (
    <AuthCtx.Provider value={value}>
      {children}
    </AuthCtx.Provider>
  )
}

export function useAuth() {
  return useContext(AuthCtx)
}
