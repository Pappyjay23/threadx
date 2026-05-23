import { ENV } from "../config/env.config.js";
import { sender, transporter } from "../config/nodemailer.config.js";
import { resendClient, resendSender } from "../config/resend.config.js";
import { createWelcomeEmailTemplate } from "../template/email.template.js";

export const sendWelcomeEmail = async (userEmail: string, userName: string, clientURL: string) => {
	try {
		if (ENV.NODE_ENV === "development") {
			// --- NODEMAILER SETUP (Development) ---
			const info = await transporter.sendMail({
				from: `${sender.name} <${sender.email}>`,
				to: userEmail,
				subject: "Welcome to ThreadX",
				html: createWelcomeEmailTemplate(userName, clientURL),
			});

			console.log("Nodemailer Success:", info.messageId);
		} else {
			// --- RESEND SETUP (Production) ---
			const { data, error } = await resendClient.emails.send({
				from: `${resendSender.name} <${resendSender.email}>`,
				to: userEmail,
				subject: "Welcome to ThreadX",
				html: createWelcomeEmailTemplate(userName, clientURL),
			});

			if (error) {
				return console.error({ error });
			}

			console.log("Resend Success:", data.id);
		}
	} catch (error) {
		console.error("Error while sending mail:", error);
	}
};