import { useEffect, useRef, useState } from "react";
import { BsThreeDotsVertical } from "react-icons/bs";
import { IoCheckmark, IoCopyOutline, IoTrashOutline } from "react-icons/io5";
import { toast } from "sonner";

interface MessageDropdownProps {
	message?: string;
	isSelf: boolean;
	onDelete: () => void;
	isLastMessage: boolean;
	hasImage: boolean;
}

const MessageDropdown = ({
	message,
	isSelf,
	onDelete,
	isLastMessage,
	hasImage,
}: MessageDropdownProps) => {
	const [isOpen, setIsOpen] = useState(false);
	const [copied, setCopied] = useState(false);
	const dropdownRef = useRef<HTMLDivElement>(null);

	const handleCopy = async () => {
		if (!message) return;
		try {
			await navigator.clipboard.writeText(message);
			setCopied(true);

			setTimeout(() => {
				setCopied(false);
				setIsOpen(false);
			}, 1500);
		} catch {
			toast.error("Failed to copy message");
		}
	};

	const handleDelete = () => {
		setIsOpen(false);
		onDelete();
	};

	useEffect(() => {
		if (!isOpen) return;

		// Handle both click and touch interactions outside
		const handleClickOutside = (e: Event) => {
			if (
				dropdownRef.current &&
				!dropdownRef.current.contains(e.target as Node)
			) {
				setIsOpen(false);
			}
		};

		const handleEscape = (e: KeyboardEvent) => {
			if (e.key === "Escape") setIsOpen(false);
		};

		document.addEventListener("mousedown", handleClickOutside);
		document.addEventListener("touchstart", handleClickOutside);
		document.addEventListener("keydown", handleEscape);

		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
			document.removeEventListener("touchstart", handleClickOutside);
			document.removeEventListener("keydown", handleEscape);
		};
	}, [isOpen]);

	useEffect(() => {
		if (!isOpen) {
			setCopied(false);
		}
	}, [isOpen]);

	return (
		<div ref={dropdownRef} className='relative top-5'>
			{/* Trigger button: Always visible on mobile, hovers on desktop */}
			<button
				onClick={() => setIsOpen(!isOpen)}
				className='opacity-100 lg:opacity-0 lg:group-hover:opacity-100 p-1.5 rounded-full text-white/40 hover:text-white/70 hover:bg-white/5 transition-all duration-150 cursor-pointer'
				aria-label='Message options'>
				<BsThreeDotsVertical className='text-sm' />
			</button>

			{/* Dropdown */}
			{isOpen && (
				<div
					className={`absolute bg-secondary border border-primary/20 rounded-md shadow-xl py-1 min-w-35 z-10 animate-scale-in	${isLastMessage ? (hasImage ? "top-full mt-1" : "bottom-full mb-1") : "top-full mt-1"}	${isSelf ? (isLastMessage ? "right-full md:right-0" : "right-0") : "left-0"}`}>
					{message && (
						<button
							onClick={handleCopy}
							disabled={copied}
							className={`w-full flex items-center gap-2 px-3 py-2 text-xs transition-colors text-left ${
								copied
									? "text-green-400 cursor-default"
									: "text-white/70 hover:text-white hover:bg-white/5 cursor-pointer"
							}`}>
							{copied ? (
								<>
									<IoCheckmark className='text-sm' />
									Copied
								</>
							) : (
								<>
									<IoCopyOutline className='text-sm' />
									Copy
								</>
							)}
						</button>
					)}

					{isSelf && (
						<button
							onClick={handleDelete}
							className='w-full flex items-center gap-2 px-3 py-2 text-xs text-red-400 hover:text-red-300 hover:bg-white/5 transition-colors cursor-pointer text-left'>
							<IoTrashOutline className='text-sm' />
							Delete
						</button>
					)}
				</div>
			)}
		</div>
	);
};

export default MessageDropdown;
