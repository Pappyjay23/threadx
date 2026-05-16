import express from "express";
import "dotenv/config";

const app = express();

const PORT = process.env.PORT || 5001;

app.get("/", (req, res) => {
	res.json({ message: "Hello World!" });
});

app.listen(PORT, () => {
    console.log("Server is running on port " + PORT);
});