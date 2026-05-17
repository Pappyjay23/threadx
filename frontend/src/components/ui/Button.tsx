interface ButtonProps {
	children: React.ReactNode;
	btnStyle?: "filled" | "outlined";
	onClick?: () => void;
	className?: string;
	type?: "button" | "submit" | "reset";
	disabled?: boolean;
}

const Button = ({
	children,
	btnStyle = "filled",
	onClick,
	className,
	type = "button",
	disabled = false,
}: ButtonProps) => {
	return (
		<button
			onClick={onClick}
			type={type}
			disabled={disabled}
			className={`text-sm font-semibold text-foreground ${btnStyle === "filled" ? "bg-[#7556d3] hover:bg-[#6347b7]" : "border border-primary"} py-2.5 px-10 md:px-13 w-full rounded-full cursor-pointer active:scale-[0.98] transition-all duration-500 ease-in-out ${disabled ? "opacity-50 cursor-not-allowed" : ""} ${className}`}>
			{children}
		</button>
	);
};

export default Button;
