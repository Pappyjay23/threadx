import { ENV } from "../config/env.config.js";
import { sender, transporter } from "../config/nodemailer.config.js";
import { resendClient, resendSender } from "../config/resend.config.js";
import {
	createPasswordResetConfirmationEmailTemplate,
	createPasswordResetEmailTemplate,
	createWelcomeEmailTemplate,
} from "../template/email.template.js";

const sendMail = async (
	templateSubject: string,
	targetEmail: string,
	html: string,
) => {
	if (ENV.NODE_ENV === "development") {
		const info = await transporter.sendMail({
			from: `${sender.name} <${sender.email}>`,
			to: targetEmail,
			subject: templateSubject,
			html,
		});

		console.log("Nodemailer Success:", info.messageId);
		return;
	}

	const { data, error } = await resendClient.emails.send({
		from: `${resendSender.name} <${resendSender.email}>`,
		to: targetEmail,
		subject: templateSubject,
		html,
	});

	if (error) {
		throw new Error(error.message || "Failed to send email");
	}

	console.log("Resend Success:", data.id);
};

export const sendWelcomeEmail = async (
	userEmail: string,
	userName: string,
	clientURL: string,
) => {
	try {
		await sendMail(
			"Welcome to ThreadX",
			userEmail,
			createWelcomeEmailTemplate(userName, clientURL),
		);
	} catch (error) {
		console.error("Error while sending welcome email:", error);
	}
};

export const sendPasswordResetEmail = async (
	userEmail: string,
	userName: string,
	resetLink: string,
) => {
	await sendMail(
		"Reset your ThreadX password",
		userEmail,
		createPasswordResetEmailTemplate(userName, resetLink),
	);
};

export const sendPasswordResetConfirmationEmail = async (
	userEmail: string,
	userName: string,
) => {
	await sendMail(
		"Your ThreadX password has been updated",
		userEmail,
		createPasswordResetConfirmationEmailTemplate(userName),
	);
};
