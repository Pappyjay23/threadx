import { Route } from "react-router-dom";
import type { RouteConfig } from "@/routes";
import PrivateRoute from "@/components/routes/PrivateRoute";
import PublicRoute from "@/components/routes/PublicRoute";

export const mapRoutes = (routes: RouteConfig[]) => {
	const privateRoutes = routes.filter((r) => r.isPrivate === true);
	const publicRoutes = routes.filter((r) => r.isPrivate === false);
	const errorRoutes = routes.filter((r) => r.isPrivate === undefined);

	return (
		<>
			{/* Private routes */}
			<Route element={<PrivateRoute />}>
				{privateRoutes.map(({ path, element }) => (
					<Route key={path} path={path} element={element} />
				))}
			</Route>

			{/* Public routes */}
			<Route element={<PublicRoute />}>
				{publicRoutes.map(({ path, element }) => (
					<Route key={path} path={path} element={element} />
				))}
			</Route>

			{/* Error/unguarded routes */}
			{errorRoutes.map(({ path, element }) => (
				<Route key={path} path={path} element={element} />
			))}
		</>
	);
};
