import cookieParser from "cookie-parser";
import express, {
	type NextFunction,
	type Request,
	type Response,
} from "express";
import { connectDB } from "./config/db.config.js";
import { ENV } from "./config/env.config.js";
import { allowedOrigins, app, server } from "./config/socket.config.js";
import { originValidator } from "./middlewares/origin.middleware.js";
import authRoutes from "./routes/auth.routes.js";
import messageRoutes from "./routes/message.routes.js";
import userRoutes from "./routes/user.routes.js";

const PORT = ENV.PORT || 5001;

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
		server.listen(PORT, () => {
			console.log(`Server running on port ${PORT}`);
		});
	})
	.catch((error) => {
		console.error("Error connecting to MongoDB:", error);
		process.exit(1);
	});
