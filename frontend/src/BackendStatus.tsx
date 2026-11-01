import { useEffect, useState } from 'react'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || ''

export default function BackendStatus() {
  const [status, setStatus] = useState<'checking' | 'online' | 'offline'>(
    'checking',
  )

  useEffect(() => {
    let active = true

    async function checkBackend() {
      try {
        await axios.get(`${API_URL}/api/health`, { timeout: 3000 })
        if (active) setStatus('online')
      } catch {
        if (active) setStatus('offline')
      }
    }

    checkBackend()
    const interval = window.setInterval(checkBackend, 10000)

    return () => {
      active = false
      window.clearInterval(interval)
    }
  }, [])

  const colors = {
    checking: 'text-yellow-400',
    online: 'text-green-400',
    offline: 'text-red-400',
  }

  return (
    <span className={`flex items-center gap-2 text-xs ${colors[status]}`}>
      <span className="h-2 w-2 rounded-full bg-current" />
      Backend {status}
    </span>
  )
}
