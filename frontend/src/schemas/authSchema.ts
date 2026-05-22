import { z } from "zod";

export const loginSchema = z.object({
	email: z.email("Invalid email address").toLowerCase().trim(),
	password: z.string().min(6, "Password must be at least 6 characters"),
});

export const signupSchema = z.object({
	firstName: z
		.string()
		.min(2, "First name must be at least 2 characters")
		.max(50, "First name must be less than 50 characters")
		.trim(),
	lastName: z
		.string()
		.min(2, "Last name must be at least 2 characters")
		.max(50, "Last name must be less than 50 characters")
		.trim(),
	email: z.email("Invalid email address").toLowerCase().trim(),
	password: z
		.string()
		.min(6, "Password must be at least 6 characters")
		.regex(
			/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
			"Password must contain uppercase, lowercase, and number",
		),
});

export type LoginFormData = z.infer<typeof loginSchema>;
export type SignupFormData = z.infer<typeof signupSchema>;