import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { onAuthStateChanged, signOut as fbSignOut } from 'firebase/auth'
import { doc, onSnapshot } from 'firebase/firestore'
import { auth, db, DEMO_MODE } from '../firebase'

// ── Demo credentials ──────────────────────────────────────────────────────────
export const DEMO_ACCOUNTS = [
  {
    uid: 'demo-uid-001',
    email: 'demo@zerobite.app',
    password: 'demo1234',
    profile: {
      id: 'demo-uid-001',
      name: 'Arjun Mehta',
      type: 'Donor',
      email: 'demo@zerobite.app',
      contact: '9876543210',
      address: 'Jaipur, Rajasthan',
      avatar: 'AM',
    },
  },
  {
    uid: 'ngo-uid-001',
    email: 'ngo@zerobite.app',
    password: 'ngo1234',
    profile: {
      id: 'ngo-uid-001',
      name: 'FoodAid Trust',
      type: 'NGO',
      email: 'ngo@zerobite.app',
      contact: '9876543211',
      address: 'C-Scheme, Jaipur',
      avatar: 'FT',
    },
  },
  {
    uid: 'admin-uid-001',
    email: 'admin@zerobite.app',
    password: 'admin1234',
    profile: {
      id: 'admin-uid-001',
      name: 'Priya Sharma',
      type: 'Admin',
      email: 'admin@zerobite.app',
      contact: '9000000001',
      address: 'Mumbai, Maharashtra',
      avatar: 'PS',
    },
  },
]

const DEMO_USER_STORAGE_KEY = 'zerobite_demo_user'
const DEMO_PROFILE_STORAGE_KEY = 'zerobite_demo_profile'
const DEMO_CUSTOM_USERS_KEY = 'zerobite_demo_custom_users'

const AuthCtx = createContext({
  user: null,
  profile: null,
  loading: true,
  signOut: async () => {},
  demoLogin: async () => {},
  demoRegister: async () => {},
})

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const unsubProfileRef       = useRef(null)

  useEffect(() => {
    if (DEMO_MODE) {
      // Check localStorage for persisted demo session
      try {
        const storedUser = localStorage.getItem(DEMO_USER_STORAGE_KEY)
        const storedProfile = localStorage.getItem(DEMO_PROFILE_STORAGE_KEY)
        if (storedUser && storedProfile) {
          setUser(JSON.parse(storedUser))
          setProfile(JSON.parse(storedProfile))
        } else {
          setUser(null)
          setProfile(null)
        }
      } catch (e) {
        setUser(null)
        setProfile(null)
      }
      setLoading(false)
      return
    }

    // ── LIVE MODE: real Firebase Auth + Firestore listener ──
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

  /** DEMO_MODE login — match by email + password */
  const demoLogin = async (email, password) => {
    let customUsers = []
    try {
      customUsers = JSON.parse(localStorage.getItem(DEMO_CUSTOM_USERS_KEY) || '[]')
    } catch (e) {}

    const allAccounts = [...DEMO_ACCOUNTS, ...customUsers]
    const account = allAccounts.find(
      (a) => a.email.toLowerCase() === email.trim().toLowerCase() && a.password === password
    )
    if (!account) throw new Error('Invalid email or password.')

    const userObj = { uid: account.uid, email: account.email }
    setUser(userObj)
    setProfile(account.profile)

    try {
      localStorage.setItem(DEMO_USER_STORAGE_KEY, JSON.stringify(userObj))
      localStorage.setItem(DEMO_PROFILE_STORAGE_KEY, JSON.stringify(account.profile))
    } catch (e) {}
  }

  /** DEMO_MODE registration */
  const demoRegister = async ({ name, type, address, contact, email, password }) => {
    let customUsers = []
    try {
      customUsers = JSON.parse(localStorage.getItem(DEMO_CUSTOM_USERS_KEY) || '[]')
    } catch (e) {}

    const existing = [...DEMO_ACCOUNTS, ...customUsers].find(
      (a) => a.email.toLowerCase() === email.trim().toLowerCase()
    )
    if (existing) {
      throw new Error('An account with this email already exists.')
    }

    const initials = name ? name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() : 'ZB'
    const newAccount = {
      uid: `demo-reg-${Date.now()}`,
      email: email.trim(),
      password,
      profile: {
        id: `demo-reg-${Date.now()}`,
        name: name.trim(),
        type,
        email: email.trim(),
        contact: contact.trim(),
        address: address.trim(),
        avatar: initials,
        createdAt: new Date().toISOString(),
      },
    }

    customUsers.push(newAccount)
    try {
      localStorage.setItem(DEMO_CUSTOM_USERS_KEY, JSON.stringify(customUsers))
    } catch (e) {}

    const userObj = { uid: newAccount.uid, email: newAccount.email }
    setUser(userObj)
    setProfile(newAccount.profile)

    try {
      localStorage.setItem(DEMO_USER_STORAGE_KEY, JSON.stringify(userObj))
      localStorage.setItem(DEMO_PROFILE_STORAGE_KEY, JSON.stringify(newAccount.profile))
    } catch (e) {}
  }

  const signOut = async () => {
    if (DEMO_MODE) {
      setUser(null)
      setProfile(null)
      try {
        localStorage.removeItem(DEMO_USER_STORAGE_KEY)
        localStorage.removeItem(DEMO_PROFILE_STORAGE_KEY)
      } catch (e) {}
      return
    }
    await fbSignOut(auth)
  }

  const value = useMemo(() => ({
    user,
    profile,
    loading,
    signOut,
    demoLogin,
    demoRegister,
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
