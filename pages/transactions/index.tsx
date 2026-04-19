import Layout from "@/components/Layout"
import {
  Badge,
  Button,
  Code,
  Group,
  Input,
  Loader,
  Modal,
  NumberInput,
  Radio,
  Select,
  TagsInput,
  Text,
} from "@mantine/core"
import { useDebouncedValue } from "@mantine/hooks"
import { IconPlus, IconSearch } from "@tabler/icons-react"
import { useFormik } from "formik"
import * as Yup from "yup"

import Link from "next/link"
import React, { useCallback, useEffect, useState } from "react"
import DeviceSelect from "@/components/DeviceSelect"
import AgentSelect from "@/components/AgentSelect"
import Empty from "@/components/Empty"
import mockData from "@/data/mock.json"
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll"

// -----------------------------
//  TransactionsHeader Component
// -----------------------------
interface TransactionsHeaderProps {
  transactionCount: number
  handleOpenNewTx: () => void
  onSearchChange: (value: string) => void
}

const TransactionsHeader = ({
  handleOpenNewTx,
  onSearchChange,
}: Omit<TransactionsHeaderProps, "transactionCount">) => {
  const [search, setSearch] = useState<string>("")
  const [debouncedSearch] = useDebouncedValue(search, 400)

  useEffect(() => {
    onSearchChange(debouncedSearch)
  }, [debouncedSearch, onSearchChange])

  return (
    <div className="flex items-center gap-2">
      <Input
        size="xs"
        placeholder="Search transactions..."
        leftSection={<IconSearch color="lightgray" size={13} />}
        value={search}
        onChange={(e) => setSearch(e.currentTarget.value)}
        className="w-[200px]"
      />
      <Button
        size="xs"
        color="teal"
        onClick={handleOpenNewTx}
        leftSection={<IconPlus size={13} />}
      >
        Add transaction
      </Button>
    </div>
  )
}

// -----------------------------
//  NewTransactionModal Component
// -----------------------------

interface NewTransactionModalProps {
  opened: boolean
  onClose: () => void
}

interface TxFormValues {
  mode: string
  txCodes: string[]
  type: string
  amount: number | undefined
  device: string
  agent: string
}

const validationSchema = Yup.object().shape({
  mode: Yup.string().required("Mode is required"),
  type: Yup.string().required("Type is required"),
  amount: Yup.number()
    .typeError("Amount must be a number")
    .required("Amount is required"),
  agent: Yup.string().when("type", {
    is: "commission",
    then: (schema) => schema.required("Agent is required"),
    otherwise: (schema) => schema.notRequired(),
  }),
  device: Yup.string().when("type", {
    is: "commission",
    then: (schema) => schema.notRequired(),
    otherwise: (schema) => schema.required("Device is required"),
  }),
  txCodes: Yup.array()
    .of(Yup.string().required())
    .when("mode", {
      is: "m-pesa",
      then: (schema) => schema.required("Transaction codes are required"),
      otherwise: (schema) => schema.notRequired(),
    }),
})

const NewTransactionModal = ({ opened, onClose }: NewTransactionModalProps) => {
  // Functions
  const handleAddTx = async (values: TxFormValues) => {
    console.log(" Submitting form", values)
    await new Promise((resolve) => setTimeout(resolve, 2000))
    console.log("✅ Saved successfully")
  }

  const handleError = (err: Error | unknown) => {
    console.error(err)
  }

  // Formik
  const formik = useFormik<TxFormValues>({
    initialValues: {
      mode: "m-pesa",
      type: "",
      txCodes: [],
      amount: undefined,
      device: "",
      agent: "",
    },
    validationSchema,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        await handleAddTx(values)
      } catch (error) {
        handleError(error)
      } finally {
        setSubmitting(false)
      }
    },
  })

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={<h1>New Transaction</h1>}
      centered
    >
      <form onSubmit={formik.handleSubmit}>
        <div className="p-8 space-y-3">
          <Select
            size="xs"
            label="Transaction Type"
            data={[
              { value: "installation", label: "Installation" },
              { value: "renewal", label: "Renewal" },
              { value: "commission", label: "Commission" },
            ]}
            {...formik.getFieldProps("type")}
            error={formik.touched.type && formik.errors.type}
            onChange={(v) => formik.setFieldValue("type", v)}
          />

          {formik.values.type === "installation" ||
          formik.values.type === "renewal" ? (
            <DeviceSelect
              value={formik.values.device}
              onChange={(val) => formik.setFieldValue("device", val)}
            />
          ) : (
            <AgentSelect
              value={formik.values.agent}
              onChange={(val) => formik.setFieldValue("agent", val)}
            />
          )}

          <Radio.Group
            size="xs"
            label="Payment method"
            name="mode"
            value={formik.values.mode}
            onChange={(val) => formik.setFieldValue("mode", val)} // IMPORTANT
            error={formik.touched.mode && formik.errors.mode}
          >
            <Group mt="xs">
              <Radio value="m-pesa" label="M-Pesa" />
              <Radio value="cash" label="Cash" />
            </Group>
          </Radio.Group>

          {formik.values.mode === "m-pesa" && (
            <TagsInput
              size="xs"
              label="Transaction Codes"
              placeholder="Enter M-pesa transaction codes"
              value={formik.values.txCodes || []}
              onChange={(val) => formik.setFieldValue("txCodes", val)}
              error={formik.touched.txCodes ? formik.errors.txCodes as string : undefined}
            />
          )}

          <NumberInput
            min={0}
            size="xs"
            label={
              formik.values.type == "installation" ||
              formik.values.type == "renewal"
                ? "Amount ( to be received )"
                : "Amount ( to be paid )"
            }
            thousandSeparator
            prefix="Ksh."
            hideControls
            value={formik.values.amount}
            onChange={(val) => formik.setFieldValue("amount", val)}
            error={formik.touched.amount && formik.errors.amount}
          />
        </div>
        <div className="flex justify-end px-8 pb-4">
          <Button
            size="xs"
            type="submit"
            loading={formik.isSubmitting}
            disabled={formik.isSubmitting}
          >
            Save Information
          </Button>
        </div>
      </form>
    </Modal>
  )
}

