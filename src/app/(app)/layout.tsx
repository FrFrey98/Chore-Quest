import { Navigation } from '@/components/nav/navigation'
import { ToastProvider } from '@/components/toast-provider'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-slate-50">
      <Navigation />
      <ToastProvider>
        <main className="flex-1 p-4 pb-24 md:pb-4 max-w-2xl mx-auto w-full">
          {children}
        </main>
      </ToastProvider>
    </div>
  )
}
