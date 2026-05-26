type MarkdownNode =
  | { type: "text"; content: string }
  | { type: "bold"; content: string }
  | { type: "italic"; content: string }
  | { type: "code"; content: string }
  | { type: "codeblock"; content: string }
  | { type: "linebreak" };

export const getInitials = (name: string) => {
	const names = name.split(" ");
	if (names.length === 1) {
		return names[0].charAt(0);
	} else {
		return names[0].charAt(0) + names[1].charAt(0);
	}
};

export const isMobile = () =>
	typeof window !== "undefined" &&
	window.matchMedia("(max-width: 767px)").matches;

export const formatDate = (date: Date) => {
	const options: Intl.DateTimeFormatOptions = {
		year: "numeric",
		month: "long",
		day: "numeric",
	};
	return new Intl.DateTimeFormat("en-US", options).format(date);
};

export const parseMarkdown = (text: string): MarkdownNode[] => {
  const nodes: MarkdownNode[] = [];

  // Split out fenced code blocks first — they take priority
  const codeBlockPattern = /```([\s\S]*?)```/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = codeBlockPattern.exec(text)) !== null) {
    // Process inline markdown on text before the code block
    if (match.index > lastIndex) {
      parseInline(text.slice(lastIndex, match.index), nodes);
    }

    nodes.push({ type: "codeblock", content: match[1].replace(/^\n/, "") });
    lastIndex = match.index + match[0].length;
  }

  // Process any remaining text after the last code block
  if (lastIndex < text.length) {
    parseInline(text.slice(lastIndex), nodes);
  }

  return nodes;
};

// Handles bold, italic, inline code, linebreaks
const parseInline = (text: string, nodes: MarkdownNode[]) => {
  const lines = text.split("\n");

  lines.forEach((line, lineIndex) => {
    if (lineIndex > 0) nodes.push({ type: "linebreak" });

    const pattern = /(\*\*|__)(.+?)\1|(\*|_)(.+?)\3|`(.+?)`/g;
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = pattern.exec(line)) !== null) {
      if (match.index > lastIndex) {
        nodes.push({ type: "text", content: line.slice(lastIndex, match.index) });
      }

      if (match[1]) {
        nodes.push({ type: "bold", content: match[2] });
      } else if (match[3]) {
        nodes.push({ type: "italic", content: match[4] });
      } else if (match[0].startsWith("`")) {
        nodes.push({ type: "code", content: match[5] });
      }

      lastIndex = match.index + match[0].length;
    }

    if (lastIndex < line.length) {
      nodes.push({ type: "text", content: line.slice(lastIndex) });
    }
  });
};

export const getDateLabel = (date: Date): string => {
	const now = new Date();

	const startOfToday = new Date(
		now.getFullYear(),
		now.getMonth(),
		now.getDate(),
	);
	const startOfDate = new Date(
		date.getFullYear(),
		date.getMonth(),
		date.getDate(),
	);

	const diffDays = Math.round(
		(startOfToday.getTime() - startOfDate.getTime()) / (1000 * 60 * 60 * 24),
	);

	if (diffDays === 0) return "Today";
	if (diffDays === 1) return "Yesterday";
	if (diffDays < 7) {
		return date.toLocaleDateString("en-US", { weekday: "long" });
	}

	return date.toLocaleDateString("en-US", {
		month: "long",
		day: "numeric",
		year: "numeric",
	});
};
