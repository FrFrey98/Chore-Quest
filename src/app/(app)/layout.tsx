import { Navigation } from '@/components/nav/navigation'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-slate-50">
      <Navigation />
      <main className="flex-1 p-4 md:p-8 pb-24 md:pb-8 max-w-3xl w-full mx-auto">
        {children}
      </main>
    </div>
  )
}
