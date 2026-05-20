import { useEffect, useRef } from "react";
import { FiMail, FiX } from "react-icons/fi";
import { LuUser } from "react-icons/lu";
import PresenceAvatar from "./PresenceAvatar";

interface ChatProfilePanelProps {
	isOpen: boolean;
	onClose: () => void;
	chat?: {
		id: string;
		name: string;
		image?: string;
		isOnline: boolean;
		email?: string;
		username?: string;
		bio?: string;
	};
}

const ChatProfilePanel = ({ isOpen, onClose, chat }: ChatProfilePanelProps) => {
	const panelRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (!isOpen) return;

		const handleClickOutside = (e: MouseEvent) => {
			if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
				onClose();
			}
		};

		const timer = setTimeout(() => {
			document.addEventListener("mousedown", handleClickOutside);
		}, 10);

		return () => {
			clearTimeout(timer);
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, [isOpen, onClose]);

	return (
		<>
			<div
				className={`absolute inset-0 z-30 bg-black/40 backdrop-blur-[2px] transition-opacity duration-300 ${
					isOpen
						? "opacity-100 pointer-events-auto"
						: "opacity-0 pointer-events-none"
				}`}
			/>

			<div
				ref={panelRef}
				className={`absolute top-0 right-0 z-40 h-full w-full sm:w-85 bg-background-noise border-l border-primary/10 backdrop-blur-xl flex flex-col transition-transform duration-300 ease-in-out ${
					isOpen ? "translate-x-0" : "translate-x-full"
				}`}>
				<div className='flex items-center justify-between py-2 px-4 border-b border-primary/10'>
					<h3 className='text-sm font-semibold text-white/90 tracking-wide'>
						Profile
					</h3>
					<button
						onClick={onClose}
						className='p-2 text-foreground/60 border border-transparent hover:border-primary/50 rounded-full hover:bg-white/5 transition-all duration-300 cursor-pointer'
						aria-label='Close profile panel'>
						<FiX className='h-4 w-4' />
					</button>
				</div>

				<div className='flex-1 overflow-y-auto'>
					<div className='flex flex-col items-center pt-8 pb-6 px-6 border-b border-primary/10'>
						<PresenceAvatar
							isOnline={chat?.isOnline ?? false}
							size='lg'
							src={chat?.image}
							name={chat?.name}
						/>
						<h2 className='mt-4 text-lg font-semibold text-white/90'>
							{chat?.name ?? "ThreadX User"}
						</h2>
						<span
							className={`mt-1 text-xs font-light tracking-wide ${
								chat?.isOnline ? "text-[#10b981]" : "text-white/40"
							}`}>
							{chat?.isOnline ? "Online" : "Offline"}
						</span>
					</div>

					{/* Bio / About section */}
					{/* <div className='px-6 py-5 border-b border-primary/10'>
						<h4 className='text-[10px] font-semibold text-white/30 uppercase tracking-widest mb-2'>
							About
						</h4>
						<p className='text-xs text-white/60 leading-relaxed'>
							{chat?.bio ?? "Hey there! I'm using ThreadX."}
						</p>
					</div> */}

					<div className='px-6 py-5 border-b border-primary/10 space-y-4'>
						<h4 className='text-[10px] font-semibold text-foreground/80 uppercase tracking-widest mb-2'>
							Details
						</h4>

						{chat?.email && (
							<div className='flex items-center gap-3'>
								<div className='p-2 rounded-full border border-primary/20 bg-primary/5'>
									<FiMail className='h-3.5 w-3.5 text-primary/60' />
								</div>
								<div>
									<p className='text-[10px] text-foreground/40'>Email</p>
									<p className='text-xs text-white/70'>{chat.email}</p>
								</div>
							</div>
						)}

						{chat?.username && (
							<div className='flex items-center gap-3'>
								<div className='p-2 rounded-full border border-primary/20 bg-primary/5'>
									<LuUser className='h-3.5 w-3.5 text-primary/60' />
								</div>
								<div>
									<p className='text-[10px] text-foreground/40'>Username</p>
									<p className='text-xs text-white/70'>@{chat.username}</p>
								</div>
							</div>
						)}
					</div>
				</div>
			</div>
		</>
	);
};

export default ChatProfilePanel;
