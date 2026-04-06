import { Navigation } from '@/components/nav/navigation'
import { ToastProvider } from '@/components/toast-provider'
import { ApprovalBanner } from '@/components/nav/approval-banner'
import { SwRegister } from '@/components/pwa/sw-register'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-slate-50">
      <Navigation />
      <ToastProvider>
        <SwRegister />
        <main className="flex-1 p-4 pb-24 md:pb-4 max-w-2xl mx-auto w-full">
          <ApprovalBanner />
          {children}
        </main>
      </ToastProvider>
    </div>
  )
}
