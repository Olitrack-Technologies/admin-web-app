import Layout from "@/components/Layout";
import { BarChart, DonutChart } from "@mantine/charts";
import { Button, Card, Modal, Skeleton, Tabs } from "@mantine/core";
import { DateInput } from "@mantine/dates";
import { useViewportSize } from "@mantine/hooks";
import {
	IconAward,
	IconCar4wd,
	IconCpu,
	IconTrendingDown,
	IconTrendingUp,
	IconUsersGroup
} from "@tabler/icons-react";
import { useFormik } from "formik";
import Link from "next/link";
import React, { ReactNode, useState } from "react";
import * as Yup from "yup";
import useSWR from "swr";
import api from "@/lib/api";

// -----------------------------
// CountAnalytics Component
// -----------------------------
interface StatCardProps {
	value: number;
	label: string;
	change: number;
	icon: ReactNode;
	href: string;
}

const StatCard = ({ value, label, change, icon, href }: StatCardProps) => {
	const isPositive = change > 0;
	return (
		<Card shadow="sm" padding="lg" radius="md" withBorder>
			<div className="flex items-start justify-between">
				<div>
					<p className="text-[11px] font-medium text-slate-500 uppercase tracking-wide">
						{label}
					</p>
					<p className="text-[28px] font-bold text-slate-900 mt-1 leading-none">
						{value.toLocaleString("en")}
					</p>
					<div
						className={`flex items-center gap-1 mt-2 ${
							change > 0
								? "text-emerald-600"
								: change < 0
									? "text-red-500"
									: "text-slate-400"
						}`}>
						{change < 0 ? (
							<IconTrendingDown size={12} />
						) : (
							<IconTrendingUp size={12} />
						)}
						<span className="text-[10px] font-medium">
							{change}% in the past 7 days
						</span>
					</div>
				</div>
				<div className="p-2.5 rounded-xl bg-slate-100 text-slate-500">
					{icon}
				</div>
			</div>
			<Link
				href={href}
				className="block mt-4 text-[10px] text-teal-600 hover:underline font-medium">
				View all &rarr;
			</Link>
		</Card>
	);
};

interface CountStat {
	total: number;
	change: number;
}

interface CountsResponse {
	customers: CountStat;
	assets: CountStat;
	devices: CountStat;
	agents: CountStat;
}

async function fetchCounts(url: string): Promise<CountsResponse> {
	const { data } = await api.get(url);
	return data;
}

const CountAnalytics = () => {
	const { data, isLoading } = useSWR<CountsResponse>(
		"/analytics/counts",
		fetchCounts
	);

	if (isLoading) {
		return (
			<div className="grid grid-cols-4 gap-4">
				{[...Array(4)].map((_, i) => (
					<Skeleton key={i} height={120} radius="md" />
				))}
			</div>
		);
	}

	return (
		<div className="grid grid-cols-4 gap-4">
			<StatCard
				value={data?.customers.total ?? 0}
				label={"Customers"}
				change={data?.customers.change ?? 0}
				icon={<IconUsersGroup size={16} color="gray" />}
				href="/customers"
			/>
			<StatCard
				value={data?.assets.total ?? 0}
				label={"Assets"}
				change={data?.assets.change ?? 0}
				icon={<IconCar4wd size={16} color="gray" />}
				href="/assets"
			/>
			<StatCard
				value={data?.devices.total ?? 0}
				label={"Devices"}
				change={data?.devices.change ?? 0}
				icon={<IconCpu size={16} color="gray" />}
				href="/devices"
			/>
			<StatCard
				value={data?.agents.total ?? 0}
				label={"Agents"}
				change={data?.agents.change ?? 0}
				icon={<IconAward size={16} color="gray" />}
				href="/agents"
			/>
		</div>
	);
};

// -----------------------------
// Installations+Renewals Component
// -----------------------------

