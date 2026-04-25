import {
  IconUsers,
  IconChartBar,
  IconLock,
  IconLayoutDashboard,
  IconAward,
  IconRefresh,
  IconCar4wd,
  IconCpu,
  IconStack2,
  IconChevronLeft,
  IconChevronRight,
  IconShieldLock,
} from "@tabler/icons-react"
import Link from "next/link"
import { useRouter } from "next/router"
import clsx from "clsx"
import { useState } from "react"

const navGroups = [
  {
    label: "Main",
    items: [
      { label: "Dashboard", icon: IconLayoutDashboard, href: "/" },
      { label: "Analytics", icon: IconChartBar, href: "/analytics" },
    ],
  },
  {
    label: "Management",
    items: [
      { label: "Agents", icon: IconAward, href: "/agents" },
      { label: "Customers", icon: IconUsers, href: "/customers" },
      { label: "Assets", icon: IconCar4wd, href: "/assets" },
      { label: "Devices", icon: IconCpu, href: "/devices" },
      { label: "Device Types", icon: IconStack2, href: "/device-types" },
    ],
  },
  {
    label: "Finance",
    items: [
      { label: "Transactions", icon: IconRefresh, href: "/transactions" },
    ],
  },
  {
    label: "System",
    items: [
      { label: "Admins", icon: IconShieldLock, href: "/admins" },
      { label: "Authorization", icon: IconLock, href: "/authorization" },
    ],
  },
]

export default function Sidebar() {
  const router = useRouter()
  const [collapsed, setCollapsed] = useState(false)

  return (
    <aside
      className={clsx(
        "h-[calc(100vh-56px)] bg-slate-900 text-white flex flex-col border-r border-slate-800 transition-all duration-300 shrink-0",
        collapsed ? "w-16" : "w-56"
      )}
    >
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-4">
        {navGroups.map((group) => (
          <div key={group.label}>
            {!collapsed && (
              <p className="px-2 mb-1 text-[9px] font-semibold uppercase tracking-widest text-slate-500">
                {group.label}
              </p>
            )}
            <div className="space-y-0.5">
              {group.items.map(({ label, icon: Icon, href }) => {
                const isActive = router.pathname === href

                return (
                  <Link href={href} key={label}>
                    <div
                      className={clsx(
                        "relative flex items-center gap-3 px-3 py-2 rounded-md transition-colors cursor-pointer",
                        isActive
                          ? "bg-white/10 text-white"
                          : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
                      )}
                    >
                      {isActive && (
                        <span className="absolute left-0 top-1 bottom-1 w-0.5 bg-teal-400 rounded-r-full" />
                      )}
                      <Icon size={17} className="shrink-0" />
                      {!collapsed && (
                        <span className="text-[12.5px] font-medium">{label}</span>
                      )}
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="border-t border-slate-800 p-2">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={clsx(
            "flex items-center gap-2 w-full px-3 py-2 rounded-md text-slate-500 hover:text-slate-300 hover:bg-white/5 transition-colors",
            collapsed && "justify-center"
          )}
        >
          {collapsed ? (
            <IconChevronRight size={16} />
          ) : (
            <>
              <IconChevronLeft size={16} />
              <span className="text-[11px]">Collapse</span>
            </>
          )}
        </button>
      </div>
    </aside>
  )
}
