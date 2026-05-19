import React, { useEffect, useRef } from "react";

interface ChatTextareaProps {
	value: string;
	placeholder?: string;
	disabled?: boolean;
	className?: string;
	onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
	onKeyDown?: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
}

const ChatTextarea = ({
	value,
	placeholder,
	disabled,
	className = "",
	onChange,
	onKeyDown,
}: ChatTextareaProps) => {
	const textareaRef = useRef<HTMLTextAreaElement>(null);

	const resizeTextarea = () => {
		const el = textareaRef.current;
		if (!el) return;

		el.style.height = "auto";
		el.style.height = `${el.scrollHeight}px`;
	};

	useEffect(() => {
		resizeTextarea();
	}, [value]);

	return (
		<textarea
			ref={textareaRef}
			rows={1}
			value={value}
			placeholder={placeholder}
			disabled={disabled}
			onChange={onChange}
			onKeyDown={onKeyDown}
			className={`w-full border border-primary/40 focus:border-primary/60 rounded-xl px-4 py-2.5 text-xs text-foreground placeholder-zinc-600 outline-none transition-all duration-300 resize-none overflow-y-auto min-h-10 max-h-30 block ${className}`}
		/>
	);
};

export default ChatTextarea;
