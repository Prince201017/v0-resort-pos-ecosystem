"use client"

import type { OrderItem } from "@/lib/menu-data"
import { SERVICE_CHARGE } from "@/lib/menu-data"
import { useState } from "react"
import { ChevronDown, ChevronUp, Trash2 } from "lucide-react"

interface OrderSummaryProps {
  items: OrderItem[]
  onRemoveItem: (itemId: string) => void
  onUpdateQuantity: (itemId: string, quantity: number) => void
  onCheckout: () => void
  isLoading?: boolean
}

export function OrderSummary({ items, onRemoveItem, onUpdateQuantity, onCheckout, isLoading }: OrderSummaryProps) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const total = subtotal + SERVICE_CHARGE

  return (
    <div className="border-t border-border bg-card">
      {/* Order summary bar */}
      <button
        onClick={() => setIsDrawerOpen(!isDrawerOpen)}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-muted transition-colors"
      >
        <div className="flex-1 text-left">
          <p className="text-sm text-muted-foreground">Your order</p>
          <p className="text-sm font-semibold text-foreground">
            {items.length} item{items.length !== 1 ? "s" : ""} • Subtotal: ₹{subtotal}
          </p>
        </div>
        {isDrawerOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
      </button>

      {/* Drawer */}
      {isDrawerOpen && (
        <div className="border-t border-border max-h-64 overflow-y-auto">
          {items.length > 0 ? (
            <div className="p-4 space-y-3">
              {items.map((item) => (
                <div
                  key={item.itemId}
                  className="flex items-center justify-between gap-3 pb-3 border-b border-border last:border-0"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground line-clamp-1">{item.title}</p>
                    <p className="text-xs text-muted-foreground">₹{item.price}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onUpdateQuantity(item.itemId, Math.max(0, item.quantity - 1))}
                      className="p-1 hover:bg-muted rounded"
                    >
                      <ChevronDown className="w-4 h-4" />
                    </button>
                    <span className="text-sm font-medium w-6 text-center">{item.quantity}</span>
                    <button
                      onClick={() => onUpdateQuantity(item.itemId, item.quantity + 1)}
                      className="p-1 hover:bg-muted rounded"
                    >
                      <ChevronUp className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onRemoveItem(item.itemId)}
                      className="p-1 hover:bg-destructive/10 rounded text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}

              <div className="pt-3 space-y-1 border-t border-border">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium">₹{subtotal}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Service Charge</span>
                  <span className="font-medium">₹{SERVICE_CHARGE}</span>
                </div>
                <div className="flex justify-between text-base font-semibold pt-2">
                  <span>Total</span>
                  <span className="text-primary">₹{total}</span>
                </div>
              </div>

              <button
                onClick={onCheckout}
                disabled={isLoading}
                className="w-full mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors"
              >
                {isLoading ? "Processing..." : "Checkout"}
              </button>
            </div>
          ) : (
            <div className="p-4 text-center">
              <p className="text-sm text-muted-foreground">No items in order</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
