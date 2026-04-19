import { TextInput } from "@mantine/core"
import { IconSearch } from "@tabler/icons-react"
import type { Vehicle, Owner } from "@/types/vehicle"

interface InfoFieldProps {
  label: string
  value: string | number
}

function InfoField({ label, value }: InfoFieldProps) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[10px] font-medium text-gray-400 uppercase tracking-wide">
        {label}
      </span>
      <span className="text-xs font-semibold text-gray-800 break-all">{value}</span>
    </div>
  )
}

interface SectionProps {
  title: string
  children: React.ReactNode
}

function Section({ title, children }: SectionProps) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <span className="text-[11px] font-bold text-gray-500 uppercase tracking-widest whitespace-nowrap">
          {title}
        </span>
        <hr className="flex-1 border-gray-200" />
      </div>
      {children}
    </div>
  )
}

interface VehicleInfoPanelProps {
  vehicle: Vehicle
  owner: Owner
  width?: number
}

export default function VehicleInfoPanel({ vehicle, owner, width }: VehicleInfoPanelProps) {
  const cols =
    !width || width >= 400
      ? "grid-cols-3"
      : width >= 270
      ? "grid-cols-2"
      : "grid-cols-1"

  return (
    <aside className="flex flex-col h-full w-full bg-white border-l border-gray-200">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100">
        <TextInput
          variant="filled"
          placeholder="Search vehicle"
          leftSection={<IconSearch size={14} />}
          size="sm"
          className="flex-1"
        />
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 flex space-y-4 flex-col gap-6">
        <Section title="Vehicle Information">
          <div className={`grid ${cols} gap-x-3 gap-y-4`}>
            <InfoField label="Vehicle Reg." value={vehicle.registration} />
            <InfoField label="Vehicle Make" value={vehicle.make} />
            <InfoField label="Vehicle Model" value={vehicle.model} />
            <InfoField label="Year of Manuf." value={vehicle.yearOfManufacture} />
            <InfoField label="Chassis No." value={vehicle.chassisNo} />
            <InfoField label="Engine No." value={vehicle.engineNo} />
          </div>
        </Section>

        <Section title="Device Information">
          <div className={`grid ${cols} gap-x-3 gap-y-4`}>
            <InfoField label="Device Model" value={vehicle.deviceModel} />
            <InfoField label="Device Serial" value={vehicle.deviceSerial} />
            <InfoField label="Device SIM" value={vehicle.deviceSim} />
            <InfoField label="Fitting Date" value={vehicle.fittingDate} />
            <InfoField label="Fitting Agent" value={vehicle.fittingAgent} />
          </div>
        </Section>

        <Section title="Owner Information">
          <div className={`grid ${cols} gap-x-3 gap-y-4`}>
            <InfoField label="First Name" value={owner.firstName} />
            <InfoField label="Middle Name" value={owner.middleName} />
            <InfoField label="Last Name" value={owner.lastName} />
            <InfoField label="Email" value={owner.email} />
            <InfoField label="Phone Number" value={owner.phone} />
          </div>
        </Section>
      </div>
    </aside>
  )
}
