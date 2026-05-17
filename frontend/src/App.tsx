import { BrowserRouter as Router, Routes } from "react-router-dom";
import { routes } from "./routes";
import { mapRoutes } from "./utils/router";

const App = () => {
	return (
		<Router>
			<Routes>
				{mapRoutes(routes)}
			</Routes>
		</Router>
	);
};

export default App;
