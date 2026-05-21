import React, { forwardRef, useState } from "react";
import { IoEyeOffSharp, IoEyeSharp, IoSearch } from "react-icons/io5";

interface InputProps {
	id?: string;
	ref?: React.RefObject<HTMLInputElement | null>;
	name?: string;
	value?: string;
	type?: string;
	placeholder?: string;
	onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
	className?: string;
	disabled?: boolean;
	onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
}
const Input = forwardRef<HTMLInputElement, InputProps>(
	(
		{
			type = "text",
			placeholder = "",
			className = "",
			disabled,
			onChange,
			onKeyDown,
			value,
			id,
			name,
		},
		ref,
	) => {
		const [togglePassword, setTogglePassword] = useState(false);

		if (type === "password") {
			return (
				<div
					className={`w-full bg-background/30 border border-primary/15 focus-within::border-[#7556d3]/60 rounded-lg px-4 py-2.5 text-sm text-white placeholder-zinc-600 outline-none transition-all duration-300 relative flex items-center justify-between ${className}`}>
					<input
						id={id}
						name={name}
						type={togglePassword ? "text" : "password"}
						placeholder={placeholder}
						disabled={disabled}
						ref={ref}
						value={value}
						onChange={onChange}
						onKeyDown={onKeyDown}
						className={`border-0 outline-none w-[90%] text-xs bg-transparent`}
					/>
					<button
						type='button'
						tabIndex={-1}
						className="cursor-pointer"
						onClick={() => setTogglePassword((prev) => !prev)}
						aria-label={togglePassword ? "Hide password" : "Show password"}>
						{togglePassword ? <IoEyeSharp /> : <IoEyeOffSharp />}
					</button>
				</div>
			);
		}

		if (type === "search") {
			return (
				<div
					className={`w-full bg-background/30 border border-primary/15 focus-within::border-[#7556d3]/60 rounded-lg px-4 py-2.5 text-sm text-white placeholder-zinc-600 outline-none transition-all duration-300 relative ${className}`}>
					<div className='absolute left-4 top-[50%] translate-y-[-50%] z-5 pointer-events-none'>
						<IoSearch />
					</div>
					<input
						id={id}
						name={name}
						type={"text"}
						placeholder={placeholder}
						disabled={disabled}
						ref={ref}
						value={value}
						onChange={onChange}
						onKeyDown={onKeyDown}
						className={`border-0 outline-none w-full pl-7 text-xs`}
					/>
				</div>
			);
		}

		return (
			<input
				id={id}
				name={name}
				type={type}
				placeholder={placeholder}
				disabled={disabled}
				ref={ref}
				value={value}
				onChange={onChange}
				onKeyDown={onKeyDown}
				className={`${className} w-full bg-background/30 border border-primary/15 focus:border-[#7556d3]/60 rounded-lg px-4 py-2.5 text-xs text-white placeholder-zinc-600 outline-none transition-all duration-300`}
			/>
		);
	},
);

Input.displayName = "Input";

export default Input;
