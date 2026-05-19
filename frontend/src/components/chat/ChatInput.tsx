import EmojiPicker, { Theme } from "emoji-picker-react";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { BsEmojiSmileFill } from "react-icons/bs";
import { FiImage } from "react-icons/fi";
import { IoSend } from "react-icons/io5";
import ChatTextArea from "./ChatTextArea";
import useChatStore from "@/store/useChatStore";
import { isMobile } from "@/utils/helpers";

interface ChatInputProps {
	onSendMessage: (text: string) => void;
	soundEnabled: boolean;
}

const ChatInput = ({ onSendMessage, soundEnabled }: ChatInputProps) => {
	const { activeChatId } = useChatStore();

	const textareaRef = useRef<HTMLTextAreaElement>(null);

	const [text, setText] = useState("");
	const [showPicker, setShowPicker] = useState(false);
	const fileInputRef = useRef<HTMLInputElement>(null);
	const pickerRef = useRef<HTMLDivElement>(null);
	const emojiButtonRef = useRef<HTMLButtonElement>(null);

	useEffect(() => {
		if (!showPicker) return;

		const handleOutsideClick = (e: MouseEvent) => {
			if (emojiButtonRef.current?.contains(e.target as Node)) return;
			if (!pickerRef.current?.contains(e.target as Node)) {
				setShowPicker(false);
			}
		};

		document.addEventListener("mousedown", handleOutsideClick);
		return () => document.removeEventListener("mousedown", handleOutsideClick);
	}, [showPicker]);

	const playKeySound = useCallback(() => {
		if (!soundEnabled) return;
		const audio = new Audio("/sounds/keypress.mp3");
		audio.volume = 0.15;
		audio.play().catch(() => {});
	}, [soundEnabled]);

	const sendMessage = () => {
		if (!text.trim()) return;
		onSendMessage(text);
		setText("");
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
		if (file) {
			// TODO: handle asset staging / instant upload
		}
	};

	useEffect(() => {
		if (!activeChatId) return;

		requestAnimationFrame(() => {
			if(isMobile()) return
			textareaRef.current?.focus();
		});
	}, [activeChatId]);

	return (
		<form
			onSubmit={handleSubmit}
			className='p-3 bg-background-noise border-t border-primary/10'>
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
					className='p-2 text-foreground/60 border border-transparent hover:border-primary/30 rounded-full hover:bg-white/5 transition-all duration-300 cursor-pointer flex items-center justify-center shrink-0'
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
							playKeySound();
						}}
						onKeyDown={handleKeyDown}
					/>
				</div>

				{/* Emoji picker — themed to match dark UI */}
				{showPicker && (
					<div
						ref={pickerRef}
						className='absolute bottom-full mb-2 left-0 z-50'>
						<EmojiPicker
							theme={Theme.DARK}
							onEmojiClick={(emojiObject) => {
								setText((prev) => prev + emojiObject.emoji);
							}}
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

				{/* Send button */}
				<button
					type='submit'
					disabled={!text.trim()}
					aria-label='Send message'
					className={`p-2 rounded-full transition-all duration-300 flex items-center justify-center border ${
						text.trim()
							? "bg-primary/80 text-white hover:bg-primary/60 cursor-pointer shadow-lg shadow-primary/20 border-transparent"
							: "text-foreground/20 bg-transparent pointer-events-none border-primary/30"
					}`}>
					<IoSend className='text-xs' />
				</button>
			</div>
		</form>
	);
};

export default ChatInput;
