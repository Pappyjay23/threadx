import { getInitials } from "@/utils/helpers";

interface PresenceAvatarProps {
	src?: string;
	name?: string;
	isOnline: boolean;
	size?: "sm" | "md" | "lg";
}

const PresenceAvatar = ({
	src,
	name,
	isOnline,
	size = "md",
}: PresenceAvatarProps) => {
	const dimensions = {
		sm: "h-8 w-8 rounded-full",
		md: "h-10 w-10 rounded-full",
		lg: "h-16 w-16 rounded-full",
	};

	const placement = {
		sm: "bottom-0.5 right-0.5 h-1.5 w-1.5",
		md: "bottom-0.5 right-1 h-2 w-2",
		lg: "bottom-1.5 right-1.5 h-2.5 w-2.5",
	};

	return (
		<div className='relative inline-block shrink-0 select-none'>
			{src ? (
				<div className='relative'>
					<img
						src={src}
						alt='Avatar'
						className={`${dimensions[size]} object-cover bg-[#0c0926]`}
					/>
					<div className='bg-background/30 h-full w-full z-5 absolute top-0 rounded-full' />
				</div>
			) : (
				<div
					className={`${dimensions[size]} bg-linear-to-br from-[#7556d3]/30 to-[#a286f7]/10 border border-[#7556d3]/20 flex items-center justify-center font-bold uppercase`}>
					<p>{getInitials(name || "")}</p>
				</div>
			)}
			<span
				className={`absolute ${placement[size]} z-10 block rounded-full ring-1 transition-all duration-300 ${
					isOnline
						? "bg-green-500 ring-background/50"
						: "bg-muted ring-foreground/50"
				}`}
			/>
		</div>
	);
};

export default PresenceAvatar;
