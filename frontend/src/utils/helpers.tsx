export const getInitials = (name: string) => {
	const names = name.split(" ");
	if (names.length === 1) {
		return names[0].charAt(0);
	} else {
		return names[0].charAt(0) + names[1].charAt(0);
	}
};

export const isMobile = () => typeof window !== "undefined" && window.matchMedia('(max-width: 767px)').matches;

export const formatDate = (date: Date) => {
	const options: Intl.DateTimeFormatOptions = {
		year: "numeric",
		month: "long",
		day: "numeric",
	};
	return new Intl.DateTimeFormat("en-US", options).format(date);
};
