import React from "react";
import type { Components } from "react-markdown";
import ReactMarkdown from "react-markdown";

interface HighlightedTextProps {
	text: string;
	query: string;
}

const highlightSegment = (content: string, query: string): React.ReactNode => {
	if (!query.trim()) return content;

	const parts = content.split(
		new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi"),
	);

	return parts.map((part, i) =>
		part.toLowerCase() === query.toLowerCase() ? (
			<mark key={i} className='bg-red-500/40 text-white rounded-sm px-0.5'>
				{part}
			</mark>
		) : (
			part
		),
	);
};

const createComponents = (query: string): Components => ({
	p: ({ children }) => (
		<p className='whitespace-pre-wrap wrap-break-word leading-relaxed'>
			{React.Children.map(children, (child) =>
				typeof child === "string" ? highlightSegment(child, query) : child,
			)}
		</p>
	),
	strong: ({ children }) => (
		<strong className='font-semibold text-white'>
			{typeof children === "string"
				? highlightSegment(children, query)
				: children}
		</strong>
	),
	em: ({ children }) => (
		<em className='italic'>
			{typeof children === "string"
				? highlightSegment(children, query)
				: children}
		</em>
	),
	code: ({ children, className }) => {
		// Block code (inside pre)
		const isBlock = !!className;
		if (isBlock) {
			return (
				<code className='block font-mono text-[11px] bg-background text-foreground whitespace-pre select-text'>
					{children}
				</code>
			);
		}
		// Inline code
		return (
			<code className='bg-background text-foreground rounded px-1 py-0.5 font-mono text-[11px] select-text'>
				{typeof children === "string"
					? highlightSegment(children, query)
					: children}
			</code>
		);
	},
	pre: ({ children }) => (
		<pre className='bg-background border border-primary/10 rounded-lg px-3 py-2.5 my-1 overflow-x-auto select-text'>
			{children}
		</pre>
	),
});

const HighlightedText = ({ text, query }: HighlightedTextProps) => {
	return (
		<ReactMarkdown components={createComponents(query)}>{text}</ReactMarkdown>
	);
};

export default HighlightedText;
