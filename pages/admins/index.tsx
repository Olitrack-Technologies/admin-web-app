import Layout from "@/components/Layout";
import { Badge, Button, Loader, Text } from "@mantine/core";
import { IconPlus } from "@tabler/icons-react";
import React, { useState } from "react";
import Empty from "@/components/Empty";
import AddAdmin from "@/components/modals/AddAdmin";
import useSWR from "swr";
import api from "@/lib/api";

interface Role {
  _id: string;
  label: string;
}

interface Admin {
  _id: string;
  name: string;
  email: string;
  phone: string;
  role: Role;
  is_active: boolean;
  createdAt: string;
}

async function fetchAdmins(url: string) {
  const { data } = await api.get(url);
  return data;
}

function Admins() {
  const [addOpen, setAddOpen] = useState(false);
  const { data: admins, isLoading, error } = useSWR<Admin[]>("/admins", fetchAdmins);

  return (
    <Layout>
      <div className="p-6 flex flex-col gap-4 h-full">
        <div>
          <h2 className="text-[16px] font-semibold text-slate-800">Admins</h2>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex-1 overflow-hidden flex flex-col">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <span className="text-[13px] font-semibold text-slate-700">All Admins</span>
              <span className="text-[11px] text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                {admins?.length ?? 0}
              </span>
            </div>
            <Button
              size="xs"
              color="teal"
              leftSection={<IconPlus size={13} />}
              onClick={() => setAddOpen(true)}
            >
              Add Admin
            </Button>
          </div>

          <div className="overflow-y-auto flex-1">
            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader size="sm" />
              </div>
            ) : error ? (
              <Text size="sm" c="red" className="p-4">{error?.message ?? "Failed to load admins"}</Text>
            ) : !admins || admins.length === 0 ? (
              <Empty title="No admins found" />
            ) : (
              <table className="w-full border-collapse">
                <thead className="sticky top-0 bg-gray-50 z-10">
                  <tr>
                    <th className="px-3 py-1.5 text-left font-semibold text-gray-600 text-[10px] uppercase tracking-wide select-none whitespace-nowrap border-b border-gray-200">Name</th>
                    <th className="px-3 py-1.5 text-left font-semibold text-gray-600 text-[10px] uppercase tracking-wide select-none whitespace-nowrap border-b border-gray-200">Email</th>
                    <th className="px-3 py-1.5 text-left font-semibold text-gray-600 text-[10px] uppercase tracking-wide select-none whitespace-nowrap border-b border-gray-200">Phone</th>
                    <th className="px-3 py-1.5 text-left font-semibold text-gray-600 text-[10px] uppercase tracking-wide select-none whitespace-nowrap border-b border-gray-200">Role</th>
                    <th className="px-3 py-1.5 text-left font-semibold text-gray-600 text-[10px] uppercase tracking-wide select-none whitespace-nowrap border-b border-gray-200">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {admins.map((admin) => (
                    <tr key={admin._id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="px-3 py-1.5 text-[11px] text-gray-700 whitespace-nowrap">{admin.name}</td>
                      <td className="px-3 py-1.5 text-[11px] text-gray-700 whitespace-nowrap">{admin.email}</td>
                      <td className="px-3 py-1.5 text-[11px] text-gray-700 whitespace-nowrap">{admin.phone}</td>
                      <td className="px-3 py-1.5 text-[11px] text-gray-700 whitespace-nowrap">
                        <Badge size="xs" radius={4} color="violet" variant="light">
                          {admin.role?.label ?? "—"}
                        </Badge>
                      </td>
                      <td className="px-3 py-1.5 text-[11px] text-gray-700 whitespace-nowrap">
                        <Badge size="xs" radius={4} color={admin.is_active ? "teal" : "red"} variant="light">
                          {admin.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        <AddAdmin opened={addOpen} handleClose={() => setAddOpen(false)} />
      </div>
    </Layout>
  );
}

export default Admins;