const InstallationsRenewals = () => {
	const { width } = useViewportSize();

	return (
		<div className="grid gap-10 grid-cols-2 p-4">
			<div className="col-span-1">
				<div className="mb-4">
					<strong>Installations</strong>
				</div>

				<Tabs defaultValue="day">
					<Tabs.List>
						<Tabs.Tab value="day">Day</Tabs.Tab>
						<Tabs.Tab value="week">Week</Tabs.Tab>
						<Tabs.Tab value="month">Month</Tabs.Tab>
						<Tabs.Tab value="year">Year</Tabs.Tab>
					</Tabs.List>

					<Tabs.Panel value="day">
						<div className="space-x-8 mt-6">
							<div className="space-y-4  mb-8">
								<h3 className="uppercase text-gray-500 text-[0.8rem]">
									Daily average
								</h3>
								<div>
									<strong>4</strong>
									<p className="text-gray-500">This Week</p>
								</div>
							</div>

							<BarChart
								h={300}
								data={[
									{ Day: "Mon", Installations: 5 },
									{ Day: "Tue", Installations: 5 },
									{ Day: "Wed", Installations: 5 },
									{ Day: "Thu", Installations: 5 },
									{ Day: "Fri", Installations: 5 },
									{ Day: "Sat", Installations: 5 },
									{ Day: "Sun", Installations: 5 }
								]}
								barProps={{
									radius: [8, 8, 0, 0],
									barSize: width / (300 / 7)
								}}
								dataKey="Day"
								series={[{ name: "Installations", color: "violet.6" }]}
								tickLine="y"
							/>
						</div>
					</Tabs.Panel>
					<Tabs.Panel value="week">
						<div className="space-x-8 mt-6">
							<div className="space-y-4  mb-8">
								<h3 className="uppercase text-gray-500 text-[0.8rem]">
									Weekly average
								</h3>
								<div>
									<strong>4</strong>
									<p className="text-gray-500">This Month</p>
								</div>
							</div>

							<BarChart
								h={300}
								data={[
									{ Week: "1st-7th", Installations: 5 },
									{ Week: "8th-15th", Installations: 5 },
									{ Week: "16th-23rd", Installations: 5 },
									{ Week: "23rd-30th", Installations: 5 }
								]}
								barProps={{
									radius: [8, 8, 0, 0],
									barSize: width / (100 / 4)
								}}
								dataKey="Week"
								series={[{ name: "Installations", color: "violet.6" }]}
								tickLine="y"
							/>
						</div>
					</Tabs.Panel>
					<Tabs.Panel value="month">
						<div className="space-x-8 mt-6">
							<div className="space-y-4  mb-8">
								<h3 className="uppercase text-gray-500 text-[0.8rem]">
									Monthly average
								</h3>
								<div>
									<strong>4</strong>
									<p className="text-gray-500">This Year</p>
								</div>
							</div>

							<BarChart
								h={300}
								data={[
									{ Month: "Jan", Installations: 5 },
									{ Month: "Feb", Installations: 5 },
									{ Month: "Mar", Installations: 5 },
									{ Month: "Apr", Installations: 5 },
									{ Month: "May", Installations: 5 },
									{ Month: "Jun", Installations: 5 },
									{ Month: "Jul", Installations: 5 },
									{ Month: "Aug", Installations: 5 },
									{ Month: "Sep", Installations: 5 },
									{ Month: "Oct", Installations: 5 },
									{ Month: "Nov", Installations: 5 },
									{ Month: "Dec", Installations: 5 }
								]}
								barProps={{
									radius: [8, 8, 0, 0],
									barSize: width / (1000 / 12)
								}}
								dataKey="Month"
								series={[{ name: "Installations", color: "violet.6" }]}
								tickLine="y"
							/>
						</div>
					</Tabs.Panel>
					<Tabs.Panel value="year">
						<div className="space-x-8 mt-6">
							<div className="space-y-4  mb-8">
								<h3 className="uppercase text-gray-500 text-[0.8rem]">
									Yearly average
								</h3>
								<div>
									<strong>4</strong>
									<p className="text-gray-500">Since beginning</p>
								</div>
							</div>

							<BarChart
								h={300}
								data={[
									{ Year: "2019", Installations: 5 },
									{ Year: "2020", Installations: 5 },
									{ Year: "2021", Installations: 5 },
									{ Year: "2022", Installations: 5 }
								]}
								barProps={{
									radius: [8, 8, 0, 0],
									barSize: width / (100 / 4)
								}}
								dataKey="Year"
								series={[{ name: "Installations", color: "violet.6" }]}
								tickLine="y"
							/>
						</div>
					</Tabs.Panel>
				</Tabs>
			</div>

			<div className="col-span-1">
				<div className="mb-4">
					<strong>Renewals</strong>
				</div>

				<Tabs defaultValue="day">
					<Tabs.List>
						<Tabs.Tab value="day">Day</Tabs.Tab>
						<Tabs.Tab value="week">Week</Tabs.Tab>
						<Tabs.Tab value="month">Month</Tabs.Tab>
						<Tabs.Tab value="year">Year</Tabs.Tab>
					</Tabs.List>

					<Tabs.Panel value="day">
						<div className="space-x-8 mt-6">
							<div className="space-y-4  mb-8">
								<h3 className="uppercase text-gray-500 text-[0.8rem]">
									Daily average
								</h3>
								<div>
									<strong>4</strong>
									<p className="text-gray-500">This Week</p>
								</div>
							</div>

							<BarChart
								h={300}
								data={[
									{ Day: "Mon", Renewals: 5 },
									{ Day: "Tue", Renewals: 5 },
									{ Day: "Wed", Renewals: 5 },
									{ Day: "Thu", Renewals: 5 },
									{ Day: "Fri", Renewals: 5 },
									{ Day: "Sat", Renewals: 5 },
									{ Day: "Sun", Renewals: 5 }
								]}
								barProps={{
									radius: [8, 8, 0, 0],
									barSize: width / (300 / 7)
								}}
								dataKey="Day"
								series={[{ name: "Renewals", color: "violet.6" }]}
								tickLine="y"
							/>
						</div>
					</Tabs.Panel>
					<Tabs.Panel value="week">
						<div className="space-x-8 mt-6">
							<div className="space-y-4  mb-8">
								<h3 className="uppercase text-gray-500 text-[0.8rem]">
									Weekly average
								</h3>
								<div>
									<strong>4</strong>
									<p className="text-gray-500">This Month</p>
								</div>
							</div>

							<BarChart
								h={300}
								data={[
									{ Week: "1st-7th", Renewals: 5 },
									{ Week: "8th-15th", Renewals: 5 },
									{ Week: "16th-23rd", Renewals: 5 },
									{ Week: "23rd-30th", Renewals: 5 }
								]}
								barProps={{
									radius: [8, 8, 0, 0],
									barSize: width / (100 / 4)
								}}
								dataKey="Week"
								series={[{ name: "Renewals", color: "violet.6" }]}
								tickLine="y"
							/>
						</div>
					</Tabs.Panel>
					<Tabs.Panel value="month">
						<div className="space-x-8 mt-6">
							<div className="space-y-4  mb-8">
								<h3 className="uppercase text-gray-500 text-[0.8rem]">
									Monthly average
								</h3>
								<div>
									<strong>4</strong>
									<p className="text-gray-500">This Year</p>
								</div>
							</div>

							<BarChart
								h={300}
								data={[
									{ Month: "Jan", Renewals: 5 },
									{ Month: "Feb", Renewals: 5 },
									{ Month: "Mar", Renewals: 5 },
									{ Month: "Apr", Renewals: 5 },
									{ Month: "May", Renewals: 5 },
									{ Month: "Jun", Renewals: 5 },
									{ Month: "Jul", Renewals: 5 },
									{ Month: "Aug", Renewals: 5 },
									{ Month: "Sep", Renewals: 5 },
									{ Month: "Oct", Renewals: 5 },
									{ Month: "Nov", Renewals: 5 },
									{ Month: "Dec", Renewals: 5 }
								]}
								barProps={{
									radius: [8, 8, 0, 0],
									barSize: width / (1000 / 12)
								}}
								dataKey="Month"
								series={[{ name: "Renewals", color: "violet.6" }]}
								tickLine="y"
							/>
						</div>
					</Tabs.Panel>
					<Tabs.Panel value="year">
						<div className="space-x-8 mt-6">
							<div className="space-y-4  mb-8">
								<h3 className="uppercase text-gray-500 text-[0.8rem]">
									Yearly average
								</h3>
								<div>
									<strong>4</strong>
									<p className="text-gray-500">Since beginning</p>
								</div>
							</div>

							<BarChart
								h={300}
								data={[
									{ Year: "2019", Renewals: 5 },
									{ Year: "2020", Renewals: 5 },
									{ Year: "2021", Renewals: 5 },
									{ Year: "2022", Renewals: 5 }
								]}
								barProps={{
									radius: [8, 8, 0, 0],
									barSize: width / (100 / 4)
								}}
								dataKey="Year"
								series={[{ name: "Renewals", color: "violet.6" }]}
								tickLine="y"
							/>
						</div>
					</Tabs.Panel>
				</Tabs>
			</div>
		</div>
	);
};

