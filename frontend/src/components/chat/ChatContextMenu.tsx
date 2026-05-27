import { useEffect, useRef } from "react";
import { FiSearch, FiX } from "react-icons/fi";

interface ChatContextMenuProps {
	position: { top: number; left: number } | null;
	onSearchMessages: () => void;
	onCloseChat: () => void;
	onClose: () => void;
}

const ChatContextMenu = ({
	position,
	onSearchMessages,
	onCloseChat,
	onClose,
}: ChatContextMenuProps) => {
	const ref = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (!position) return;

		const handleClickOutside = (e: MouseEvent) => {
			if (ref.current && !ref.current.contains(e.target as Node)) {
				onClose();
			}
		};

		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key === "Escape") onClose();
		};

		// Use setTimeout to avoid immediate closing on the same right-click event
		const timeoutId = setTimeout(() => {
			document.addEventListener("mousedown", handleClickOutside);
			document.addEventListener("keydown", handleKeyDown);
		}, 100);

		return () => {
			clearTimeout(timeoutId);
			document.removeEventListener("mousedown", handleClickOutside);
			document.removeEventListener("keydown", handleKeyDown);
		};
	}, [position, onClose]);

	if (!position) return null;

	return (
		<div
			ref={ref}
			style={{
				position: "fixed",
				top: position.top,
				left: position.left,
				zIndex: 9999,
			}}
			className='min-w-44 bg-secondary border border-primary/20 rounded-lg shadow-lg shadow-black/40 backdrop-blur-sm overflow-hidden py-1'
			>
			<button
				onClick={() => {
					onSearchMessages();
					onClose();
				}}
				className='w-full flex items-center gap-2.5 px-3 py-2 text-xs text-foreground/70 hover:text-white hover:bg-primary/10 transition-all duration-200 cursor-pointer'>
				<FiSearch className='h-3.5 w-3.5 shrink-0' />
				Search messages
			</button>

			<div className='h-px bg-primary/10 mx-2 my-1' />

			<button
				onClick={() => {
					onCloseChat();
					onClose();
				}}
				className='w-full flex items-center gap-2.5 px-3 py-2 text-xs text-red-400/80 hover:text-red-400 hover:bg-red-400/5 transition-all duration-200 cursor-pointer'>
				<FiX className='h-3.5 w-3.5 shrink-0' />
				Close chat
			</button>
		</div>
	);
};

export default ChatContextMenu;
