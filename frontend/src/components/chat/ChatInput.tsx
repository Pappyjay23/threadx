import useSound from "@/hooks/useSound";
import useChatStore from "@/store/useChatStore";
import { isMobile } from "@/utils/helpers";
import EmojiPicker, { Theme } from "emoji-picker-react";
import React, { useEffect, useRef, useState } from "react";
import { BsEmojiSmileFill } from "react-icons/bs";
import { FiImage } from "react-icons/fi";
import { IoSend } from "react-icons/io5";
import { IoCloseOutline } from "react-icons/io5";
import ChatTextArea from "./ChatTextArea";
import { toast } from "sonner";

interface ChatInputProps {
	onSendMessage: (
		text: string,
		imageFile?: File | null,
		imagePreview?: string | null,
	) => void;
}

const ChatInput = ({ onSendMessage }: ChatInputProps) => {
	const { activeChatId, isSoundEnabled } = useChatStore();
	const { playRandomKeyStrokeSound, playSendMessageSound } = useSound();

	const textareaRef = useRef<HTMLTextAreaElement>(null);
	const fileInputRef = useRef<HTMLInputElement>(null);
	const pickerRef = useRef<HTMLDivElement>(null);
	const emojiButtonRef = useRef<HTMLButtonElement>(null);

	const [text, setText] = useState("");
	const [showPicker, setShowPicker] = useState(false);
	const [imageFile, setImageFile] = useState<File | null>(null);
	const [imagePreview, setImagePreview] = useState<string | null>(null);

	useEffect(() => {
		if (!showPicker) return;
		const handleOutsideClick = (e: MouseEvent) => {
			if (emojiButtonRef.current?.contains(e.target as Node)) return;
			if (!pickerRef.current?.contains(e.target as Node)) setShowPicker(false);
		};
		document.addEventListener("mousedown", handleOutsideClick);
		return () => document.removeEventListener("mousedown", handleOutsideClick);
	}, [showPicker]);

	const removeImage = () => {
		if (imagePreview) URL.revokeObjectURL(imagePreview);
		setImageFile(null);
		setImagePreview(null);
		if (fileInputRef.current) fileInputRef.current.value = "";
	};

	const sendMessage = () => {
		if (!text.trim() && !imageFile) return;
		onSendMessage(text, imageFile, imagePreview);
		setText("");
		setImageFile(null);
		setImagePreview(null);
		if (fileInputRef.current) fileInputRef.current.value = "";
		if (isSoundEnabled) playSendMessageSound();
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		sendMessage();
	};

	const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
		if (e.key === "Enter" && !e.shiftKey) {
			e.preventDefault();
			sendMessage();
		}
	};

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;

		if (file.size > 5 * 1024 * 1024) {
			toast.error("Image must be less than 5MB");
			return;
		}
		if (!file.type.startsWith("image/")) {
			toast.error("File must be an image");
			return;
		}

		setImageFile(file);
		setImagePreview(URL.createObjectURL(file));
	};

	useEffect(() => {
		if (!activeChatId) return;
		requestAnimationFrame(() => {
			if (isMobile()) return;
			textareaRef.current?.focus();
		});
	}, [activeChatId]);

	return (
		<form
			onSubmit={handleSubmit}
			className='p-3 bg-background-noise border-t border-primary/10'>
			{/* Image preview strip */}
			{imagePreview && (
				<div className='w-full md:w-[90%] mx-auto mb-2 flex items-center gap-2'>
					<div className='relative inline-block'>
						<img
							src={imagePreview}
							alt='Preview'
							className='h-16 w-16 object-cover rounded-lg border border-primary/20'
						/>
						<button
							type='button'
							onClick={removeImage}
							className='absolute -top-1.5 -right-1.5 h-4.5 w-4.5 rounded-full bg-background border border-primary/30 flex items-center justify-center text-foreground/60 hover:text-white transition-colors cursor-pointer'>
							<IoCloseOutline className='text-sm' />
						</button>
					</div>
				</div>
			)}

			<div className='relative flex items-center w-full md:w-[90%] mx-auto gap-2'>
				<input
					type='file'
					ref={fileInputRef}
					onChange={handleFileChange}
					accept='image/*'
					className='hidden'
				/>

				<button
					type='button'
					onClick={() => fileInputRef.current?.click()}
					className={`p-2 border rounded-full hover:bg-white/5 transition-all duration-300 cursor-pointer flex items-center justify-center shrink-0 ${
						imageFile
							? "border-primary bg-primary/10 text-primary"
							: "border-transparent text-foreground/60 hover:border-primary/30"
					}`}
					aria-label='Attach image'>
					<FiImage className='text-base' />
				</button>

				<button
					ref={emojiButtonRef}
					type='button'
					onClick={() => setShowPicker((prev) => !prev)}
					aria-label={showPicker ? "Close emoji picker" : "Open emoji picker"}
					aria-expanded={showPicker}
					className={`p-2 border rounded-full hover:bg-white/5 transition-all duration-300 cursor-pointer flex items-center justify-center shrink-0 ${
						showPicker
							? "border-primary bg-primary/10"
							: "border-primary/50 hover:border-primary/80"
					}`}>
					<BsEmojiSmileFill className='text-base text-primary' />
				</button>

				<div className='relative flex-1'>
					<ChatTextArea
						ref={textareaRef}
						value={text}
						placeholder='Type your message here...'
						className='pr-4'
						onChange={(e) => {
							setText(e.target.value);
							if (isSoundEnabled) playRandomKeyStrokeSound();
						}}
						onKeyDown={handleKeyDown}
					/>
				</div>

				{showPicker && (
					<div
						ref={pickerRef}
						className='absolute bottom-full mb-2 left-0 z-50'>
						<EmojiPicker
							theme={Theme.DARK}
							onEmojiClick={(emojiObject) =>
								setText((prev) => prev + emojiObject.emoji)
							}
							searchDisabled={true}
							height={300}
							width={300}
							previewConfig={{ showPreview: false }}
							lazyLoadEmojis
							style={
								{
									"--epr-bg-color": "var(--background)",
									"--epr-category-label-bg-color": "hsl(var(--background))",
									"--epr-picker-border-color": "hsl(var(--primary) / 0.2)",
									"--epr-picker-border-radius": "0.75rem",
									"--epr-text-color": "hsl(var(--foreground))",
									"--epr-search-input-text-color": "hsl(var(--foreground))",
									"--epr-search-input-placeholder-color":
										"hsl(var(--foreground) / 0.4)",
									"--epr-hover-bg-color": "hsl(var(--primary) / 0.12)",
									"--epr-focus-bg-color": "hsl(var(--primary) / 0.18)",
									"--epr-active-skin-tone-indicator-border-color":
										"hsl(var(--primary))",
									"--epr-category-icon-active-color": "hsl(var(--primary))",
									"--epr-search-input-bg-color": "hsl(var(--primary) / 0.08)",
									"--epr-search-input-border-color":
										"hsl(var(--primary) / 0.25)",
									"--epr-scrollbar-track-color": "hsl(var(--background))",
									"--epr-scrollbar-bg-color": "hsl(var(--primary) / 0.2)",
									"--epr-emoji-size": "28px",
									"--epr-emoji-fullsize": "35px",
									"--epr-category-label-text-size": "10px",
									"--epr-header-category-icon-size": "16px",
									boxShadow: "0 8px 32px hsl(var(--primary) / 0.15)",
								} as React.CSSProperties
							}
						/>
					</div>
				)}

				<button
					type='submit'
					disabled={!text.trim() && !imageFile}
					aria-label='Send message'
					className={`p-2 rounded-full transition-all duration-300 flex items-center justify-center border ${
						text.trim() || imageFile
							? "bg-primary/80 text-white hover:bg-primary/60 cursor-pointer shadow-lg shadow-primary/20 border-transparent"
							: "text-foreground/20 bg-transparent pointer-events-none border-primary/30"
					}`}>
					<IoSend className='text-xs' />
				</button>
			</div>
			{text && (
				<p className='text-[10px] text-foreground/25 text-center mt-1'>
					Formatting hints: **bold** &nbsp;·&nbsp; *italic* &nbsp;·&nbsp; `code` &nbsp;·&nbsp; ```code block```
				</p>
			)}
		</form>
	);
};

export default ChatInput;
