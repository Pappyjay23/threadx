import { useState } from "react";
import { IoEyeOffSharp, IoEyeSharp, IoSearch } from "react-icons/io5";

interface InputProps {
	id?: string;
	name?: string;
	value?: string;
	type?: string;
	placeholder?: string;
	onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
	className?: string;
	disabled?: boolean;
}
const Input = ({
	type = "text",
	placeholder = "",
	onChange,
	className,
	value,
	id,
	name,
	disabled,
}: InputProps) => {
	const [togglePassword, setTogglePassword] = useState(false);

	if (type === "password") {
		return (
			<div
				className={`w-full bg-[#0c0926]/60 border border-zinc-800 focus:border-[#7556d3]/60 rounded-lg px-4 py-2.5 text-sm text-white placeholder-zinc-600 outline-none transition-all duration-300 relative ${className}`}>
				<input
					id={id}
					name={name}
					type={togglePassword ? "text" : "password"}
					placeholder={placeholder}
					disabled={disabled}
					value={value}
					onChange={onChange}
					className={`border-0 outline-none w-[90%] text-xs md:text-sm bg-transparent`}
				/>
				<div
					onClick={() => setTogglePassword((prev) => !prev)}
					className='absolute right-4 top-[50%] translate-y-[-50%] z-5 cursor-pointer'>
					{togglePassword ? <IoEyeSharp /> : <IoEyeOffSharp />}
				</div>
			</div>
		);
	}

	if (type === "search") {
		return (
			<div
				className={`w-full bg-[#0c0926]/60 border border-zinc-800 focus:border-[#7556d3]/60 rounded-lg px-4 py-2.5 text-sm text-white placeholder-zinc-600 outline-none transition-all duration-300 relative ${className}`}>
				<div
					onClick={() => setTogglePassword((prev) => !prev)}
					className='absolute left-4 top-[50%] translate-y-[-50%] z-5 cursor-pointer'>
					<IoSearch />
				</div>
				<input
					id={id}
					name={name}
					type={"text"}
					placeholder={placeholder}
					disabled={disabled}
					value={value}
					onChange={onChange}
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
			value={value}
			onChange={onChange}
			className={`${className} w-full bg-[#0c0926]/60 border border-zinc-800 focus:border-[#7556d3]/60 rounded-lg px-4 py-2.5 text-xs md:text-sm text-white placeholder-zinc-600 outline-none transition-all duration-300`}
		/>
	);
};

export default Input;
