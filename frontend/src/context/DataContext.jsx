import { createContext, useContext, useEffect, useState } from 'react'
import { DEMO_MODE, db } from '../firebase'
import seedSurplus from '../data/surplus.json'
import seedNgos from '../data/ngos.json'
import { collection, onSnapshot, addDoc, doc, updateDoc, serverTimestamp, getDocs, deleteDoc, setDoc } from 'firebase/firestore'
import { toast } from '../components/Toast.jsx'

const DataContext = createContext(null)

const INITIAL_SURPLUS_KEY = 'zerobite_demo_surplus'
const INITIAL_ACCEPTED_KEY = 'zerobite_demo_accepted'
const INITIAL_EMERGENCY_KEY = 'zerobite_demo_emergency'

export function DataProvider({ children }) {
  // Initialize surplus items
  const [surplusItems, setSurplusItems] = useState(() => {
    if (!DEMO_MODE) return []
    try {
      const saved = localStorage.getItem(INITIAL_SURPLUS_KEY)
      if (saved) return JSON.parse(saved)
    } catch (e) {
      console.error(e)
    }
    return seedSurplus.map((s, i) => ({
      ...s,
      id: `local-${i + 1}`,
      createdAt: new Date(Date.now() - i * 3600000).toISOString(),
    }))
  })

  // Initialize accepted pickups
  const [acceptedItems, setAcceptedItems] = useState(() => {
    if (!DEMO_MODE) return []
    try {
      const saved = localStorage.getItem(INITIAL_ACCEPTED_KEY)
      if (saved) return JSON.parse(saved)
    } catch (e) {
      console.error(e)
    }
    return seedSurplus.slice(0, 6).map((s, i) => ({
      id: `mock-accepted-${i + 1}`,
      surplusId: `local-${i + 1}`,
      donor: s.donor,
      location: s.location,
      foodType: s.foodType,
      quantity: s.quantity,
      predictedSurplus: s.predictedSurplus,
      status: 'Accepted',
      acceptedBy: 'FoodAid Trust',
      createdAt: new Date(Date.now() - (i + 1) * 3600000).toISOString(),
      acceptedAt: new Date(Date.now() - (i + 1) * 3600000 + 900000).toISOString(),
    }))
  })

  // NGOs list
  const [ngos, setNgos] = useState(seedNgos)

  // Emergency mode state
  const [emergencyActive, setEmergencyActive] = useState(() => {
    if (!DEMO_MODE) return false
    try {
      return localStorage.getItem(INITIAL_EMERGENCY_KEY) === 'true'
    } catch (e) {
      return false
    }
  })

  // Persist demo state changes
  useEffect(() => {
    if (DEMO_MODE) {
      try {
        localStorage.setItem(INITIAL_SURPLUS_KEY, JSON.stringify(surplusItems))
      } catch (e) {}
    }
  }, [surplusItems])

  useEffect(() => {
    if (DEMO_MODE) {
      try {
        localStorage.setItem(INITIAL_ACCEPTED_KEY, JSON.stringify(acceptedItems))
      } catch (e) {}
    }
  }, [acceptedItems])

  useEffect(() => {
    if (DEMO_MODE) {
      try {
        localStorage.setItem(INITIAL_EMERGENCY_KEY, String(emergencyActive))
      } catch (e) {}
    }
  }, [emergencyActive])

  // Live Firebase sync if not in DEMO_MODE
  useEffect(() => {
    if (DEMO_MODE) return

    const unsubSurplus = onSnapshot(collection(db, 'surplus'), (snap) => {
      setSurplusItems(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    })

    const unsubAccepted = onSnapshot(collection(db, 'accepted'), (snap) => {
      setAcceptedItems(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    })

    const unsubNgos = onSnapshot(collection(db, 'ngos'), (snap) => {
      if (!snap.empty) {
        setNgos(snap.docs.map(d => ({ id: d.id, ...d.data() })))
      }
    })

    return () => {
      unsubSurplus()
      unsubAccepted()
      unsubNgos()
    }
  }, [])

  // Action: Add new surplus alert (from EventPrediction or Donor form)
  const addSurplusItem = async (newItem) => {
    if (DEMO_MODE) {
      const created = {
        ...newItem,
        id: `local-${Date.now()}`,
        status: 'Active',
        createdAt: new Date().toISOString(),
      }
      setSurplusItems(prev => [created, ...prev])
      return created
    }

    try {
      const docRef = await addDoc(collection(db, 'surplus'), {
        ...newItem,
        status: 'Active',
        createdAt: serverTimestamp(),
      })
      return { id: docRef.id, ...newItem }
    } catch (e) {
      console.error(e)
      throw e
    }
  }

  // Action: Accept surplus pickup
  const acceptSurplusItem = async (surplusId, ngoName = 'Your NGO') => {
    const item = surplusItems.find(x => x.id === surplusId)
    if (!item) return

    if (DEMO_MODE) {
      setSurplusItems(prev => prev.map(x => x.id === surplusId ? { ...x, status: 'Accepted' } : x))
      const acceptedRecord = {
        id: `accepted-${Date.now()}`,
        surplusId,
        donor: item.donor,
        donorId: item.donorId || null,
        location: item.location,
        foodType: item.foodType,
        quantity: item.quantity ?? item.predictedSurplus ?? 0,
        predictedSurplus: item.predictedSurplus ?? item.quantity ?? 0,
        acceptedBy: ngoName,
        status: 'Accepted',
        createdAt: item.createdAt || new Date().toISOString(),
        acceptedAt: new Date().toISOString(),
      }
      setAcceptedItems(prev => [acceptedRecord, ...prev])
      return
    }

    try {
      await updateDoc(doc(db, 'surplus', surplusId), { status: 'Accepted' })
      await addDoc(collection(db, 'accepted'), {
        surplusId,
        donor: item.donor,
        donorId: item.donorId || null,
        location: item.location,
        foodType: item.foodType,
        quantity: item.quantity ?? item.predictedSurplus ?? 0,
        predictedSurplus: item.predictedSurplus ?? item.quantity ?? 0,
        acceptedBy: ngoName,
        status: 'Accepted',
        createdAt: item.createdAt || serverTimestamp(),
        acceptedAt: serverTimestamp(),
      })
    } catch (e) {
      console.error(e)
      throw e
    }
  }

  // Action: Reject surplus
  const rejectSurplusItem = async (surplusId) => {
    if (DEMO_MODE) {
      setSurplusItems(prev => prev.map(x => x.id === surplusId ? { ...x, status: 'Rejected' } : x))
      return
    }

    try {
      await updateDoc(doc(db, 'surplus', surplusId), { status: 'Rejected', rejectedAt: serverTimestamp() })
    } catch (e) {
      console.error(e)
      throw e
    }
  }

  // Action: Toggle emergency mode
  const toggleEmergency = () => {
    setEmergencyActive(prev => !prev)
  }

  // Action: Reset all demo data to initial state
  const resetDemoState = async () => {
    const defaultSurplus = seedSurplus.map((s, i) => ({
      ...s,
      id: `local-${i + 1}`,
      createdAt: new Date(Date.now() - i * 3600000).toISOString(),
    }))
    const defaultAccepted = seedSurplus.slice(0, 6).map((s, i) => ({
      id: `mock-accepted-${i + 1}`,
      surplusId: `local-${i + 1}`,
      donor: s.donor,
      location: s.location,
      foodType: s.foodType,
      quantity: s.quantity,
      predictedSurplus: s.predictedSurplus,
      status: 'Accepted',
      acceptedBy: 'FoodAid Trust',
      createdAt: new Date(Date.now() - (i + 1) * 3600000).toISOString(),
      acceptedAt: new Date(Date.now() - (i + 1) * 3600000 + 900000).toISOString(),
    }))

    if (DEMO_MODE) {
      setSurplusItems(defaultSurplus)
      setAcceptedItems(defaultAccepted)
      setEmergencyActive(false)
      localStorage.removeItem(INITIAL_SURPLUS_KEY)
      localStorage.removeItem(INITIAL_ACCEPTED_KEY)
      localStorage.removeItem(INITIAL_EMERGENCY_KEY)
      toast('Demo state restored! Sample donations are active.', 'success')
      return
    }

    try {
      const sSnap = await getDocs(collection(db, 'surplus'))
      await Promise.all(sSnap.docs.map(d => deleteDoc(doc(db, 'surplus', d.id))))
      const aSnap = await getDocs(collection(db, 'accepted'))
      await Promise.all(aSnap.docs.map(d => deleteDoc(doc(db, 'accepted', d.id))))
      await Promise.all(seedSurplus.map(s => addDoc(collection(db, 'surplus'), {
        ...s,
        createdAt: serverTimestamp(),
      })))
      toast('Demo state restored successfully on Firestore.', 'success')
    } catch (e) {
      console.error(e)
      toast('Failed to reset demo state.', 'error')
    }
  }

  const value = {
    surplusItems,
    acceptedItems,
    ngos,
    emergencyActive,
    addSurplusItem,
    acceptSurplusItem,
    rejectSurplusItem,
    toggleEmergency,
    resetDemoState,
  }

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  )
}

export function useData() {
  const context = useContext(DataContext)
  if (!context) {
    throw new Error('useData must be used within a DataProvider')
  }
  return context
}
