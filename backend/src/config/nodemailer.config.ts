import nodemailer from "nodemailer";
import { ENV } from "./env.config.js";

export const transporter = nodemailer.createTransport({
	host: "smtp.gmail.com",
	port: 587,
	secure: false,
	auth: {
		user: ENV.NODEMAILER_EMAIL_FROM,
		pass: ENV.NODEMAILER_EMAIL_PASS,
	},
	tls: {
		rejectUnauthorized: false, // Helps with some local network issues
	},
});

export const sender = {
	name: ENV.NODEMAILER_EMAIL_FROM_NAME,
	email: ENV.NODEMAILER_EMAIL_FROM,
};
