import { authApi } from "@/api/auth";
import LazyImage from "@/components/chat/LazyImage";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import {
	forgotPasswordSchema,
	type ForgotPasswordFormData,
} from "@/schemas/authSchema";
import type { ErrorResponse } from "@/types/auth";
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

const ForgotPasswordPage: React.FC = () => {
	const [formData, setFormData] = useState<ForgotPasswordFormData>({
		email: "",
	});
	const [errors, setErrors] = useState<
		Partial<Record<keyof ForgotPasswordFormData, string>>
	>({});
	const [loading, setLoading] = useState(false);

	const validateField = (name: keyof ForgotPasswordFormData, value: string) => {
		const result = forgotPasswordSchema.safeParse({
			...formData,
			[name]: value,
		});

		if (!result.success) {
			const fieldError = result.error.issues.find(
				(issue) => issue.path[0] === name,
			);
			setErrors((prev) => ({ ...prev, [name]: fieldError?.message || "" }));
		} else {
			setErrors((prev) => ({ ...prev, [name]: "" }));
		}
	};

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target;
		setFormData((prev) => ({ ...prev, [name]: value }));
		validateField(name as keyof ForgotPasswordFormData, value);
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		const result = forgotPasswordSchema.safeParse(formData);
		if (!result.success) {
			const fieldErrors: Partial<Record<keyof ForgotPasswordFormData, string>> =
				{};
			result.error.issues.forEach((err) => {
				const field = err.path[0] as keyof ForgotPasswordFormData;
				fieldErrors[field] = err.message;
			});
			setErrors(fieldErrors);
			return;
		}

		try {
			setLoading(true);
			await authApi.forgotPassword(formData.email);
			toast.success(
				"If an account exists for this email, a reset link has been sent.",
			);
		} catch (error) {
			const message =
				(error as ErrorResponse)?.message ??
				"Failed to send reset email. Please try again later.";
			toast.error(message);
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className='relative min-h-svh bg-[#060415] text-white flex items-center justify-center overflow-hidden selection:bg-[#7556d3]/30 px-4 py-10'>
			<div className='absolute top-1/3 left-1/4 -translate-x-1/2 -translate-y-1/2 w-150 h-150 bg-[#7556d3]/5 rounded-full blur-[140px] pointer-events-none' />
			<div className='absolute bottom-12 right-1/4 w-100 h-100 bg-[#6347b7]/5 rounded-full blur-[120px] pointer-events-none' />

			<div className='w-full max-w-lg rounded-3xl border border-white/5 bg-[#0e0b24]/30 p-8 md:p-10 backdrop-blur-xl shadow-2xl z-10'>
				<div className='flex items-center justify-between gap-4 mb-4'>
					<div className='flex items-center gap-1 group'>
						<div className='relative h-7 w-7 rounded-[7px] bg-[#0c0926] border border-[#7556d3]/20 group-hover:border-[#7556d3]/50 transition-colors duration-300 overflow-hidden'>
							<LazyImage
								src='logo.png'
								alt='ThreadX'
								className='h-full w-full object-cover'
							/>
						</div>
						<p className='text-base text-foreground font-medium'>ThreadX</p>
					</div>

					<Link
						to='/login'
						className='text-xs text-zinc-300 hover:text-white transition-colors'>
						Back to login
					</Link>
				</div>
				<h1 className='text-2xl font-semibold tracking-tight text-white mb-4'>
					Forgot your password?
				</h1>

				<p className='text-sm text-zinc-300 leading-relaxed mb-8'>
					Enter the email address connected to your account and we’ll send you a secure
					link to reset your password.
				</p>

				<form onSubmit={handleSubmit} className='space-y-5'>
					<div className='space-y-1.5'>
						<label
							htmlFor='email'
							className='text-[11px] font-semibold uppercase tracking-wider text-zinc-400 block px-1'>
							Email Address
						</label>
						<Input
							id='email'
							name='email'
							type='email'
							placeholder='name@domain.com'
							value={formData.email}
							onChange={handleInputChange}
						/>
						{errors.email && (
							<p className='text-[10px] text-red-400 px-1'>{errors.email}</p>
						)}
					</div>

					<Button type='submit' disabled={loading} className='w-full'>
						{loading ? "Sending reset email..." : "Send reset link"}
					</Button>
				</form>
			</div>
		</div>
	);
};

export default ForgotPasswordPage;