// -----------------------------
// Pie Stats Component
// -----------------------------

const PieStats = () => {
	const { width } = useViewportSize();
	const MOCK_DATA = [
		{ name: "ST_901", value: 400, color: "indigo.6" },
		{ name: "JT-808", value: 300, color: "yellow.6" }
	];

	const MOCK_DATA_2 = [
		{ name: "Installations", value: 400, color: "blue.6" },
		{ name: "Renewals", value: 300, color: "green.6" }
	];

	const MOCK_DATA_3 = [
		{ name: "CAR", value: 400, color: "indigo.6" },
		{ name: "LORRY", value: 300, color: "yellow.6" },
		{ name: "MOTORCYCLE", value: 300, color: "pink.6" }
	];

	return (
		<div className="grid grid-cols-3 gap-12">
			<div className="col-span-1">
				<div className="mb-4">
					<strong>Device Types</strong>
				</div>
				<DonutChart
					size={(width - 500) / 3}
					tooltipDataSource="segment"
					labelsType="value"
					chartLabel={"Devices by type"}
					data={MOCK_DATA}
				/>
			</div>

			<div className="col-span-1">
				<div className="mb-4">
					<strong>Revenue Source (Past 30 days)</strong>
				</div>
				<DonutChart
					size={(width - 500) / 3}
					tooltipDataSource="segment"
					labelsType="value"
					chartLabel={"Revenue source distribution"}
					data={MOCK_DATA_2}
				/>
			</div>

			<div className="col-span-1">
				<div className="mb-4">
					<strong>Asset Types</strong>
				</div>
				<DonutChart
					size={(width - 500) / 3}
					tooltipDataSource="segment"
					labelsType="value"
					chartLabel={"Assets by type"}
					data={MOCK_DATA_3}
				/>
			</div>
		</div>
	);
};

