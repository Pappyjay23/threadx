import cookieParser from "cookie-parser";
import cors from "cors";
import express, {
	type NextFunction,
	type Request,
	type Response,
} from "express";
import { connectDB } from "./config/db.config.js";
import { ENV } from "./config/env.config.js";
import { originValidator } from "./middlewares/origin.middleware.js";
import authRoutes from "./routes/auth.routes.js";
import messageRoutes from "./routes/message.routes.js";
import userRoutes from "./routes/user.routes.js";

const app = express();
const PORT = ENV.PORT || 5001;

const devOrigins = ["http://localhost:5173", "http://localhost:5001"];

const prodOrigins = [ENV.CLIENT_URL, ENV.SERVER_URL].filter(
	Boolean,
) as string[];

if (ENV.NODE_ENV === "production" && prodOrigins.length === 0) {
	console.error(
		"WARNING: No CORS origins configured for production. Set CLIENT_URL or SERVER_URL.",
	);
}

const allowedOrigins = ENV.NODE_ENV === "production" ? prodOrigins : devOrigins;

app.use(
	cors({
		origin: (origin, callback) => {
			if (!origin || allowedOrigins.includes(origin)) {
				callback(null, true);
			} else {
				callback(new Error("Not allowed by CORS"));
			}
		},
		credentials: true,
	}),
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(originValidator(allowedOrigins));

app.get("/health", (_, res) => {
	res.json({ status: "ok", message: "ThreadX API is running" });
});

app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/messages", messageRoutes);

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
	if (err.message === "Not allowed by CORS") {
		return res.status(403).json({
			success: false,
			message: "Origin not allowed",
		});
	}

	console.error(err.stack);

	res.status(500).json({
		success: false,
		message: "Internal server error",
	});
});

connectDB()
	.then(() => {
		app.listen(PORT, () => {
			console.log(`Server running on port ${PORT}`);
		});
	})
	.catch((error) => {
		console.error("Error connecting to MongoDB:", error);
		process.exit(1);
	});
