"use client"

import { useState, useCallback } from "react"
import type { MenuItem, OrderItem } from "@/lib/menu-data"
import { MenuGrid } from "@/components/menu-grid"
import { OrderSummary } from "@/components/order-summary"
import { OrderReceipt } from "@/components/order-receipt"

export default function Home() {
  const [orderItems, setOrderItems] = useState<OrderItem[]>([])
  const [isCheckingOut, setIsCheckingOut] = useState(false)
  const [tokenNumber, setTokenNumber] = useState<number | null>(null)
  const [showReceipt, setShowReceipt] = useState(false)

  const handleAddItem = useCallback((item: MenuItem) => {
    setOrderItems((prev) => {
      const existingItem = prev.find((o) => o.itemId === item.id)
      if (existingItem) {
        return prev.map((o) => (o.itemId === item.id ? { ...o, quantity: o.quantity + 1 } : o))
      }
      return [
        ...prev,
        {
          itemId: item.id,
          title: item.title,
          price: item.price,
          quantity: 1,
        },
      ]
    })
  }, [])

  const handleRemoveItem = useCallback((itemId: string) => {
    setOrderItems((prev) => prev.filter((o) => o.itemId !== itemId))
  }, [])

  const handleUpdateQuantity = useCallback((itemId: string, quantity: number) => {
    setOrderItems((prev) => {
      if (quantity <= 0) {
        return prev.filter((o) => o.itemId !== itemId)
      }
      return prev.map((o) => (o.itemId === itemId ? { ...o, quantity } : o))
    })
  }, [])

  const handleCheckout = () => {
    if (orderItems.length === 0) return

    setIsCheckingOut(true)

    try {
      // Generate token number (1-100 for demo)
      const token = Math.floor(Math.random() * 100) + 1
      setTokenNumber(token)

      // Calculate totals with proper math
      const subtotal = orderItems.reduce((sum, item) => {
        const itemTotal = parseFloat((item.price * item.quantity).toFixed(2))
        console.log(`[v0] Item: ${item.title}, Price: ${item.price}, Qty: ${item.quantity}, Total: ${itemTotal}`)
        return sum + itemTotal
      }, 0)
      
      const finalSubtotal = parseFloat(subtotal.toFixed(2))
      console.log(`[v0] Final Subtotal: ${finalSubtotal}`)

      // Show receipt
      setShowReceipt(true)
    } catch (error) {
      console.error("[v0] Checkout error:", error)
    } finally {
      setIsCheckingOut(false)
    }
  }

  // CHANGE: Handle back button from receipt - clears order and returns to menu
  const handleBackFromReceipt = () => {
    setShowReceipt(false)
    // NOTE: Order stays intact - will only clear on successful print via page reload
  }

  return (
    <main className="h-screen flex flex-col bg-background text-foreground">
      {showReceipt && tokenNumber ? (
        <OrderReceipt tokenNumber={tokenNumber} items={orderItems} onBack={handleBackFromReceipt} />
      ) : (
        <>
          <MenuGrid onAddItem={handleAddItem} orderItems={orderItems} />
          <OrderSummary
            items={orderItems}
            onRemoveItem={handleRemoveItem}
            onUpdateQuantity={handleUpdateQuantity}
            onCheckout={handleCheckout}
            isLoading={isCheckingOut}
          />
        </>
      )}


    </main>
  )
}
