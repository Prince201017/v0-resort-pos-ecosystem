"use client"

import Link from "next/link"
import { Users } from "lucide-react"

import { useState, useEffect, useCallback } from "react"
import type { MenuItem, OrderItem } from "@/lib/menu-data"
import { MenuGrid } from "@/components/menu-grid"
import { OrderSummary } from "@/components/order-summary"
import { OrderReceipt } from "@/components/order-receipt"
import { getWebSocketClient } from "@/lib/websocket-client"

export default function Home() {
  const [orderItems, setOrderItems] = useState<OrderItem[]>([])
  const [isCheckingOut, setIsCheckingOut] = useState(false)
  const [tokenNumber, setTokenNumber] = useState<number | null>(null)
  const [showReceipt, setShowReceipt] = useState(false)
  const [wsConnected, setWsConnected] = useState(false)

  // Initialize WebSocket
  useEffect(() => {
    const wsClient = getWebSocketClient()

    const unsubConnected = wsClient.on("connected", () => {
      console.log("[v0] Connected to order system")
      setWsConnected(true)
    })

    const unsubDisconnected = wsClient.on("disconnected", () => {
      console.log("[v0] Disconnected from order system")
      setWsConnected(false)
    })

    // Connect with fallback for demo
    if (typeof window !== "undefined") {
      try {
        wsClient.connect()
      } catch {
        console.log("[v0] WebSocket demo mode - orders saved locally")
        setWsConnected(true) // Demo mode
      }
    }

    return () => {
      unsubConnected()
      unsubDisconnected()
    }
  }, [])

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

  const handleCheckout = async () => {
    if (orderItems.length === 0) return

    setIsCheckingOut(true)

    try {
      // Generate token number (1-100 for demo)
      const token = Math.floor(Math.random() * 100) + 1
      setTokenNumber(token)

      // Prepare order message
      const subtotal = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
      const serviceCharge = 10
      const total = subtotal + serviceCharge

      const orderMessage = {
        type: "order_submitted",
        tokenNumber: token,
        items: orderItems.map((item) => ({
          title: item.title,
          quantity: item.quantity,
          price: item.price,
        })),
        subtotal,
        serviceCharge,
        total,
        timestamp: new Date().toISOString(),
      }

      // Send via WebSocket if connected
      const wsClient = getWebSocketClient()
      if (wsClient.isConnected()) {
        wsClient.send(orderMessage)
        console.log("[v0] Order sent via WebSocket:", orderMessage)
      } else {
        // Demo mode: just log locally
        console.log("[v0] Order (demo mode):", orderMessage)
      }

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

      {/* Connection indicator */}
      {!wsConnected && (
        <div className="fixed bottom-4 right-4 px-3 py-2 bg-muted text-muted-foreground text-xs rounded-lg">
          Demo Mode (Local Orders)
        </div>
      )}
    </main>
  )
}