// -----------------------------
// ExecReportParamsModal Component
// -----------------------------

interface ReportParams {
	from: Date | null;
	to: Date | null;
}

interface ExecReportParamsModalProps {
	opened: boolean;
	onClose: () => void;
}

const validationSchema = Yup.object({
	from: Yup.date().nullable().required("Required"),
	to: Yup.date().nullable().required("Required")
});

export const ExecReportParamsModal = ({
	opened,
	onClose
}: ExecReportParamsModalProps) => {
	// Functions
	const handleGenerateReport = async (values: ReportParams) => {
		console.log(" Submitting form", values);
		await new Promise((resolve) => setTimeout(resolve, 2000));
		console.log("✅ Saved successfully");
	};

	const handleError = (err: Error | unknown) => {
		console.error(err);
	};

	// Formik
	const formik = useFormik({
		initialValues: {
			from: null as Date | null,
			to: null as Date | null
		},
		validationSchema,
		onSubmit: async (values, { setSubmitting }) => {
			try {
				await handleGenerateReport(values);
			} catch (error) {
				handleError(error);
			} finally {
				setSubmitting(false);
			}
		}
	});

	return (
		<Modal
			opened={opened}
			onClose={onClose}
			title={<h1>Generate Executive Report</h1>}
			centered>
			<form onSubmit={formik.handleSubmit}>
				<div className="p-8 space-y-3">
					{/* From Date */}
					<DateInput
						size="xs"
						label="From"
						placeholder="Select start date"
						value={formik.values.from}
						onChange={(val) => formik.setFieldValue("from", val)}
						onBlur={() => formik.setFieldTouched("from", true)}
						error={formik.touched.from && formik.errors.from}
					/>

					{/* To Date */}
					<DateInput
						label="To"
						size="xs"
						placeholder="Select end date"
						value={formik.values.to}
						onChange={(val) => formik.setFieldValue("to", val)}
						onBlur={() => formik.setFieldTouched("to", true)}
						error={formik.touched.to && formik.errors.to}
					/>
				</div>

				<div className="flex justify-end px-8 pb-4">
					<Button
						size="xs"
						type="submit"
						loading={formik.isSubmitting}
						disabled={formik.isSubmitting}>
						Generate report
					</Button>
				</div>
			</form>
		</Modal>
	);
};

// -----------------------------
// Exported Component
// -----------------------------

function Analytics() {
	// States & Refs
	const [execReportModalOpen, setExecReportModalOpen] = useState(false);

	// Functions
	const handleCloseExecReportModal = () => {
		setExecReportModalOpen(false);
	};

	return (
		<Layout>
			<div className="p-6 space-y-6 max-h-[calc(100vh-56px)] overflow-y-auto">
				<div className="flex items-center justify-between">
					<div>
						<h2 className="text-[16px] font-semibold text-slate-800">
							Analytics
						</h2>
					</div>
					<Button
						size="xs"
						color="teal"
						onClick={() => setExecReportModalOpen(true)}>
						Generate Executive Report
					</Button>
				</div>

				<CountAnalytics />

				<div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
					<InstallationsRenewals />
				</div>

				<div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
					<PieStats />
				</div>

				<ExecReportParamsModal
					opened={execReportModalOpen}
					onClose={handleCloseExecReportModal}
				/>
			</div>
		</Layout>
	);
}

export default Analytics;
