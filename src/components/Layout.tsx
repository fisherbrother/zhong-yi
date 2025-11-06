import { useEffect } from 'react'
import { useAuthStore } from '../stores/authStore'
import { Navigation } from '../components/Navigation'
import { ToastProvider } from '../components/ToastProvider'

export function Layout({ children }: { children: React.ReactNode }) {
  const { checkUser } = useAuthStore()

  useEffect(() => {
    checkUser()
  }, [checkUser])

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <main className="min-h-screen">
        {children}
      </main>
      <ToastProvider />
    </div>
  )
}