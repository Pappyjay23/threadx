import { useEffect, useRef, useState } from "react";
import { BsThreeDotsVertical } from "react-icons/bs";
import { IoCheckmark, IoCopyOutline, IoTrashOutline } from "react-icons/io5";
import { toast } from "sonner";

interface MessageDropdownProps {
	message?: string;
	isSelf: boolean;
	onDelete: () => void;
}

const MessageDropdown = ({
	message,
	isSelf,
	onDelete,
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

		const handleClickOutside = (e: MouseEvent) => {
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
		document.addEventListener("keydown", handleEscape);

		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
			document.removeEventListener("keydown", handleEscape);
		};
	}, [isOpen]);

	// Reset copied state when dropdown closes
	useEffect(() => {
		if (!isOpen) {
			setCopied(false);
		}
	}, [isOpen]);

	return (
		<div ref={dropdownRef} className='relative top-5'>
			{/* Trigger button */}
			<button
				onClick={() => setIsOpen(!isOpen)}
				className='opacity-0 group-hover:opacity-100 p-1.5 rounded-full text-white/40 hover:text-white/70 hover:bg-white/5 transition-all duration-150 cursor-pointer'
				aria-label='Message options'>
				<BsThreeDotsVertical className='text-sm' />
			</button>

			{/* Dropdown */}
			{isOpen && (
				<div
					className={`absolute top-full mt-1 ${isSelf ? "right-0" : "left-0"} bg-secondary border border-primary/20 rounded-md shadow-xl py-1 min-w-35 z-10 animate-scale-in`}>
					{/* Copy — only if text exists */}
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

					{/* Delete — only on self messages */}
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