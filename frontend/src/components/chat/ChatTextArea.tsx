import React, { forwardRef, useEffect, useRef } from "react";

interface ChatTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
	value: string;
	className?: string;
}

const ChatTextarea = forwardRef<HTMLTextAreaElement, ChatTextareaProps>(
	({ value, className = "", ...props }, ref) => {
		const innerRef = useRef<HTMLTextAreaElement | null>(null);

		const handleRef = (node: HTMLTextAreaElement | null) => {
			innerRef.current = node;

			if (typeof ref === "function") {
				ref(node);
			} else if (ref) {
				ref.current = node;
			}
		};

		useEffect(() => {
			const el = innerRef.current;
			if (!el) return;

			el.style.height = "auto";
			el.style.height = `${el.scrollHeight}px`;
		}, [value]);

		return (
			<textarea
				ref={handleRef}
				rows={1}
				value={value}
				className={`w-full border border-primary/40 focus:border-primary/60 rounded-xl px-4 py-2.5 text-xs text-foreground placeholder-zinc-600 outline-none transition-all duration-300 resize-none overflow-y-auto min-h-10 max-h-30 block ${className}`}
				{...props}
			/>
		);
	},
);

ChatTextarea.displayName = "ChatTextarea";

export default ChatTextarea;