// -----------------------------
//  TransactionTable Component
// -----------------------------
interface TransactionTableProps {
  transactions: Transaction[]
  fetching: boolean
  error?: string | null
  hasNextPage?: boolean
  loadMoreRef?: React.Ref<HTMLDivElement>
}

const TransactionsTable = ({
  transactions,
  fetching,
  error,
  hasNextPage,
  loadMoreRef,
}: TransactionTableProps) => {
  return (
    <div className="overflow-y-auto h-[calc(100vh-260px)]">
      {fetching ? (
        // Loading
        <div className="flex justify-center py-8">
          <Loader size="sm" />
        </div>
      ) : error ? (
        // Error
        <Text size="sm" c="red">
          {error}
        </Text>
      ) : transactions.length === 0 ? (
        // No Data
        <Empty title="No transactions found" />
      ) : (
        <table className="w-full border-collapse">
          <thead className="sticky top-0 bg-gray-50 z-10">
            <tr>
              <th className="px-3 py-1.5 text-left font-semibold text-gray-600 text-[10px] uppercase tracking-wide select-none whitespace-nowrap border-b border-gray-200">Type</th>
              <th className="px-3 py-1.5 text-left font-semibold text-gray-600 text-[10px] uppercase tracking-wide select-none whitespace-nowrap border-b border-gray-200">Payment Mode</th>
              <th className="px-3 py-1.5 text-left font-semibold text-gray-600 text-[10px] uppercase tracking-wide select-none whitespace-nowrap border-b border-gray-200">Transaction Codes</th>
              <th className="px-3 py-1.5 text-left font-semibold text-gray-600 text-[10px] uppercase tracking-wide select-none whitespace-nowrap border-b border-gray-200">Amount</th>
              <th className="px-3 py-1.5 text-left font-semibold text-gray-600 text-[10px] uppercase tracking-wide select-none whitespace-nowrap border-b border-gray-200">Device</th>
              <th className="px-3 py-1.5 text-left font-semibold text-gray-600 text-[10px] uppercase tracking-wide select-none whitespace-nowrap border-b border-gray-200">Agent</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((tx) => (
              <tr key={tx.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                <td className="px-3 py-1.5 text-[11px] text-gray-700 whitespace-nowrap">
                  <Badge radius={4} size="xs" color={tx.type === "installation" ? "green" : tx.type === "renewal" ? "blue" : "orange"}>
                    {tx.type}
                  </Badge>
                </td>
                <td className="px-3 py-1.5 text-[11px] text-gray-700 whitespace-nowrap">{tx.mode}</td>
                <td className="px-3 py-1.5 text-[11px] text-gray-700 whitespace-nowrap capitalize">
                  {tx.txCodes?.map((code) => <Code key={code}>{code}</Code>)}
                </td>
                <td className="px-3 py-1.5 text-[11px] text-gray-700 whitespace-nowrap">Ksh {tx.amount.toLocaleString()}</td>
                <td className="px-3 py-1.5 text-[11px] text-gray-700 whitespace-nowrap">{tx.deviceName || "-"}</td>
                <td className="px-3 py-1.5 text-[11px] text-gray-700 whitespace-nowrap">{tx.agentName || "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Infinite Scroll Loader */}
      {hasNextPage && (
        <div ref={loadMoreRef} className="flex justify-center py-4">
          <Loader size="xs" />
        </div>
      )}
    </div>
  )
}

// -----------------------------
// Exported Component
// -----------------------------

interface Transaction {
  id: string
  mode: string
  txCodes: string[]
  type: string
  amount: number
  deviceId: string | null
  deviceName: string | null
  agentId: string | null
  agentName: string | null
  date: string
}


function Transactions() {
  const [newTransactionOpen, setNewTransactionOpen] = useState(false)
  const [query, setQuery] = useState("")

  const handleOpenNewTx = useCallback(() => { setNewTransactionOpen(true) }, [])
  const handleCloseNewTxModal = useCallback(() => { setNewTransactionOpen(false) }, [])

  const { items, hasMore, loaderRef, total } = useInfiniteScroll(
    mockData.transactions as Transaction[],
    (t, q) =>
      t.type.toLowerCase().includes(q) ||
      t.mode.toLowerCase().includes(q) ||
      (t.deviceName ?? "").toLowerCase().includes(q) ||
      (t.agentName ?? "").toLowerCase().includes(q),
    query
  )

  return (
    <Layout>
      <div className="p-6 flex flex-col gap-4 h-full">
        <div>
          <h2 className="text-[16px] font-semibold text-slate-800">Transactions</h2>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex-1 overflow-hidden flex flex-col">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <span className="text-[13px] font-semibold text-slate-700">All Transactions</span>
              <span className="text-[11px] text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">{total}</span>
            </div>
            <TransactionsHeader
              handleOpenNewTx={handleOpenNewTx}
              onSearchChange={setQuery}
            />
          </div>

          <TransactionsTable
            transactions={items}
            fetching={false}
            error={null}
            hasNextPage={hasMore}
            loadMoreRef={loaderRef}
          />
        </div>

        <NewTransactionModal
          opened={newTransactionOpen}
          onClose={handleCloseNewTxModal}
        />
      </div>
    </Layout>
  )
}

export default Transactions
