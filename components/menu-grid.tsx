"use client"

import type { MenuItem, OrderItem } from "@/lib/menu-data"
import { MENU_ITEMS } from "@/lib/menu-data"
import { useState, useMemo } from "react"
import Image from "next/image"
import { Search, ChevronDown } from "lucide-react"

interface MenuGridProps {
  onAddItem: (item: MenuItem) => void
  orderItems: OrderItem[]
}

const CATEGORIES = ["Vegetarian", "Non-Veg", "Snacks", "Drinks", "Staple Food"] as const

export function MenuGrid({ onAddItem, orderItems }: MenuGridProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [expandedItem, setExpandedItem] = useState<string | null>(null)

  const filteredItems = useMemo(() => {
    let items = MENU_ITEMS

    // Filter by category if selected
    if (selectedCategory) {
      items = items.filter((item) => item.category === selectedCategory)
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      items = items.filter((item) => item.title.toLowerCase().includes(query))
    }

    return items
  }, [searchQuery, selectedCategory])

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* Header - CHANGE: Removed circular elements from left and right */}
      <div className="px-4 py-6 border-b border-border">
        <h1 className="text-xl font-serif text-foreground text-center mb-6">White Lotus</h1>

        {/* Search bar with thin border */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search menu..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-border rounded-lg bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>

        {/* CHANGE: Category filter buttons with 1px black border and slide animation */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-3 py-1.5 text-sm whitespace-nowrap border transition-all ${
              selectedCategory === null
                ? "bg-foreground text-background border-foreground"
                : "bg-card text-foreground border-foreground hover:bg-muted"
            }`}
          >
            All Items
          </button>
          {CATEGORIES.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-3 py-1.5 text-sm whitespace-nowrap border transition-all ${
                selectedCategory === category
                  ? "bg-foreground text-background border-foreground"
                  : "bg-card text-foreground border-foreground hover:bg-muted"
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Responsive menu grid with slide animation */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 auto-rows-max animate-in fade-in slide-in-from-right">
          {filteredItems.map((item) => {
            const orderItem = orderItems.find((o) => o.itemId === item.id)
            const quantity = orderItem?.quantity || 0
            const isExpanded = expandedItem === item.id

            return (
              <div
                key={item.id}
                className="flex flex-col bg-card rounded-lg overflow-hidden border border-border hover:border-primary/50 transition-colors"
              >
                {/* Product image */}
                <div className="relative w-full aspect-square bg-muted">
                  <Image src={item.image || "/placeholder.svg"} alt={item.title} fill className="object-cover" />
                </div>

                {/* Product info */}
                <div className="flex-1 flex flex-col p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <h3 className="font-medium text-sm line-clamp-1 text-foreground mb-1">{item.title}</h3>
                      <p className="text-primary font-semibold text-sm">{`₹${item.price}`}</p>
                    </div>
                    {/* CHANGE: Dropdown icon for description */}
                    <button
                      onClick={() => setExpandedItem(isExpanded ? null : item.id)}
                      className="p-1 hover:bg-muted rounded transition-transform"
                    >
                      <ChevronDown
                        className={`w-4 h-4 text-muted-foreground transition-transform ${
                          isExpanded ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                  </div>

                  {/* CHANGE: Description drawer */}
                  {isExpanded && (
                    <p className="text-xs text-muted-foreground mt-2 mb-2 line-clamp-2">{item.description}</p>
                  )}

                  {/* Add button */}
                  <button
                    onClick={() => onAddItem(item)}
                    className="w-full px-3 py-2 bg-accent text-accent-foreground rounded-lg font-medium text-sm hover:bg-accent/90 transition-colors mt-auto"
                  >
                    {quantity > 0 ? `Add (${quantity})` : "Add"}
                  </button>
                </div>
              </div>
            )
          })}
        </div>

        {filteredItems.length === 0 && (
          <div className="flex items-center justify-center h-full">
            <p className="text-muted-foreground">No items found</p>
          </div>
        )}
      </div>
    </div>
  )
}
