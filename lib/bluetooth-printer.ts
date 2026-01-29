interface BluetoothPrinterConfig {
  serviceUUID: string
  characteristicUUID: string
}

// Standard Bluetooth printer UUIDs (ESC/POS thermal printers)
const PRINTER_CONFIG: BluetoothPrinterConfig = {
  serviceUUID: "000018f0-0000-1000-8000-00805f9b34fb", // Serial Port Service UUID
  characteristicUUID: "00002a19-0000-1000-8000-00805f9b34fb", // Device for Serial Port Profile
}

// ESC/POS command generator for thermal printers
function generateEscPosCommands(receiptText: string): Uint8Array {
  const encoder = new TextEncoder()

  // ESC/POS commands
  const commands: Uint8Array[] = [
    new Uint8Array([0x1b, 0x40]), // Initialize printer
    new Uint8Array([0x1b, 0x61, 0x01]), // Center alignment
    encoder.encode(receiptText),
    new Uint8Array([0x1b, 0x69]), // Cut paper
    new Uint8Array([0x0a, 0x0a, 0x0a]), // Line feeds
  ]

  // Combine all commands
  const totalLength = commands.reduce((sum, cmd) => sum + cmd.length, 0)
  const result = new Uint8Array(totalLength)
  let offset = 0

  for (const cmd of commands) {
    result.set(cmd, offset)
    offset += cmd.length
  }

  return result
}

export async function printViaBluetoothPrinter(receiptText: string): Promise<boolean> {
  try {
    console.log("[v0] Starting Bluetooth printer connection...")

    // Request Bluetooth device
    const device = await navigator.bluetooth.requestDevice({
      filters: [
        {
          services: [PRINTER_CONFIG.serviceUUID],
        },
      ],
      optionalServices: ["generic_access"],
    })

    console.log("[v0] Bluetooth device selected:", device.name)

    // Connect to device
    const server = await device.gatt?.connect()
    if (!server) {
      throw new Error("Failed to connect to GATT server")
    }

    console.log("[v0] Connected to GATT server")

    // Get service and characteristic
    const service = await server.getPrimaryService(PRINTER_CONFIG.serviceUUID)
    const characteristic = await service.getCharacteristic(PRINTER_CONFIG.characteristicUUID)

    console.log("[v0] Got characteristic, preparing print data...")

    // Generate ESC/POS commands
    const printData = generateEscPosCommands(receiptText)

    // Send data in chunks (some printers have buffer limits)
    const chunkSize = 20
    for (let i = 0; i < printData.length; i += chunkSize) {
      const chunk = printData.slice(i, i + chunkSize)
      await characteristic.writeValue(chunk)
      console.log("[v0] Sent chunk", Math.floor(i / chunkSize) + 1)
      // Small delay between chunks
      await new Promise((resolve) => setTimeout(resolve, 10))
    }

    console.log("[v0] Print data sent successfully")

    // Disconnect
    device.gatt?.disconnect()
    console.log("[v0] Disconnected from printer")

    return true
  } catch (error) {
    console.error("[v0] Bluetooth print error:", error)

    // Check if error is due to user cancellation
    if (error instanceof Error && error.name === "NotFoundError") {
      console.log("[v0] User cancelled Bluetooth device selection")
      return false
    }

    throw error
  }
}

export function isBluetoothSupported(): boolean {
  return "bluetooth" in navigator
}
