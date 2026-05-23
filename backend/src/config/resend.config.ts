import { Resend } from "resend";
import { ENV } from "./env.config.js";

export const resendClient = new Resend(ENV.RESEND_API_KEY);

export const resendSender = {
	name: ENV.RESEND_EMAIL_FROM_NAME,
	email: ENV.RESEND_EMAIL_FROM,
};
