import { Avatar, Menu, UnstyledButton } from "@mantine/core";
import {
  IconBell,
  IconChevronDown,
  IconLogout,
  IconUser,
} from "@tabler/icons-react";
import { useRouter } from "next/router";
import useSWRMutation from "swr/mutation";
import { toast } from "react-toastify";
import api from "@/lib/api";

async function adminLogout(_url: string) {
  const { data } = await api.post("/auth/admin/logout");
  return data;
}

export default function Header() {
  const router = useRouter();
  const { trigger } = useSWRMutation("/auth/admin/logout", adminLogout);

  const session = { name: "Admin User", email: "admin@olitrack.co.ke" };
  const initials = (session?.name ?? "Admin")
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const handleSignOut = async () => {
    try {
      await trigger();
      toast.success("Logged out successfully");
      router.push("/login");
    } catch (err: any) {
      const message =
        err?.response?.data?.error ?? err?.message ?? "Failed to logout";
      toast.error(message);
    }
  };

  return (
    <header className="flex items-center justify-between px-6 h-14 bg-white border-b border-slate-200 shrink-0 z-20">
      <span className="text-[15px] font-[Nasalization] font-bold tracking-widest text-slate-900 select-none">
        OLITRACK
      </span>

      <div className="flex items-center gap-1">
        <button className="relative p-2 rounded-lg hover:bg-slate-100 transition-colors text-slate-500">
          <IconBell size={17} />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-teal-500 rounded-full" />
        </button>

        <Menu shadow="md" width={210} position="bottom-end" withArrow>
          <Menu.Target>
            <UnstyledButton className="flex items-center gap-2.5 px-2.5 py-1.5 ml-1 rounded-lg hover:bg-slate-50 transition-colors">
              <Avatar size={30} radius="xl" color="teal" variant="filled">
                {initials}
              </Avatar>
              <div className="flex flex-col text-left leading-none">
                <span className="text-[12px] font-semibold text-slate-800">
                  {session?.name ?? "Admin"}
                </span>
                <span className="text-[10px] text-slate-400 mt-0.5">
                  {session?.email ?? ""}
                </span>
              </div>
              <IconChevronDown size={13} className="text-slate-400 ml-1" />
            </UnstyledButton>
          </Menu.Target>

          <Menu.Dropdown>
            <Menu.Label>Account</Menu.Label>
            <Menu.Item leftSection={<IconUser size={13} />}>
              View profile
            </Menu.Item>
            <Menu.Divider />
            <Menu.Item
              color="red"
              leftSection={<IconLogout size={13} />}
              onClick={handleSignOut}
            >
              Sign out
            </Menu.Item>
          </Menu.Dropdown>
        </Menu>
      </div>
    </header>
  );
}
