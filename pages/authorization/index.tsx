import Layout from "@/components/Layout"
import { Badge } from "@mantine/core"
import {
  IconCheck,
  IconLock,
  IconX,
} from "@tabler/icons-react"
import React from "react"

interface Permission {
  label: string
  super_admin: boolean
  admin: boolean
}

const PERMISSIONS: Permission[] = [
  { label: "View customers",          super_admin: true,  admin: true  },
  { label: "Add / edit customers",    super_admin: true,  admin: true  },
  { label: "Delete customers",        super_admin: true,  admin: false },
  { label: "View agents",             super_admin: true,  admin: true  },
  { label: "Add / edit agents",       super_admin: true,  admin: true  },
  { label: "Delete agents",           super_admin: true,  admin: false },
  { label: "View assets",             super_admin: true,  admin: true  },
  { label: "Add / edit assets",       super_admin: true,  admin: true  },
  { label: "Delete assets",           super_admin: true,  admin: false },
  { label: "View devices",            super_admin: true,  admin: true  },
  { label: "Manage device types",     super_admin: true,  admin: false },
  { label: "View transactions",       super_admin: true,  admin: true  },
  { label: "Add transactions",        super_admin: true,  admin: true  },
  { label: "View analytics",          super_admin: true,  admin: true  },
  { label: "Manage admins",           super_admin: true,  admin: false },
  { label: "Manage roles & permissions", super_admin: true, admin: false },
]

const Tick = ({ allowed }: { allowed: boolean }) =>
  allowed ? (
    <IconCheck size={16} className="text-green-600" />
  ) : (
    <IconX size={16} className="text-red-400" />
  )


function Authorization() {
  return (
    <Layout>
      <div className="p-6 flex flex-col gap-4 h-full">
        <div>
          <h2 className="text-[16px] font-semibold text-slate-800">Authorization</h2>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex-1 overflow-hidden flex flex-col">
          <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-100">
            <IconLock size={16} className="text-slate-500" />
            <div>
              <span className="text-[13px] font-semibold text-slate-700">Roles &amp; Permissions</span>
              <p className="text-[10px] text-slate-400 mt-0.5">
                Role-based access control matrix. Contact the system owner to request changes.
              </p>
            </div>
          </div>

          <div className="overflow-y-auto flex-1">
            <table className="w-full border-collapse">
              <thead className="sticky top-0 bg-gray-50 z-10">
                <tr>
                  <th className="px-3 py-1.5 text-left font-semibold text-gray-600 text-[10px] uppercase tracking-wide select-none whitespace-nowrap border-b border-gray-200 w-2/3">Permission</th>
                  <th className="px-3 py-1.5 text-center font-semibold text-gray-600 text-[10px] uppercase tracking-wide select-none whitespace-nowrap border-b border-gray-200">
                    <Badge color="violet" size="sm" variant="light" radius={4}>Super Admin</Badge>
                  </th>
                  <th className="px-3 py-1.5 text-center font-semibold text-gray-600 text-[10px] uppercase tracking-wide select-none whitespace-nowrap border-b border-gray-200">
                    <Badge color="blue" size="sm" variant="light" radius={4}>Admin</Badge>
                  </th>
                </tr>
              </thead>
              <tbody>
                {PERMISSIONS.map((perm) => (
                  <tr key={perm.label} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="px-3 py-1.5 text-[11px] text-gray-700 whitespace-nowrap">{perm.label}</td>
                    <td className="px-3 py-1.5 text-[11px] text-gray-700 text-center"><Tick allowed={perm.super_admin} /></td>
                    <td className="px-3 py-1.5 text-[11px] text-gray-700 text-center"><Tick allowed={perm.admin} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  )
}

export default Authorization
