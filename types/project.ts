/**
 * project.ts — shared entity types used across the admin app.
 * All entities mirror the flat structure in data/mock.json.
 */

export interface Customer {
  id: string
  fullName: string
  email: string
  phoneNumber: string
  clientType: string
  location: string
}

export interface Agent {
  id: string
  fullName: string
  email: string
  phoneNumber: string
  points: number
  location: string
}

export interface Asset {
  id: string
  name: string
  description: string
  type: string
  customerId: string
  customerName: string
  createdAt: string
}

export interface Device {
  id: string
  type: string
  status: string
  assetId: string
  assetName: string
  customerId: string
  customerName: string
  agentId: string
  agentName: string
  iDate: string
  expiry: string
}

export interface DeviceType {
  id: number
  name: string
  protocol: string
  installation_cost: number
  subscription_cost: number
  validity: string
  created_at: string
}

export interface Transaction {
  id: string
  type: string
  mode: string
  txCodes: string[]
  amount: number
  deviceId: string | null
  deviceName: string | null
  agentId: string | null
  agentName: string | null
  date: string
}

export interface ModalProps {
  opened: boolean
  handleClose: () => void
}

// --- Dashboard (ntsa-style tracked vehicle) ----------------------------------

export type VehicleStatus = "online" | "expired" | "offline"

export interface TrackingPoint {
  id: string
  timestamp: string
  latitude: number
  longitude: number
  status: VehicleStatus
  speed: number
}

export interface MapMarker {
  id: string
  latitude: number
  longitude: number
  status: VehicleStatus
  label?: string
}

export interface TrackedVehicle {
  registration: string
  make: string
  model: string
  yearOfManufacture: number
  chassisNo: string
  engineNo: string
  deviceModel: string
  deviceSerial: string
  deviceSim: string
  fittingDate: string
  fittingAgent: string
}

export interface VehicleOwner {
  firstName: string
  middleName: string
  lastName: string
  home: string
  email: string
  phone: string
}
