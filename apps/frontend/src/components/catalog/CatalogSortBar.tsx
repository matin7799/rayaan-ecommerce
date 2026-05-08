'use client'

import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { cn } from '@/lib/utils'
import { ArrowUpDown } from 'lucide-react'

const sortOptions = [
  { value: 'newest', label: 'جدیدترین', sortBy: 'createdAt', sortOrder: 'DESC' },
  { value: 'title', label: 'نام محصول', sortBy: 'name', sortOrder: 'ASC' },
  { value: 'price_asc', label: 'ارزان‌ترین', sortBy: 'basePrice', sortOrder: 'ASC' },
  { value: 'price_desc', label: 'گران‌ترین', sortBy: 'basePrice', sortOrder: 'DESC' },
]

export function SortBar() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  
  // Determine current sort based on sortBy and sortOrder params
  const sortBy = searchParams.get('sortBy')
  const sortOrder = searchParams.get('sortOrder')
  const currentSort = sortOptions.find(
    opt => opt.sortBy === sortBy && opt.sortOrder === sortOrder
  )?.value || 'newest'

  const handleSort = (value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    const option = sortOptions.find(opt => opt.value === value)
    
    if (option) {
      params.set('sortBy', option.sortBy)
      params.set('sortOrder', option.sortOrder)
    } else {
      params.delete('sortBy')
      params.delete('sortOrder')
    }
    params.delete('page')
    router.push(`${pathname}?${params.toString()}`, { scroll: false })
  }

  return (
    <div className="relative flex items-center gap-4 p-3 rounded-2xl bg-white/50 dark:bg-zinc-900/50 backdrop-blur-xl border border-zinc-200/50 dark:border-zinc-800/50 shadow-sm transition-all overflow-hidden">
      <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400 shrink-0 border-l border-zinc-200 dark:border-zinc-800 pl-4 ml-2">
        <ArrowUpDown className="w-4 h-4" />
        <span className="text-sm font-medium hidden sm:inline-block">مرتب‌سازی بر اساس:</span>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar scroll-smooth pb-1 -mb-1 w-full">
        {sortOptions.map((option) => {
          const isActive = currentSort === option.value
          return (
            <button
              key={option.value}
              onClick={() => handleSort(option.value)}
              className={cn(
                "whitespace-nowrap px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300",
                isActive
                  ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 shadow-md"
                  : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/50 hover:text-zinc-900 dark:hover:text-white"
              )}
            >
              {option.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}
