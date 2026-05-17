import LoadingPage from "@/pages/loading/LoadingPage";
import { useAuthStore } from "@/store/useAuthStore";
import { Navigate, Outlet } from "react-router-dom";

const PrivateRoute = () => {
	const { isAuthenticated, isLoading } = useAuthStore();

	if (isLoading) return <LoadingPage />;

	return isAuthenticated ? <Outlet /> : <Navigate to='/landing' replace />;
};

export default PrivateRoute;
