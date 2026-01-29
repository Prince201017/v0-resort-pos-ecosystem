export interface OrderMessage {
  type: "order_submitted"
  tokenNumber: number
  items: Array<{
    title: string
    quantity: number
    price: number
  }>
  subtotal: number
  serviceCharge: number
  total: number
  timestamp: string
}

export class WebSocketClient {
  private ws: WebSocket | null = null
  private listeners: Map<string, Set<(data: any) => void>> = new Map()
  private reconnectAttempts = 0
  private maxReconnectAttempts = 0 // Set to 0 to prevent reconnection attempts
  private reconnectDelay = 3000
  private connectionAttempted = false // Track if we've already tried to connect

  connect(url = "ws://localhost:8080") {
    if (this.connectionAttempted) {
      return
    }
    this.connectionAttempted = true

    try {
      this.ws = new WebSocket(url)

      this.ws.onopen = () => {
        console.log("[v0] WebSocket connected")
        this.reconnectAttempts = 0
        this.emit("connected")
      }

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          this.emit("message", data)
        } catch (error) {
          console.error("[v0] Failed to parse message:", error)
        }
      }

      this.ws.onerror = () => {
        this.emit("error", null)
      }

      this.ws.onclose = () => {
        this.emit("disconnected")
      }
    } catch (error) {
      this.emit("disconnected")
    }
  }

  private attemptReconnect(url: string) {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++
      const delay = this.reconnectDelay * this.reconnectAttempts
      console.log(`[v0] Attempting to reconnect in ${delay}ms...`)
      setTimeout(() => this.connect(url), delay)
    }
  }

  send(data: any) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data))
      return true
    }
    console.warn("[v0] WebSocket not connected")
    return false
  }

  on(event: string, callback: (data: any) => void) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set())
    }
    this.listeners.get(event)!.add(callback)

    // Return unsubscribe function
    return () => {
      const callbacks = this.listeners.get(event)
      if (callbacks) {
        callbacks.delete(callback)
      }
    }
  }

  private emit(event: string, data?: any) {
    const callbacks = this.listeners.get(event)
    if (callbacks) {
      callbacks.forEach((callback) => callback(data))
    }
  }

  disconnect() {
    if (this.ws) {
      this.ws.close()
      this.ws = null
    }
  }

  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN
  }
}

// Singleton instance
let clientInstance: WebSocketClient | null = null

export function getWebSocketClient(): WebSocketClient {
  if (!clientInstance) {
    clientInstance = new WebSocketClient()
  }
  return clientInstance
}
