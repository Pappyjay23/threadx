import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";

const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			staleTime: 1000 * 60 * 5, // Data stays "fresh" for 5 minutes
			retry: 1, // Retry failed requests once before showing error
			refetchOnWindowFocus: false, // Don't refetch when user switches tabs
		},
	},
});

createRoot(document.getElementById("root")!).render(
	<StrictMode>
		<QueryClientProvider client={queryClient}>
			<App />
			<Toaster
				theme='dark'
				position='top-center'
				toastOptions={{
					classNames: {
						toast:
							"group flex gap-3 w-full backdrop-blur-xl border border-white/10 threed-effect rounded-2xl p-4 shadow-2xl font-google-sans-flex bg-black/80 transition-all duration-300",

						success: "text-teal-400!",

						error: "text-red-400!",

						info: "text-purple-300!",

						title: "text-sm font-semibold",
						description: "text-xs text-white/60",

						actionButton:
							"bg-white/10 hover:bg-white/20 text-white rounded-lg px-3 py-1 text-xs",

						closeButton: "text-white/40 hover:text-white",
					},
				}}
			/>
		</QueryClientProvider>
	</StrictMode>,
);
