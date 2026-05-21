// Audio setup
const keyStrokeSounds = [
	new Audio("/sounds/keystroke1.mp3"),
	new Audio("/sounds/keystroke2.mp3"),
	new Audio("/sounds/keystroke3.mp3"),
	new Audio("/sounds/keystroke4.mp3"),
];
const mouseClickSound = new Audio("/sounds/mouse-click.mp3");
const notificationSound = new Audio("/sounds/notification.mp3");
const sendMessageSound = new Audio("/sounds/send-message.mp3");

const useSound = () => {
	const playRandomKeyStrokeSound = () => {
		const randomSound =
			keyStrokeSounds[Math.floor(Math.random() * keyStrokeSounds.length)];

		randomSound.currentTime = 0; //This is for a better UX.
		randomSound.volume = 0.5;
		randomSound
			.play()
			.catch((error) => console.error("Audio play failed", error));
	};

	const playMouseClickSound = () => {
		mouseClickSound.currentTime = 0;
		mouseClickSound.volume = 0.5;
		mouseClickSound
			.play()
			.catch((error) => console.error("Audio play failed", error));
	};

	const playNotificationSound = () => {
		notificationSound.currentTime = 0;
		notificationSound.volume = 0.5;
		notificationSound
			.play()
			.catch((error) => console.error("Audio play failed", error));
	};
	const playSendMessageSound = () => {
		sendMessageSound.currentTime = 0;
		sendMessageSound.volume = 0.3;
		sendMessageSound
			.play()
			.catch((error) => console.error("Audio play failed", error));
	};

	return {
		playRandomKeyStrokeSound,
		playMouseClickSound,
		playNotificationSound,
		playSendMessageSound,
	};
};

export default useSound;
