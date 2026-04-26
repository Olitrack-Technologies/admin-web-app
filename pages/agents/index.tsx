import Layout from "@/components/Layout";
import AddAgent from "@/components/modals/AddAgent";
import AgentsTable, { Agent } from "@/components/tables/AgentsTable";
import { Button, Input } from "@mantine/core";
import { useDebouncedValue } from "@mantine/hooks";
import { IconPlus, IconSearch } from "@tabler/icons-react";
import React, { useEffect, useRef, useState } from "react";
import useSWRInfinite from "swr/infinite";
import api from "@/lib/api";

const PAGE_SIZE = 20;

interface AgentsPage {
	data: Agent[];
	total: number;
	hasMore: boolean;
}

async function fetchPage(url: string): Promise<AgentsPage> {
	const { data } = await api.get(url);
	return data;
}

function Agents() {
	const [openAdd, setOpenAdd] = useState(false);
	const [search, setSearch] = useState("");
	const [debouncedSearch] = useDebouncedValue(search, 350);
	const loaderRef = useRef<HTMLDivElement | null>(null);

	const getKey = (pageIndex: number): string =>
		`/agents?page=${pageIndex + 1}&limit=${PAGE_SIZE}`;

	const {
		data: pages,
		size,
		setSize,
		isLoading,
		error,
		mutate
	} = useSWRInfinite<AgentsPage>(getKey, fetchPage, {
		revalidateFirstPage: false
	});

	const agents: Agent[] = pages?.flatMap((p) => p.data) ?? [];
	const total = pages?.[0]?.total ?? 0;
	const hasMore = pages?.[pages.length - 1]?.hasMore ?? false;
	const fetchingMore = size > (pages?.length ?? 0);

	useEffect(() => {
		const el = loaderRef.current;
		if (!el || !hasMore || fetchingMore) return;
		const observer = new IntersectionObserver(
			([entry]) => {
				if (entry.isIntersecting) setSize((s) => s + 1);
			},
			{ threshold: 0.1 }
		);
		observer.observe(el);
		return () => observer.disconnect();
	}, [hasMore, fetchingMore, setSize]);

	return (
		<Layout>
			<div className="p-6 flex flex-col gap-4 h-full">
				<div className="bg-white rounded-xl border border-slate-200 shadow-sm flex-1 overflow-hidden flex flex-col">
					<div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
						<div className="flex items-center gap-2">
							<span className="text-[13px] font-semibold text-slate-700">
								All Agents
							</span>
							<span className="text-[11px] text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
								{total}
							</span>
						</div>
						<div className="flex items-center gap-2">
							<Input
								size="xs"
								placeholder="Search agents..."
								leftSection={<IconSearch color="lightgray" size={13} />}
								value={search}
								onChange={(e) => setSearch(e.currentTarget.value)}
								className="w-[200px]"
							/>
							<Button
								size="xs"
								color="teal"
								onClick={() => setOpenAdd(true)}
								leftSection={<IconPlus size={13} />}>
								Add agent
							</Button>
						</div>
					</div>

					<AgentsTable
						agents={agents}
						fetching={isLoading}
						fetchingMore={fetchingMore}
						error={error?.message ?? null}
						hasNextPage={hasMore}
						loadMoreRef={loaderRef}
						globalFilter={debouncedSearch}
					/>
				</div>
			</div>

			<AddAgent
				opened={openAdd}
				handleClose={() => setOpenAdd(false)}
				onSuccess={() => mutate()}
			/>
		</Layout>
	);
}

export default Agents;
