import React, { useState, useRef } from "react";
import { IoSend } from "react-icons/io5";
import { FiImage } from "react-icons/fi";
import Input from "../ui/Input";

interface ChatInputProps {
	onSendMessage: (text: string) => void;
	soundEnabled: boolean;
}

const ChatInput = ({ onSendMessage, soundEnabled }: ChatInputProps) => {
	const [text, setText] = useState("");
	const fileInputRef = useRef<HTMLInputElement>(null);

	const playKeySound = () => {
		if (!soundEnabled) return;
		const audio = new Audio("/sounds/keypress.mp3");
		audio.volume = 0.15;
		audio.play().catch(() => {});
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (!text.trim()) return;
		onSendMessage(text);
		setText("");
	};

	const handleImageClick = () => {
		fileInputRef.current?.click();
	};

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file) {
			// Handle asset staging or instant upload process here
		}
	};

	return (
		<form
			onSubmit={handleSubmit}
			className='p-3 bg-background-noise border-t border-primary/10'>
			<div className='relative flex items-center w-[90%] mx-auto gap-4'>
				<input
					type='file'
					ref={fileInputRef}
					onChange={handleFileChange}
					accept='image/*'
					className='hidden'
				/>

				<button
					type='button'
					onClick={handleImageClick}
					className='p-2 text-foreground/60 border border-transparent hover:border-primary/30 rounded-full hover:bg-white/5 transition-all duration-300 cursor-pointer flex items-center justify-center shrink-0'>
					<FiImage className='text-base' />
				</button>

				<div className='relative flex-1'>
					<Input
						type='text'
						placeholder='Type your message here...'
						className='rounded-full! w-full! border-primary/40! text-xs! pr-10'
						value={text}
						onChange={(e) => {
							setText(e.target.value);
							playKeySound();
						}}
					/>
				</div>
				<button
					type='submit'
					disabled={!text.trim()}
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
