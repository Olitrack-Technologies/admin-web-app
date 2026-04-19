import type { TrackedVehicle, TrackingPoint } from "@/types/vehicle"

const nairobiPoints: TrackingPoint[] = [
  { id: "1", timestamp: "2024-03-31T16:10:20.000Z", latitude: -1.2921, longitude: 36.8219, status: "online", speed: 45 },
  { id: "2", timestamp: "2024-03-31T16:25:10.000Z", latitude: -1.2874, longitude: 36.8312, status: "online", speed: 60 },
  { id: "3", timestamp: "2024-03-31T16:40:55.000Z", latitude: -1.2943, longitude: 36.8456, status: "offline", speed: 0 },
  { id: "4", timestamp: "2024-03-31T17:00:33.000Z", latitude: -1.3002, longitude: 36.8521, status: "offline", speed: 38 },
  { id: "5", timestamp: "2024-03-31T17:15:07.000Z", latitude: -1.3078, longitude: 36.8349, status: "expired", speed: 0 },
  { id: "6", timestamp: "2024-03-31T17:30:44.000Z", latitude: -1.2856, longitude: 36.8104, status: "expired", speed: 52 },
  { id: "7", timestamp: "2024-03-31T17:45:19.000Z", latitude: -1.2765, longitude: 36.7998, status: "expired", speed: 67 },
  { id: "8", timestamp: "2024-03-31T18:00:02.000Z", latitude: -1.2694, longitude: 36.8237, status: "expired", speed: 0 },
]

export const mockTrackedVehicle: TrackedVehicle = {
  vehicle: {
    registration: "KDB 123A",
    make: "Toyota",
    model: "Land Cruiser",
    yearOfManufacture: 2020,
    chassisNo: "JTMHX05J504027891",
    engineNo: "1GR-FE-0034521",
    deviceModel: "Teltonika FMB920",
    deviceSerial: "TLT-FMB-920-00341",
    deviceSim: "0722000123",
    latitude: -1.2921,
    longitude: 36.8219,
    fittingDate: "2023-06-15",
    fittingAgent: "Olitrack Systems Ltd",
  },
  owner: {
    firstName: "James",
    middleName: "Otieno",
    lastName: "Mwangi",
    home: "Kasarani, Nairobi",
    email: "j.mwangi@example.co.ke",
    phone: "+254 712 345 678",
  },
  history: nairobiPoints,
}
