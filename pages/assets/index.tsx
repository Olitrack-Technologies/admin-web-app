import Empty from "@/components/Empty";
import Layout from "@/components/Layout";
import { Button, Code, Input, Loader, Text } from "@mantine/core";
import { useDebouncedValue } from "@mantine/hooks";
import { IconPlus, IconSearch } from "@tabler/icons-react";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { useCallback, useEffect, useState } from "react";
import mockData from "@/data/mock.json";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";
import AddDevice from "@/components/modals/AddDevice";

// -----------------------------
//  AssetsTable Component
// -----------------------------
interface AssetsTableProps {
  assets: Asset[];
  fetching: boolean;
  error?: string | null;
  hasNextPage?: boolean;
  loadMoreRef?: React.Ref<HTMLDivElement>;
  handleGoToAsset: (id: string) => void;
}

export const AssetsTable = ({
  assets,
  fetching,
  error,
  hasNextPage,
  loadMoreRef,
  handleGoToAsset,
}: AssetsTableProps) => {
  return (
    <div className="overflow-y-auto h-[calc(100vh-260px)]">
      {fetching ? (
        // Loading State
        <div className="flex justify-center py-8">
          <Loader size="sm" />
        </div>
      ) : error ? (
        // Error State
        <Text size="sm" c="red">
          {error}
        </Text>
      ) : assets.length === 0 ? (
        // No Data Found
        <Empty title="No customers found" />
      ) : (
        <table className="w-full border-collapse">
          <thead className="sticky top-0 bg-gray-50 z-10">
            <tr>
              <th className="px-3 py-1.5 text-left font-semibold text-gray-600 text-[10px] uppercase tracking-wide select-none whitespace-nowrap border-b border-gray-200">
                Name
              </th>
              <th className="px-3 py-1.5 text-left font-semibold text-gray-600 text-[10px] uppercase tracking-wide select-none whitespace-nowrap border-b border-gray-200">
                Description
              </th>
              <th className="px-3 py-1.5 text-left font-semibold text-gray-600 text-[10px] uppercase tracking-wide select-none whitespace-nowrap border-b border-gray-200">
                Type
              </th>
              <th className="px-3 py-1.5 text-left font-semibold text-gray-600 text-[10px] uppercase tracking-wide select-none whitespace-nowrap border-b border-gray-200">
                Customer
              </th>
              <th className="px-3 py-1.5 text-left font-semibold text-gray-600 text-[10px] uppercase tracking-wide select-none whitespace-nowrap border-b border-gray-200">
                Created At
              </th>
              <th className="px-3 py-1.5 text-left font-semibold text-gray-600 text-[10px] uppercase tracking-wide select-none whitespace-nowrap border-b border-gray-200 w-[70px]"></th>
            </tr>
          </thead>
          <tbody>
            {assets.map((asset) => (
              <tr
                key={asset.id}
                className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
              >
                <td className="px-3 py-1.5 text-[11px] text-gray-700 whitespace-nowrap">
                  {asset.name}
                </td>
                <td className="px-3 py-1.5 text-[11px] text-gray-700 whitespace-nowrap">
                  {asset.description}
                </td>
                <td className="px-3 py-1.5 text-[11px] text-gray-700 whitespace-nowrap">
                  <Code>{asset.type.toUpperCase()}</Code>
                </td>
                <td className="px-3 py-1.5 text-[11px] text-gray-700 whitespace-nowrap">
                  {asset.customerName ?? "—"}
                </td>
                <td className="px-3 py-1.5 text-[11px] text-gray-700 whitespace-nowrap">
                  {asset.createdAt}
                </td>
                <td className="px-3 py-1.5 text-[11px] text-gray-700 whitespace-nowrap">
                  <Button
                    variant="outline"
                    size="xs"
                    onClick={() => handleGoToAsset(asset.id)}
                  >
                    More
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Infinite Scroll Trigger */}
      {hasNextPage && (
        <div ref={loadMoreRef} className="flex justify-center py-4">
          <Loader size="xs" />
        </div>
      )}
    </div>
  );
};

// -----------------------------
//  AssetHeader Component
// -----------------------------
interface AssetHeaderProps {
  assetCount: number;
  handleGoToAdd: () => void;
  onSearchChange: (value: string) => void;
}

const AssetsHeader = ({
  handleGoToAdd,
  onSearchChange,
}: Omit<AssetHeaderProps, "assetCount">) => {
  const [search, setSearch] = useState<string>("");
  const [debouncedSearch] = useDebouncedValue(search, 400);

  useEffect(() => {
    onSearchChange(debouncedSearch);
  }, [debouncedSearch, onSearchChange]);

  return (
    <div className="flex items-center gap-2">
      <Input
        size="xs"
        placeholder="Search assets..."
        leftSection={<IconSearch color="lightgray" size={13} />}
        value={search}
        onChange={(e) => setSearch(e.currentTarget.value)}
        className="w-[200px]"
      />
      <Button
        onClick={handleGoToAdd}
        size="xs"
        color="teal"
        leftSection={<IconPlus size={13} />}
      >
        Add asset
      </Button>
    </div>
  );
};

// -----------------------------
// Exported Component
// -----------------------------

interface Asset {
  id: string;
  name: string;
  description: string;
  type: string;
  createdAt: string;
  customerName?: string;
}

function Assets() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [addDeviceOpen, setAddDeviceOpen] = useState(false);

  const handleGoToAdd = useCallback(() => {
    setAddDeviceOpen(true);
  }, []);
  const handleGoToAsset = useCallback(
    (id: string) => {
      router.push(`/assets/${id}`);
    },
    [router],
  );

  const { items, hasMore, loaderRef, total } = useInfiniteScroll(
    mockData.assets as Asset[],
    (a, q) =>
      a.name.toLowerCase().includes(q) ||
      a.description.toLowerCase().includes(q) ||
      (a.customerName ?? "").toLowerCase().includes(q),
    query,
  );

  return (
    <Layout>
      <div className="p-6 flex flex-col gap-4 h-full">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-[16px] font-semibold text-slate-800">Assets</h2>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex-1 overflow-hidden flex flex-col">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <span className="text-[13px] font-semibold text-slate-700">
                All Assets
              </span>
              <span className="text-[11px] text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                {total}
              </span>
            </div>
            <AssetsHeader
              handleGoToAdd={handleGoToAdd}
              onSearchChange={setQuery}
            />
          </div>

          <AssetsTable
            assets={items}
            fetching={false}
            error={null}
            hasNextPage={hasMore}
            handleGoToAsset={handleGoToAsset}
            loadMoreRef={loaderRef}
          />
        </div>

        <AddDevice
          opened={addDeviceOpen}
          handleClose={() => setAddDeviceOpen(false)}
        />
      </div>
    </Layout>
  );
}

export default Assets;
