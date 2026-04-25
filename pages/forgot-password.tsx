import { useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import Image from "next/image";
import { Button, TextInput } from "@mantine/core";
import Link from "next/link";
import { IconArrowLeft, IconMailFilled } from "@tabler/icons-react";
import useSWRMutation from "swr/mutation";
import { toast } from "react-toastify";
import api from "@/lib/api";

const validationSchema = Yup.object({
	email: Yup.string().email("Invalid email").required("Email is required")
});

async function requestReset(_url: string, { arg }: { arg: { email: string } }) {
	const { data } = await api.post("/auth/admin/forgot-password", arg);
	return data;
}

export default function ForgotPasswordPage() {
	const [submitted, setSubmitted] = useState(false);
	const [sentTo, setSentTo] = useState("");
	const { trigger } = useSWRMutation(
		"/auth/admin/forgot-password",
		requestReset
	);

	const formik = useFormik({
		initialValues: { email: "" },
		validationSchema,
		onSubmit: async (values, { setSubmitting }) => {
			try {
				await trigger({ email: values.email });
				setSentTo(values.email);
				setSubmitted(true);
			} catch (err: any) {
				const message =
					err?.response?.data?.error ?? err?.message ?? "Something went wrong";
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
					{/* Branding */}
					<div className="flex flex-col items-center mb-6">
						<Image alt="logo" src="/assets/logo.png" width={72} height={72} />
					</div>

					{submitted ? (
						/* Success state */
						<div className="flex flex-col items-center text-center gap-3 py-2">
							<div className="bg-teal-50 rounded-full p-4">
								<IconMailFilled size={32} className="text-teal-600" />
							</div>
							<p className="text-[13px] font-semibold text-slate-800">
								Check your inbox
							</p>
							<p className="text-[11px] text-slate-500 leading-relaxed">
								We sent a password reset link to{" "}
								<span className="font-medium text-slate-700">{sentTo}</span>. It
								expires in 15 minutes.
							</p>
							<p className="text-[10px] text-slate-400 mt-1">
								Didn&apos;t receive it? Check your spam folder or{" "}
								<button
									type="button"
									className="text-teal-600 hover:underline"
									onClick={() => setSubmitted(false)}>
									try again
								</button>
								.
							</p>
						</div>
					) : (
						/* Form state */
						<>
							<div className="mb-5">
								<p className="text-[13px] font-semibold text-slate-800">
									Forgot your password?
								</p>
								<p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
									Enter your admin email and we&apos;ll send you a reset link.
								</p>
							</div>

							<form onSubmit={formik.handleSubmit} className="space-y-4">
								<TextInput
									label="Email address"
									placeholder="you@example.com"
									size="sm"
									withAsterisk
									{...formik.getFieldProps("email")}
									error={formik.touched.email && formik.errors.email}
								/>

								<Button
									fullWidth
									size="sm"
									type="submit"
									color="teal"
									loading={formik.isSubmitting}>
									Send Reset Link
								</Button>
							</form>
						</>
					)}

					<div className="flex justify-center mt-5">
						<Link
							href="/login"
							className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-teal-600 transition-colors">
							<IconArrowLeft size={12} />
							Back to sign in
						</Link>
					</div>
				</div>

				<p className="text-center text-[10px] text-slate-400 mt-4">
					&copy; {new Date().getFullYear()} Olitrack. All rights reserved.
				</p>
			</div>
		</div>
	);
}
