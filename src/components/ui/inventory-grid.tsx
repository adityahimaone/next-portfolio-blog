'use client'

import { ItemCard } from './item-card'

interface InventoryItem {
  name: string
  level: string
  icon: string
}

interface InventoryGridProps {
  items: InventoryItem[]
}

export function InventoryGrid({ items }: InventoryGridProps) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      {items.map((item) => (
        <ItemCard key={item.name} {...item} />
      ))}
    </div>
  )
}
