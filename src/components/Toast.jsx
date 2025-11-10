import { useEffect, useState } from 'react'

let emit

export function toast(message, type = 'success') {
  if (emit) emit({ id: Date.now(), message, type })
}

export default function Toast() {
  const [items, setItems] = useState([])

  useEffect(() => {
    emit = (item) => {
      setItems((prev) => [...prev, item])
      setTimeout(() => {
        setItems((prev) => prev.filter((i) => i.id !== item.id))
      }, 3600)
    }
    return () => { emit = undefined }
  }, [])

  const styles = {
    success: 'bg-primary-600 text-white',
    info: 'bg-blue-600 text-white',
    warning: 'bg-yellow-500 text-gray-900',
    error: 'bg-red-600 text-white',
  }

  return (
    <div className="fixed top-6 right-6 z-50 pointer-events-none" aria-live="polite" role="status">
      <div className="space-y-3">
        {items.map((i) => (
          <div
            key={i.id}
            className={`pointer-events-auto rounded-xl shadow-soft px-4 py-3 w-80 max-w-[90vw] animate-toast-in ${styles[i.type] || styles.success}`}
          >
            <div className="flex items-start gap-3">
              <span className="text-xl leading-none">✅</span>
              <span className="text-sm font-medium">{i.message}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
