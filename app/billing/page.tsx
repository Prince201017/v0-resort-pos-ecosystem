'use client'

import { useState, useRef, useEffect } from 'react'
import { Scan, X, Printer, ArrowLeft, Plus, Minus, Trash2, Home } from 'lucide-react'
import type { OrderItem } from '@/lib/menu-data'
import { SERVICE_CHARGE } from '@/lib/menu-data'
import Link from 'next/link'

interface ScannedOrder {
  tokenNumber: number
  items: OrderItem[]
  subtotal: number
  total: number
  timestamp: string
}

export default function BillingApp() {
  const [scannedOrder, setScannedOrder] = useState<ScannedOrder | null>(null)
  const [scannerActive, setScannerActive] = useState(false)
  const [orderItems, setOrderItems] = useState<OrderItem[]>([])
  const [staffNotes, setStaffNotes] = useState('')
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Decode QR code data
  const handleQRScan = (qrData: string) => {
    try {
      const orderData = JSON.parse(qrData)
      setScannedOrder(orderData)
      setOrderItems(orderData.items)
      setScannerActive(false)
      if (videoRef.current?.srcObject) {
        (videoRef.current.srcObject as MediaStream).getTracks().forEach(track => track.stop())
      }
    } catch (error) {
      console.error('[v0] Failed to parse QR data:', error)
      alert('Invalid QR code. Please try again.')
    }
  }

  // Start camera
  const startCamera = async () => {
    try {
      setScannerActive(true)
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } }
      })
      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }
    } catch (error) {
      console.error('[v0] Camera access denied:', error)
      alert('Camera access denied. Please enable camera permissions.')
      setScannerActive(false)
    }
  }

  // Stop camera
  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      (videoRef.current.srcObject as MediaStream).getTracks().forEach(track => track.stop())
    }
    setScannerActive(false)
  }

  // Manual input
  const handleManualInput = () => {
    const input = prompt('Enter QR code data or paste order JSON:')
    if (input) {
      handleQRScan(input)
    }
  }

  // Update item quantity
  const updateItemQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      setOrderItems(orderItems.filter(item => item.itemId !== itemId))
    } else {
      setOrderItems(orderItems.map(item =>
        item.itemId === itemId ? { ...item, quantity } : item
      ))
    }
  }

  // Remove item
  const removeItem = (itemId: string) => {
    setOrderItems(orderItems.filter(item => item.itemId !== itemId))
  }

  // Calculate totals
  const subtotal = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const total = subtotal + SERVICE_CHARGE

  // Print bill
  const handlePrintBill = () => {
    window.print()
    setTimeout(() => {
      clearOrder()
    }, 500)
  }

  // Clear order
  const clearOrder = () => {
    setScannedOrder(null)
    setOrderItems([])
    setStaffNotes('')
  }

  // Render bill
  if (scannedOrder) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 to-accent/5">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b border-border">
          <div className="max-w-7xl mx-auto px-4 md:px-8 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={clearOrder}
                className="flex items-center gap-2 px-4 py-2 text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-muted"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="hidden sm:inline">Back</span>
              </button>
              <h1 className="text-xl md:text-2xl font-semibold text-foreground">
                Order #{String(scannedOrder.tokenNumber).padStart(3, '0')}
              </h1>
            </div>
            <Link
              href="/"
              className="flex items-center gap-2 px-4 py-2 text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-muted"
            >
              <Home className="w-5 h-5" />
              <span className="hidden sm:inline">Menu</span>
            </Link>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left - Item Management */}
            <div className="lg:col-span-2 space-y-6">
              {/* Items Editor */}
              <div className="bg-card rounded-lg shadow-md border border-border p-6">
                <h2 className="text-lg font-semibold text-foreground mb-4">Edit Items</h2>

                {orderItems.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">No items in order</p>
                ) : (
                  <div className="space-y-3">
                    {orderItems.map((item) => (
                      <div
                        key={item.itemId}
                        className="flex items-center justify-between p-4 bg-muted rounded-lg hover:bg-muted/80 transition-colors border border-border/50"
                      >
                        <div className="flex-1">
                          <p className="font-medium text-foreground">{item.title}</p>
                          <p className="text-sm text-muted-foreground">₹{item.price} each</p>
                        </div>

                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => updateItemQuantity(item.itemId, item.quantity - 1)}
                            className="p-2 hover:bg-background rounded-lg transition-colors"
                          >
                            <Minus className="w-4 h-4 text-muted-foreground" />
                          </button>
                          <span className="w-8 text-center font-semibold text-foreground">{item.quantity}</span>
                          <button
                            onClick={() => updateItemQuantity(item.itemId, item.quantity + 1)}
                            className="p-2 hover:bg-background rounded-lg transition-colors"
                          >
                            <Plus className="w-4 h-4 text-muted-foreground" />
                          </button>
                          <button
                            onClick={() => removeItem(item.itemId)}
                            className="p-2 hover:bg-red-50 dark:hover:bg-red-950 rounded-lg transition-colors ml-2"
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </button>
                        </div>

                        <div className="text-right font-semibold text-foreground min-w-24 ml-4">
                          ₹{item.price * item.quantity}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Staff Notes */}
                <div className="border-t border-border pt-6 mt-6">
                  <label className="text-sm font-semibold text-foreground block mb-3">
                    Staff Notes
                  </label>
                  <textarea
                    value={staffNotes}
                    onChange={(e) => setStaffNotes(e.target.value)}
                    placeholder="Add special notes, discounts applied, or special instructions..."
                    className="w-full p-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground placeholder-muted-foreground text-sm"
                    rows={4}
                  />
                </div>
              </div>
            </div>

            {/* Right - Bill Preview */}
            <div className="lg:col-span-1">
              <div className="bg-white text-black rounded-lg shadow-lg p-6 space-y-4 sticky top-24 print-bill">
                {/* Resort Header */}
                <div className="text-center space-y-1 border-b border-black pb-4">
                  <p className="text-xs tracking-wide">Welcome to</p>
                  <h1 className="text-3xl font-serif font-bold">White Lotus</h1>
                  <p className="text-xs">Premium Resort Dining</p>
                </div>

                {/* Token Number */}
                <div className="text-center space-y-1 border-b border-black pb-3">
                  <p className="text-xs uppercase tracking-widest font-semibold">Token</p>
                  <p className="text-5xl font-bold" style={{ color: '#C9A961' }}>
                    {String(scannedOrder.tokenNumber).padStart(3, '0')}
                  </p>
                </div>

                {/* Items */}
                <div className="space-y-2 text-sm max-h-60 overflow-y-auto">
                  {orderItems.map((item) => (
                    <div key={item.itemId} className="flex justify-between text-xs">
                      <span className="flex-1 truncate">{item.title}</span>
                      <span className="px-2">×{item.quantity}</span>
                      <span className="text-right w-12">₹{item.price * item.quantity}</span>
                    </div>
                  ))}
                </div>

                {/* Totals */}
                <div className="border-t border-black pt-3 space-y-1 text-sm">
                  <div className="flex justify-between text-xs">
                    <span>Subtotal</span>
                    <span>₹{subtotal}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span>Service Charge</span>
                    <span>₹{SERVICE_CHARGE}</span>
                  </div>
                  <div className="flex justify-between font-bold text-base border-t border-black pt-2">
                    <span>Total</span>
                    <span>₹{total}</span>
                  </div>
                </div>

                {/* Time */}
                <div className="text-center text-xs text-gray-600 border-t border-black pt-3">
                  <p>{new Date().toLocaleDateString('en-IN')}</p>
                  <p>{new Date().toLocaleTimeString('en-IN')}</p>
                </div>

                {/* Print Button */}
                <button
                  onClick={handlePrintBill}
                  className="w-full py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors text-sm no-print flex items-center justify-center gap-2"
                >
                  <Printer className="w-4 h-4" />
                  Print Bill
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Print Styles */}
        <style>{`
          @media print {
            body {
              background: white;
              padding: 0;
            }
            .no-print {
              display: none !important;
            }
            .print-bill {
              box-shadow: none;
              border: none;
              position: static;
            }
          }
        `}</style>
      </div>
    )
  }

  // Scanner view
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-accent/5">
      {/* Header */}
      <div className="bg-background/80 backdrop-blur-sm border-b border-border sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 md:px-8 py-4 flex items-center justify-between">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Professional Billing</h1>
          <Link
            href="/"
            className="flex items-center gap-2 px-4 py-2 text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-muted"
          >
            <Home className="w-5 h-5" />
            <span className="hidden sm:inline">Menu</span>
          </Link>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 md:px-8 py-12">
        {/* Scanning Section */}
        <div className="bg-card rounded-lg shadow-lg border border-border overflow-hidden">
          {scannerActive ? (
            <div className="relative bg-black aspect-video">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover"
              />
              <button
                onClick={stopCamera}
                className="absolute top-4 right-4 p-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
              <canvas ref={canvasRef} className="hidden" />
            </div>
          ) : (
            <div className="p-8 md:p-16 text-center space-y-8">
              <div className="flex justify-center">
                <div className="p-6 bg-primary/10 rounded-full">
                  <Scan className="w-16 h-16 text-primary" />
                </div>
              </div>

              <div>
                <h2 className="text-3xl font-bold text-foreground mb-3">
                  Scan Order QR Code
                </h2>
                <p className="text-muted-foreground text-lg">
                  Scan the QR code from the customer receipt to load order details
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={startCamera}
                  className="px-8 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
                >
                  <Scan className="w-5 h-5" />
                  Open Camera
                </button>
                <button
                  onClick={handleManualInput}
                  className="px-8 py-3 bg-secondary text-secondary-foreground rounded-lg font-semibold hover:bg-secondary/90 transition-colors"
                >
                  Manual Input
                </button>
              </div>

              <div className="text-sm text-muted-foreground bg-muted/50 p-6 rounded-lg max-w-md mx-auto text-left">
                <p className="font-semibold mb-3 text-foreground">How to use:</p>
                <ul className="space-y-2">
                  <li>• Click "Open Camera" to scan QR code from receipt</li>
                  <li>• Or use hand scanner for direct input</li>
                  <li>• Order details will load automatically</li>
                  <li>• Edit items, add notes, and proceed to billing</li>
                  <li>• Print the final bill</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
