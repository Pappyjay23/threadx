import { BrowserRouter as Router, Routes, useNavigate } from "react-router-dom";
import { routes } from "./routes";
import { mapRoutes } from "./utils/router";
import { useEffect } from "react";
import { useAuthStore } from "./store/useAuthStore";

const AppRoutes = () => {
	const navigate = useNavigate();
	const { checkAuth, clearAuthState } = useAuthStore();

	useEffect(() => {
		checkAuth();
	}, []);

	useEffect(() => {
		const handleForcedLogout = () => {
			clearAuthState();
			navigate("/login");
		};

		window.addEventListener("auth:logout", handleForcedLogout);
		return () => window.removeEventListener("auth:logout", handleForcedLogout);
	}, [navigate]);

	return <Routes>{mapRoutes(routes)}</Routes>;
};

const App = () => {
	return (
		<Router>
			<AppRoutes />
		</Router>
	);
};

export default App;