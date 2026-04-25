import { useFormik } from "formik";
import * as Yup from "yup";
import Image from "next/image";
import { Button, PasswordInput, TextInput } from "@mantine/core";
import Link from "next/link";
import { useRouter } from "next/router";
import useSWRMutation from "swr/mutation";
import { toast } from "react-toastify";
import api from "@/lib/api";

interface LoginFormValues {
	email: string;
	password: string;
}

const validationSchema = Yup.object({
	email: Yup.string().email("Invalid email").required("Email is required"),
	password: Yup.string()
		.min(6, "Minimum 6 characters")
		.required("Password is required")
});

async function adminLogin(_url: string, { arg }: { arg: LoginFormValues }) {
	const { data } = await api.post("/auth/admin/login", arg);
	return data;
}

export default function LoginPage() {
	const router = useRouter();
	const { trigger } = useSWRMutation("/auth/admin/login", adminLogin);

	const formik = useFormik({
		initialValues: { email: "", password: "" },
		validationSchema,
		onSubmit: async (values, { setSubmitting }) => {
			try {
				await trigger(values);
				router.push("/");
			} catch (err: any) {
				const message =
					err?.response?.data?.error ?? err?.message ?? "Login failed";
				toast.error(message);
			} finally {
				setSubmitting(false);
			}
		}
	});

	return (
		<div className="relative h-screen flex items-center justify-center overflow-hidden">
			<Image
				src="/assets/fleet.jpg"
				alt="background"
				fill
				className="object-cover"
				priority
			/>

			<div className="absolute inset-0 bg-slate-900/75" />

			<div className="relative z-10 w-[360px]">
				<div className="bg-white rounded-2xl shadow-2xl px-8 pt-8 pb-6 border border-slate-100">
					<div className="flex flex-col items-center mb-6">
						<Image alt="logo" src="/assets/logo.png" width={72} height={72} />
						<h2 className="mt-4 text-[18px] font-[Nasalization] font-bold tracking-widest text-slate-900">
							OLITRACK
						</h2>
						<p className="text-[11px] text-slate-400 mt-1">
							Fleet Management System
						</p>
					</div>

					<form onSubmit={formik.handleSubmit} className="space-y-3">
						<TextInput
							label="Email address"
							placeholder="you@example.com"
							size="sm"
							withAsterisk
							{...formik.getFieldProps("email")}
							error={formik.touched.email && formik.errors.email}
						/>

						<PasswordInput
							label="Password"
							placeholder="Your password"
							size="sm"
							withAsterisk
							{...formik.getFieldProps("password")}
							error={formik.touched.password && formik.errors.password}
						/>

						<div className="flex justify-end">
							<Link
								href="/forgot-password"
								className="text-[11px] text-teal-600 hover:text-teal-700 hover:underline">
								Forgot password?
							</Link>
						</div>

						<Button
							fullWidth
							size="sm"
							type="submit"
							color="teal"
							loading={formik.isSubmitting}
							className="mt-2">
							Sign In
						</Button>
					</form>
				</div>

				<p className="text-center text-[10px] text-slate-400 mt-4">
					&copy; {new Date().getFullYear()} Olitrack. All rights reserved.
				</p>
			</div>
		</div>
	);
}
