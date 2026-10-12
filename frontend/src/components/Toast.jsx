import { useEffect, useState } from 'react'

let emit
let lastMessage = ''
let lastMessageTime = 0

export function toast(message, type = 'success', duration = 2000) {
  const now = Date.now()
  // Suppress duplicate toasts fired in rapid succession (e.g. React StrictMode or re-renders)
  if (message === lastMessage && now - lastMessageTime < 1500) {
    return
  }
  lastMessage = message
  lastMessageTime = now

  if (emit) {
    emit({
      id: `${now}-${Math.random().toString(36).slice(2, 7)}`,
      message,
      type,
      duration,
    })
  }
}

export default function Toast() {
  const [items, setItems] = useState([])

  const removeToast = (id) => {
    setItems((prev) => prev.filter((i) => i.id !== id))
  }

  useEffect(() => {
    emit = (item) => {
      setItems((prev) => {
        // Keep at most 3 active toasts
        const trimmed = prev.length >= 3 ? prev.slice(1) : prev
        return [...trimmed, item]
      })

      const timeoutMs = item.duration || 2000
      setTimeout(() => {
        setItems((prev) => prev.filter((i) => i.id !== item.id))
      }, timeoutMs)
    }

    return () => {
      emit = undefined
    }
  }, [])

  const styles = {
    success: 'bg-primary-600 text-white',
    info: 'bg-blue-600 text-white',
    warning: 'bg-amber-500 text-gray-900',
    error: 'bg-red-600 text-white',
  }

  const icons = {
    success: '✅',
    info: 'ℹ️',
    warning: '⚠️',
    error: '❌',
  }

  return (
    <div
      className="fixed top-5 right-5 z-50 pointer-events-none flex flex-col gap-2.5"
      aria-live="polite"
      role="status"
    >
      {items.map((i) => (
        <div
          key={i.id}
          onClick={() => removeToast(i.id)}
          title="Click to dismiss"
          className={`pointer-events-auto rounded-xl shadow-lg px-4 py-2.5 w-80 max-w-[90vw] animate-toast-in cursor-pointer select-none transition-all hover:opacity-90 active:scale-95 flex items-center justify-between gap-3 ${
            styles[i.type] || styles.success
          }`}
        >
          <div className="flex items-center gap-2.5 flex-1 min-w-0">
            <span className="text-lg leading-none shrink-0">{icons[i.type] || '✅'}</span>
            <span className="text-xs font-semibold leading-snug break-words">{i.message}</span>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation()
              removeToast(i.id)
            }}
            aria-label="Close notification"
            className="text-current opacity-70 hover:opacity-100 text-sm font-bold p-1 rounded hover:bg-black/10 shrink-0 leading-none"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  )
}
