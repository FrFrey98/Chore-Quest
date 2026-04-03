'use client'
type Category = { id: string; name: string; emoji: string; taskCount: number }
export function CategoriesTab({ categories }: { categories: Category[] }) {
  return <div className="text-slate-400 text-sm">Kategorien-Tab ({categories.length} Kategorien)</div>
}
