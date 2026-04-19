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

export interface Vehicle {
  registration: string
  make: string
  model: string
  yearOfManufacture: number
  chassisNo: string
  engineNo: string
  deviceModel: string
  deviceSerial: string
  deviceSim: string
  latitude: number
  longitude: number
  fittingDate: string
  fittingAgent: string
}

export interface Owner {
  firstName: string
  middleName: string
  lastName: string
  home: string
  email: string
  phone: string
}

export interface TrackedVehicle {
  vehicle: Vehicle
  owner: Owner
  history: TrackingPoint[]
}
