import { useEffect, useRef } from "react";
import { BsCodeSlash } from "react-icons/bs";
import { FiBold, FiCode, FiItalic } from "react-icons/fi";

interface FormattingToolbarProps {
  position: { top: number; left: number } | null;
  onFormat: (syntax: "bold" | "italic" | "code" | "codeblock") => void;
  onClose: () => void;
}

const tools = [
  { type: "bold" as const, icon: FiBold, label: "Bold", hint: "**text**" },
  { type: "italic" as const, icon: FiItalic, label: "Italic", hint: "*text*" },
  { type: "code" as const, icon: FiCode, label: "Inline code", hint: "`text`" },
  { type: "codeblock" as const, icon: BsCodeSlash, label: "Code block", hint: "```text```" },
];

const FormattingToolbar = ({ position, onFormat, onClose }: FormattingToolbarProps) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!position) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose();
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [position, onClose]);

  if (!position) return null;

  return (
    <div
      ref={ref}
      style={{ top: position.top, left: position.left }}
      className='fixed z-9999 flex items-center gap-1 px-2 py-1.5 bg-secondary border border-primary/20 rounded-lg shadow-lg shadow-black/30 backdrop-blur-sm'>
      {tools.map(({ type, icon: Icon, label, hint }) => (
        <button
          key={type}
          type='button'
          onClick={() => {
            onFormat(type);
            onClose();
          }}
          title={`${label} — ${hint}`}
          className='p-1.5 text-foreground/60 hover:text-white hover:bg-primary/10 border border-transparent hover:border-primary/20 rounded-md transition-all duration-200 cursor-pointer'>
          <Icon className='h-3.5 w-3.5' />
        </button>
      ))}
    </div>
  );
};

export default FormattingToolbar;