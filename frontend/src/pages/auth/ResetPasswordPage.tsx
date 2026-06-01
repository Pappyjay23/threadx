import { authApi } from "@/api/auth";
import LazyImage from "@/components/chat/LazyImage";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import {
	resetPasswordSchema,
	type ResetPasswordFormData,
} from "@/schemas/authSchema";
import type { ErrorResponse } from "@/types/auth";
import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";

const useQuery = () => {
	return new URLSearchParams(useLocation().search);
};

const ResetPasswordPage: React.FC = () => {
	const query = useQuery();
	const navigate = useNavigate();
	const token = query.get("token") || "";

	const [formData, setFormData] = useState<ResetPasswordFormData>({
		token,
		newPassword: "",
		confirmPassword: "",
	});
	const [errors, setErrors] = useState<
		Partial<Record<keyof ResetPasswordFormData, string>>
	>({});
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		if (!token) {
			setErrors((prev) => ({
				...prev,
				token: "Invalid or missing reset token.",
			}));
		}
	}, [token]);

	const validateField = (name: keyof ResetPasswordFormData, value: string) => {
		const result = resetPasswordSchema.safeParse({
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
		validateField(name as keyof ResetPasswordFormData, value);
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!token) {
			const message = "Invalid or missing reset token.";
			setErrors((prev) => ({ ...prev, token: message }));
			toast.error(message);
			return;
		}

		const result = resetPasswordSchema.safeParse(formData);
		if (!result.success) {
			const fieldErrors: Partial<Record<keyof ResetPasswordFormData, string>> =
				{};
			result.error.issues.forEach((err) => {
				const field = err.path[0] as keyof ResetPasswordFormData;
				fieldErrors[field] = err.message;
			});
			setErrors(fieldErrors);
			return;
		}

		try {
			setLoading(true);
			await authApi.resetPassword(
				token,
				formData.newPassword,
				formData.confirmPassword,
			);
			toast.success("Your password has been reset successfully.");
			navigate("/login");
		} catch (error) {
			const message =
				(error as ErrorResponse)?.message ??
				"Failed to reset password. Please try again later.";
			setErrors((prev) => ({ ...prev, token: message }));
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
					Create a new password
				</h1>

				{errors.token ? (
					<p className='text-sm text-red-400 mb-6'>{errors.token}</p>
				) : (
					<p className='text-sm text-zinc-300 leading-relaxed mb-6'>
						Choose a strong password with at least 6 characters.
					</p>
				)}

				<form onSubmit={handleSubmit} className='space-y-5'>
					<div className='space-y-1.5'>
						<label
							htmlFor='newPassword'
							className='text-[11px] font-semibold uppercase tracking-wider text-zinc-400 block px-1'>
							New Password
						</label>
						<Input
							id='newPassword'
							name='newPassword'
							type='password'
							placeholder='••••••••'
							value={formData.newPassword}
							onChange={handleInputChange}
						/>
						{errors.newPassword && (
							<p className='text-[10px] text-red-400 px-1'>
								{errors.newPassword}
							</p>
						)}
					</div>

					<div className='space-y-1.5'>
						<label
							htmlFor='confirmPassword'
							className='text-[11px] font-semibold uppercase tracking-wider text-zinc-400 block px-1'>
							Confirm Password
						</label>
						<Input
							id='confirmPassword'
							name='confirmPassword'
							type='password'
							placeholder='••••••••'
							value={formData.confirmPassword}
							onChange={handleInputChange}
						/>
						{errors.confirmPassword && (
							<p className='text-[10px] text-red-400 px-1'>
								{errors.confirmPassword}
							</p>
						)}
					</div>

					<Button
						type='submit'
						disabled={loading || !!errors.token}
						className='w-full'>
						{loading ? "Resetting password..." : "Reset password"}
					</Button>
				</form>
			</div>
		</div>
	);
};

export default ResetPasswordPage;
