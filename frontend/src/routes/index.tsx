import LoginPage from "@/pages/auth/LoginPage";
import SignupPage from "@/pages/auth/SignupPage";
import ForgotPasswordPage from "@/pages/auth/ForgotPasswordPage";
import ResetPasswordPage from "@/pages/auth/ResetPasswordPage";
import ErrorPage from "@/pages/error/ErrorPage";
import DashboardPage from "@/pages/home/DashboardPage";
import LandingPage from "@/pages/landing/LandingPage";

export type RouteConfig = {
	path: string;
	element: React.ReactNode;
	isPrivate?: boolean;
	label?: string;
};

export const routes: RouteConfig[] = [
	// Public Routes
	{
		path: "/landing",
		element: <LandingPage />,
		isPrivate: false,
		label: "Landing",
	},
	{
		path: "/login",
		element: <LoginPage />,
		isPrivate: false,
		label: "Login",
	},
	{
		path: "/signup",
		element: <SignupPage />,
		isPrivate: false,
		label: "Sign Up",
	},
	{
		path: "/forgot-password",
		element: <ForgotPasswordPage />,
		isPrivate: false,
		label: "Forgot Password",
	},
	{
		path: "/reset-password",
		element: <ResetPasswordPage />,
		isPrivate: false,
		label: "Reset Password",
	},

	// Protected Routes
	{
		path: "/",
		element: <DashboardPage />,
		isPrivate: true,
		label: "Home",
	},
	// {
	// 	path: "/note/:id",
	// 	element: (
	// 		<AppLayout>
	// 			<SingleNotePage />
	// 		</AppLayout>
	// 	),
	// 	isPrivate: true,
	// 	label: "Single Note",
	// },

	// Error Route
	{
		path: "*",
		element: <ErrorPage />,
		label: "Not Found",
	},
];
