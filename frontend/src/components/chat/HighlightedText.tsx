import { parseMarkdown } from "@/utils/helpers";

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
			<mark key={i} className='bg-primary/40 text-white rounded-sm px-0.5'>
				{part}
			</mark>
		) : (
			part
		),
	);
};

const HighlightedText = ({ text, query }: HighlightedTextProps) => {
	const nodes = parseMarkdown(text);

	return (
		<>
			{nodes.map((node, i) => {
				if (node.type === "linebreak") return <br key={i} />;

				if (node.type === "bold") {
					return (
						<strong key={i} className='font-semibold'>
							{highlightSegment(node.content, query)}
						</strong>
					);
				}

				if (node.type === "italic") {
					return (
						<em key={i} className='italic'>
							{highlightSegment(node.content, query)}
						</em>
					);
				}

				if (node.type === "code") {
					return (
						<code
							key={i}
							className='bg-background text-foreground rounded px-1 py-0.5 font-mono text-[11px]'>
							{highlightSegment(node.content, query)}
						</code>
					);
				}

				if (node.type === "codeblock") {
					return (
						<pre
							key={i}
							className='bg-background border border-primary/10 rounded-lg px-3 py-2.5 mt-1 mb-1 font-mono text-[11px] text-foreground overflow-x-auto whitespace-pre select-text'>
							<code>{node.content}</code>
						</pre>
					);
				}

				return <span key={i}>{highlightSegment(node.content, query)}</span>;
			})}
		</>
	);
};

export default HighlightedText;
