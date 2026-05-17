import LoadingPage from "@/pages/loading/LoadingPage";
import { useAuthStore } from "@/store/useAuthStore";
import { Navigate, Outlet } from "react-router-dom";

const PublicRoute = () => {
  const { isAuthenticated, isLoading } = useAuthStore();

	if (isLoading) return <LoadingPage />;

	return !isAuthenticated ? <Outlet /> : <Navigate to='/' replace />;
}

export default PublicRoute