"use client"

import { useEffect, useState } from "react"
import type { OrderItem } from "@/lib/menu-data"
import { SERVICE_CHARGE } from "@/lib/menu-data"
import { Printer, ArrowLeft } from "lucide-react"
import { printViaBluetoothPrinter } from "@/lib/bluetooth-printer"

interface OrderReceiptProps {
  tokenNumber: number
  items: OrderItem[]
  onBack: () => void
}

export function OrderReceipt({ tokenNumber, items, onBack }: OrderReceiptProps) {
  const [currentTime, setCurrentTime] = useState<string>("")
  const [isPrinting, setIsPrinting] = useState(false)
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("")

  useEffect(() => {
    const now = new Date()
    const dateString = now.toLocaleDateString("en-IN")
    const timeString = now.toLocaleTimeString("en-IN")
    setCurrentTime(`${dateString} ${timeString}`)

    // Robust calculation for QR code
    const calculatedSubtotal = parseFloat(
      items.reduce((sum, item) => {
        const itemPrice = typeof item.price === 'string' ? parseFloat(item.price) : item.price
        const itemQty = typeof item.quantity === 'string' ? parseInt(item.quantity, 10) : item.quantity
        return sum + (itemPrice * itemQty)
      }, 0).toFixed(2)
    )

    // Generate QR code with order data
    const orderData = {
      tokenNumber,
      items,
      subtotal: calculatedSubtotal,
      total: parseFloat((calculatedSubtotal + SERVICE_CHARGE).toFixed(2)),
      timestamp: `${dateString} ${timeString}`,
    }

    // Create QR code URL using external API (no dependencies)
    const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(JSON.stringify(orderData))}`
    setQrCodeUrl(qrApiUrl)
  }, [tokenNumber, items])

  // Robust subtotal and total calculation
  const subtotal = parseFloat(
    items.reduce((sum, item) => {
      const itemPrice = typeof item.price === 'string' ? parseFloat(item.price) : item.price
      const itemQty = typeof item.quantity === 'string' ? parseInt(item.quantity, 10) : item.quantity
      return sum + (itemPrice * itemQty)
    }, 0).toFixed(2)
  )
  const total = parseFloat((subtotal + SERVICE_CHARGE).toFixed(2))

  // Format receipt text for Bluetooth printing
  const formatReceiptText = (): string => {
    const lines: string[] = [
      "================================",
      "         Welcome to",
      "         WHITE LOTUS",
      "      Premium Resort Dining",
      "================================",
      "",
      "              TOKEN",
      `              ${String(tokenNumber).padStart(3, "0")}`,
      "           Your order number",
      "",
      "================================",
      "               ITEMS",
    ]

    items.forEach((item) => {
      const quantity = `x${item.quantity}`
      const price = `₹${item.price * item.quantity}`
      const padding = Math.max(0, 32 - item.title.length - quantity.length - price.length)
      lines.push(`${item.title}${" ".repeat(padding)}${quantity} ${price}`)
    })

    lines.push("================================")
    lines.push(`Subtotal                  ₹${subtotal.toFixed(2)}`)
    lines.push(`Service Charge            ₹${SERVICE_CHARGE.toFixed(2)}`)
    lines.push("--------------------------------")
    lines.push(`TOTAL                     ₹${total.toFixed(2)}`)
    lines.push("================================")
    lines.push("")
    lines.push(currentTime)
    lines.push("   Thank you for your order!")
    lines.push("   Please wait at the counter")
    lines.push("")
    lines.push("Show this receipt at counter")
    lines.push("     to collect your order")

    return lines.join("\n")
  }

  const handlePrint = async () => {
    setIsPrinting(true)
    try {
      console.log("[v0] User initiated print receipt")
      const receiptText = formatReceiptText()
      const success = await printViaBluetoothPrinter(receiptText)

      if (success) {
        console.log("[v0] Print successful, auto-checking out")
        // Auto-checkout after successful print
        setTimeout(() => {
          console.log("[v0] Refreshing page for new order")
          window.location.reload()
        }, 1000)
      } else {
        console.log("[v0] Print was cancelled or failed")
        alert("Print cancelled. Your order is still available.")
      }
    } catch (error) {
      console.error("[v0] Print failed:", error)
      alert("Failed to print receipt. Please try again.")
    } finally {
      setIsPrinting(false)
    }
  }

  return (
    <div className="h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 to-accent/5 p-4">
      <div className="w-full max-w-sm bg-card rounded-xl shadow-lg border border-border overflow-hidden">
        {/* Receipt Paper */}
        <div className="bg-white text-black p-8 space-y-6 text-center print:shadow-none">
          {/* Resort Name */}
          <div className="space-y-1">
            <p className="text-xs text-gray-600">Welcome to</p>
            <h1 className="text-3xl font-serif font-bold tracking-tight">White Lotus</h1>
            <p className="text-xs text-gray-600">Premium Resort Dining</p>
          </div>

          {/* Token Number - Large and prominent */}
          <div className="py-4 border-t border-b border-gray-300 space-y-2">
            <p className="text-xs text-gray-600 uppercase tracking-widest">Token</p>
            <p className="text-6xl font-bold text-primary">{String(tokenNumber).padStart(3, "0")}</p>
            <p className="text-xs text-gray-600">Your order number</p>
          </div>

          {/* Order Details */}
          <div className="space-y-2 text-left">
            <p className="text-xs font-semibold text-gray-600 uppercase tracking-widest text-center">Items</p>
            <div className="space-y-1">
              {items.map((item) => (
                <div key={item.itemId} className="flex justify-between text-sm">
                  <span className="flex-1">{item.title}</span>
                  <span className="px-2">×{item.quantity}</span>
                  <span className="text-right w-16">₹{item.price * item.quantity}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Totals */}
          <div className="border-t border-gray-300 pt-3 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Subtotal</span>
              <span>₹{subtotal}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Service Charge</span>
              <span>₹{SERVICE_CHARGE}</span>
            </div>
            <div className="flex justify-between font-bold text-base pt-2 border-t border-gray-300">
              <span>Total</span>
              <span>₹{total}</span>
            </div>
          </div>

          {/* Date and Time */}
          <div className="text-xs text-gray-600 space-y-1 border-t border-gray-300 pt-4">
            <p>{currentTime}</p>
            <p>Thank you for your order!</p>
            <p className="text-xs">Please wait at the counter</p>
          </div>

          {/* QR Code */}
          {qrCodeUrl && (
            <div className="flex flex-col items-center gap-2 border-t border-gray-300 pt-4">
              <p className="text-xs text-gray-600 font-semibold">Scan at Counter</p>
              <img src={qrCodeUrl || "/placeholder.svg"} alt="Order QR Code" className="w-24 h-24 border border-gray-300" />
            </div>
          )}

          <div className="text-xs text-gray-500 italic">Show this receipt to the counter and collect the Bill</div>
        </div>

        <div className="bg-muted p-4 flex gap-2">
          <button
            onClick={onBack}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-muted hover:bg-muted/80 text-foreground rounded-lg font-medium transition-colors no-print"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          <button
            onClick={handlePrint}
            disabled={isPrinting}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Printer className="w-4 h-4" />
            {isPrinting ? "Printing..." : "Print Receipt"}
          </button>
        </div>

        {/* Hidden print styles */}
        <style>{`
          @media print {
            body {
              margin: 0;
              padding: 0;
              background: white;
            }
            * {
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
              color-adjust: exact;
            }
            .no-print {
              display: none !important;
            }
          }
        `}</style>
      </div>
    </div>
  )
}
