export const getInitials = (name: string) => {
	const names = name.split(" ");
	if (names.length === 1) {
		return names[0].charAt(0);
	} else {
		return names[0].charAt(0) + names[1].charAt(0);
	}
};

export const isMobile = () =>
	typeof window !== "undefined" &&
	window.matchMedia("(max-width: 767px)").matches;

export const formatDate = (date: Date) => {
	const options: Intl.DateTimeFormatOptions = {
		year: "numeric",
		month: "long",
		day: "numeric",
	};
	return new Intl.DateTimeFormat("en-US", options).format(date);
};

export const getDateLabel = (date: Date): string => {
	const now = new Date();

	const startOfToday = new Date(
		now.getFullYear(),
		now.getMonth(),
		now.getDate(),
	);
	const startOfDate = new Date(
		date.getFullYear(),
		date.getMonth(),
		date.getDate(),
	);

	const diffDays = Math.round(
		(startOfToday.getTime() - startOfDate.getTime()) / (1000 * 60 * 60 * 24),
	);

	if (diffDays === 0) return "Today";
	if (diffDays === 1) return "Yesterday";
	if (diffDays < 7) {
		return date.toLocaleDateString("en-US", { weekday: "long" });
	}

	return date.toLocaleDateString("en-US", {
		month: "long",
		day: "numeric",
		year: "numeric",
	});
};
