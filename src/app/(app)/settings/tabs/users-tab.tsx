'use client'
export function UsersTab({ users }: { users: { id: string; name: string }[] }) {
  return <div className="text-slate-400 text-sm">Benutzer-Tab ({users.length} User)</div>
}
