import arcjet, { detectBot, shield, slidingWindow } from "@arcjet/node";
import { ENV } from "./env.config.js";

const commonRules = [
	shield({ mode: "LIVE" }),
	detectBot({
		mode: "LIVE",
		allow: ["CATEGORY:SEARCH_ENGINE"],
	}),
];

export const apiAj = arcjet({
	key: ENV.ARCJET_KEY as string,
	rules: [
		...commonRules,
		slidingWindow({
			mode: "LIVE",
			max: 100,
			interval: 60,
		}),
	],
});

export const authAj = arcjet({
	key: ENV.ARCJET_KEY as string,
	characteristics: ["ip.src"],
	rules: [
		...commonRules,
		slidingWindow({
			mode: "LIVE",
			max: 10,
			interval: 60,
		}),
	],
});
