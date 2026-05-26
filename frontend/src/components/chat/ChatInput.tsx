import useSound from "@/hooks/useSound";
import useChatStore from "@/store/useChatStore";
import { isMobile } from "@/utils/helpers";
import EmojiPicker, { Theme } from "emoji-picker-react";
import React, { useEffect, useRef, useState } from "react";
import { BsEmojiSmileFill } from "react-icons/bs";
import { FiEye, FiEyeOff, FiImage } from "react-icons/fi";
import { IoCloseOutline, IoSend } from "react-icons/io5";
import type { Components } from "react-markdown";
import ReactMarkdown from "react-markdown";
import { toast } from "sonner";
import ChatTextArea from "./ChatTextArea";
import FormattingToolbar from "./FormattingToolbar";

interface ChatInputProps {
	onSendMessage: (
		text: string,
		imageFile?: File | null,
		imagePreview?: string | null,
	) => void;
}

const previewComponents: Components = {
	p: ({ children }) => (
		<p className='whitespace-pre-wrap wrap-break-word leading-relaxed text-white/80'>
			{children}
		</p>
	),
	strong: ({ children }) => (
		<strong className='font-semibold text-white'>{children}</strong>
	),
	em: ({ children }) => <em className='italic'>{children}</em>,
	code: ({ children, className }) => {
		const isBlock = !!className;
		if (isBlock) {
			return (
				<code className='block font-mono text-[11px] bg-white/10 text-primary/90 whitespace-pre'>
					{children}
				</code>
			);
		}
		return (
			<code className='bg-white/10 text-primary/90 rounded px-1 py-0.5 font-mono text-[11px]'>
				{children}
			</code>
		);
	},
	pre: ({ children }) => (
		<pre className='bg-white/5 border border-primary/10 rounded-lg px-3 py-2.5 my-1 overflow-x-auto'>
			{children}
		</pre>
	),
};

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
	const [isPreviewMode, setIsPreviewMode] = useState(false);
	const [toolbarPosition, setToolbarPosition] = useState<{
		top: number;
		left: number;
	} | null>(null);
	const [savedSelection, setSavedSelection] = useState<{
		start: number;
		end: number;
	} | null>(null);

	useEffect(() => {
		if (!text) setIsPreviewMode(false);
	}, [text]);

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
		setIsPreviewMode(false);
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

	const handleTextareaMouseUp = () => {
		const textarea = textareaRef.current;
		if (!textarea) return;

		const { selectionStart, selectionEnd } = textarea;

		// Only show if there's an actual selection
		if (selectionStart === selectionEnd) {
			setToolbarPosition(null);
			return;
		}

		setSavedSelection({ start: selectionStart, end: selectionEnd });

		// Position toolbar above the selection
		const rect = textarea.getBoundingClientRect();
		setToolbarPosition({
			top: rect.top - 44, // above the textarea
			left: rect.left + 8,
		});
	};

	const handleFormat = (syntax: "bold" | "italic" | "code" | "codeblock") => {
		if (!savedSelection || !textareaRef.current) return;

		const { start, end } = savedSelection;
		const selected = text.slice(start, end);

		// Trim leading/trailing whitespace from selection
		// but track how much was trimmed to adjust positions
		const trimmedStart = selected.length - selected.trimStart().length;
		const trimmedEnd = selected.length - selected.trimEnd().length;

		const adjustedStart = start + trimmedStart;
		const adjustedEnd = end - trimmedEnd;
		const trimmedSelected = selected.trim();

		// Nothing left after trimming — bail
		if (!trimmedSelected) return;

		const wrappers = {
			bold: { open: "**", close: "**" },
			italic: { open: "*", close: "*" },
			code: { open: "`", close: "`" },
			codeblock: { open: "```\n", close: "\n```" },
		};

		const { open, close } = wrappers[syntax];

		const newText =
			text.slice(0, adjustedStart) +
			open +
			trimmedSelected +
			close +
			text.slice(adjustedEnd);

		setText(newText);

		// Place cursor after the closing wrapper
		requestAnimationFrame(() => {
			if (!textareaRef.current) return;
			const newCursor =
				adjustedStart + open.length + trimmedSelected.length + close.length;
			textareaRef.current.focus();
			textareaRef.current.setSelectionRange(newCursor, newCursor);
		});
	};

	useEffect(() => {
		if (!activeChatId) return;
		requestAnimationFrame(() => {
			if (isMobile()) return;
			textareaRef.current?.focus();
		});
	}, [activeChatId]);

	// Focus textarea when switching back to edit mode
	useEffect(() => {
		if (!isPreviewMode) {
			requestAnimationFrame(() => textareaRef.current?.focus());
		}
	}, [isPreviewMode]);

	const hasMarkdown = /\*\*|__|`|\*|_/.test(text);

	return (
		<form
			onSubmit={handleSubmit}
			className='p-3 bg-background-noise border-t border-primary/10'>
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
					{isPreviewMode ? (
						<div className='w-full max-w-lg border border-primary/40 rounded-xl px-4 py-2.5 text-xs min-h-10 max-h-30 overflow-y-auto bg-transparent'>
							<ReactMarkdown components={previewComponents}>
								{text}
							</ReactMarkdown>
						</div>
					) : (
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
							onMouseUp={handleTextareaMouseUp}
						/>
					)}
				</div>

				{hasMarkdown && text && (
					<button
						type='button'
						onClick={() => setIsPreviewMode((prev) => !prev)}
						aria-label={isPreviewMode ? "Edit message" : "Preview message"}
						className={`p-2 border rounded-full transition-all duration-300 cursor-pointer flex items-center justify-center shrink-0 ${
							isPreviewMode
								? "border-primary bg-primary/10 text-primary"
								: "border-primary/30 text-foreground/50 hover:border-primary/60 hover:text-foreground/80"
						}`}>
						{isPreviewMode ? (
							<FiEyeOff className='text-xs' />
						) : (
							<FiEye className='text-xs' />
						)}
					</button>
				)}

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
				<p className='text-[10px] text-foreground/25 text-center mt-1.5'>
					Formatting hints: **bold** · *italic* · `code` · ```block```
				</p>
			)}

			<FormattingToolbar
				position={toolbarPosition}
				onFormat={handleFormat}
				onClose={() => setToolbarPosition(null)}
			/>
		</form>
	);
};

export default ChatInput;
