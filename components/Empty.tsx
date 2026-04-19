import { IconInbox } from "@tabler/icons-react"
import React from "react"

interface EmptyProps {
  title?: string
  description?: string | null
  actionLabel?: string
  onAction?: () => void
  icon?: React.ReactNode
}

const Empty = ({
  title = "No items found",
  description = "Start by adding a new item to get started.",
  actionLabel = "Add Item",
  onAction,
  icon,
}: EmptyProps) => {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-4">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gray-100 mb-6">
        {icon ? (
          icon
        ) : (
          <IconInbox className="h-10 w-10 text-gray-400" aria-hidden="true" />
        )}
      </div>

      <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
      <p className="text-sm text-gray-500 mt-2 max-w-sm">{description}</p>

      {onAction && (
        <button
          type="button"
          onClick={onAction}
          className="mt-6 px-4 py-2 rounded-lg bg-black text-white hover:bg-gray-800 transition-colors"
        >
          {actionLabel}
        </button>
      )}
    </div>
  )
}

export default Empty
