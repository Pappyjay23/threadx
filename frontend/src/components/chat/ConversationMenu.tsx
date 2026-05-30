import { useEffect, useRef } from "react";
import { FiCheckCircle, FiTrash2 } from "react-icons/fi";
import { BsPin, BsPinFill } from "react-icons/bs";

interface ConversationMenuProps {
	chatId: string;
	isPinned: boolean;
	hasUnread: boolean;
	isGroup?: boolean;
	position: { top: number; left: number } | null;
	onClose: () => void;
	onPinToggle: (chatId: string) => void;
	onMarkRead: (chatId: string) => void;
	onDelete?: (chatId: string) => void;
}

const ConversationMenu = ({
	chatId,
	isPinned,
	hasUnread,
	isGroup = false,
	position,
	onClose,
	onPinToggle,
	onMarkRead,
	onDelete,
}: ConversationMenuProps) => {
	const ref = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (!position) return;

		const handleClickOutside = (e: MouseEvent) => {
			const target = e.target as HTMLElement;
			if (target.closest('[aria-label="Chat menu"]')) {
				return;
			}
			if (ref.current && !ref.current.contains(target)) {
				onClose();
			}
		};

		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key === "Escape") onClose();
		};

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
			className='min-w-44 bg-secondary border border-primary/20 rounded-lg shadow-lg shadow-black/40 backdrop-blur-sm overflow-hidden py-1 animate-fade-in'>
			<button
				onClick={() => {
					onPinToggle(chatId);
					onClose();
				}}
				className='w-full flex items-center gap-2.5 px-3 py-2.5 text-xs text-foreground/70 hover:text-white hover:bg-primary/10 transition-all duration-150 cursor-pointer'>
				{isPinned ? (
					<>
						<BsPinFill className='h-3.5 w-3.5 shrink-0' />
						Unpin chat
					</>
				) : (
					<>
						<BsPin className='h-3.5 w-3.5 shrink-0' />
						Pin chat
					</>
				)}
			</button>

			<button
				onClick={() => {
					onMarkRead(chatId);
					onClose();
				}}
				disabled={!hasUnread}
				className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-xs transition-all duration-150 ${
					hasUnread
						? "text-foreground/70 hover:text-white hover:bg-primary/10 cursor-pointer"
						: "text-foreground/30 cursor-not-allowed"
				}`}>
				<FiCheckCircle className='h-3.5 w-3.5 shrink-0' />
				Mark as read
			</button>

			{onDelete && (
				<>
					<div className='h-px bg-primary/10 mx-2 my-1' />
					<button
						onClick={() => {
							onDelete(chatId);
							onClose();
						}}
						className='w-full flex items-center gap-2.5 px-3 py-2.5 text-xs text-red-400/80 hover:text-red-400 hover:bg-red-400/5 transition-all duration-150 cursor-pointer'>
						<FiTrash2 className='h-3.5 w-3.5 shrink-0' />
						{isGroup ? "Delete group" : "Delete chat"}
					</button>
				</>
			)}
		</div>
	);
};

export default ConversationMenu;
