import useSound from "@/hooks/useSound";
import { useAuthStore } from "@/store/useAuthStore";
import useChatStore from "@/store/useChatStore";
import type { ActiveTab } from "@/types/chat";
import { FiLogOut, FiVolume2, FiVolumeX } from "react-icons/fi";
import { IoChatbubblesOutline } from "react-icons/io5";
import { RxPeople } from "react-icons/rx";
import { useNavigate } from "react-router-dom";
import { getInitials } from "@/utils/helpers";

interface FloatingSidebarProps {
	activeTab: ActiveTab;
	setActiveTab: (tab: ActiveTab) => void;
}

const FloatingSidebar = ({ activeTab, setActiveTab }: FloatingSidebarProps) => {
	const navigate = useNavigate();
	const { logout, user } = useAuthStore();
	const { isSoundEnabled, toggleSound } = useChatStore();
	const { playMouseClickSound } = useSound();

	const fullName = user
		? `${user.firstName} ${user.lastName || ""}`.trim()
		: "User";

	const navItems = [
		{
			key: "chats",
			label: "Chats",
			onClick: () => setActiveTab("chats"),
			active: activeTab === "chats",
			icon: (
				<IoChatbubblesOutline className='text-sm md:text-base lg:text-lg' />
			),
		},
		{
			key: "contacts",
			label: "Contacts",
			onClick: () => setActiveTab("contacts"),
			active: activeTab === "contacts",
			icon: <RxPeople className='text-sm md:text-base lg:text-lg' />,
		},
		{
			key: "sound",
			label: isSoundEnabled ? "Mute" : "Unmute",
			onClick: () => {
				playMouseClickSound();
				toggleSound();
			},
			active: false,
			icon: isSoundEnabled ? (
				<FiVolume2 className='text-sm md:text-base lg:text-lg' />
			) : (
				<FiVolumeX className='text-sm md:text-base lg:text-lg' />
			),
		},
	];

	return (
		<div className='lg:h-svh lg:w-20 z-30 flex lg:flex-col items-center justify-center px-4 py-2 lg:px-8'>
			<div className='bg-muted/50 rounded-[100px] p-1 border border-primary/10'>
				<div className='bg-muted/70 rounded-[100px] p-1 flex flex-row lg:flex-col items-center gap-2'>
					<button
						onClick={() => setActiveTab("chats")}
						className='p-0.5 rounded-full text-white/40 hover:text-white/80 hover:bg-white/5 transition-all duration-300 ease-in-out cursor-pointer border-primary/50 border'>
						<img
							src='logo.png'
							alt='ThreadX Icon'
							className='h-8 w-8 object-cover rounded-full'
						/>
					</button>

					{navItems.map((item) => (
						<button
							key={item.key}
							onClick={item.onClick}
							className={`relative group flex items-center justify-center p-3 rounded-full transition-all duration-300 ease-in-out cursor-pointer ${
								item.active
									? "bg-primary/80 text-foreground"
									: "text-white/40 hover:text-white/80 hover:bg-white/5"
							}`}>
							{item.icon}
							<span className='pointer-events-none absolute left-full top-1/2 hidden -translate-y-1/2 ml-3 rounded-full bg-[#0c0926]/95 px-3 py-1 text-[10px] tracking-wide uppercase font-semibold text-white/90 shadow-2xl opacity-0 transition-all duration-300 group-hover:opacity-100 lg:inline-flex'>
								{item.label}
							</span>
							<span className='pointer-events-none absolute top-[130%] left-1/2 inline-flex lg:hidden -translate-x-1/2 mb-2 rounded-full bg-[#0c0926]/95 px-3 py-1 text-[10px] tracking-wide uppercase font-semibold text-white/90 shadow-2xl opacity-0 transition-all duration-300 group-hover:opacity-100'>
								{item.label}
							</span>
						</button>
					))}

					<button
						onClick={() => setActiveTab("profile")}
						className='relative group p-0.5 rounded-full text-white/40 hover:text-white/80 hover:bg-white/5 transition-all duration-300 ease-in-out cursor-pointer border-primary/50 border-[0.5px]'>
						{user?.picture ? (
							<div className='relative'>
								<img
									src={user.picture}
									alt='Profile Avatar'
									className='h-8 w-8 object-cover rounded-full'
								/>
								{/* Online indicator */}
								<span className='absolute bottom-0 right-0 h-2 w-2 bg-green-500 rounded-full ring-1 ring-background/50' />
							</div>
						) : (
							<div className='relative h-8 w-8 rounded-full bg-linear-to-br from-[#7556d3]/30 to-[#a286f7]/10 border border-[#7556d3]/20 flex items-center justify-center font-bold text-xs text-white/90'>
								{getInitials(fullName)}
								<span className='absolute bottom-0 right-0 h-2 w-2 bg-green-500 rounded-full ring-1 ring-background/50' />
							</div>
						)}
						<span className='pointer-events-none absolute left-full top-1/2 hidden -translate-y-1/2 ml-3 rounded-full bg-[#0c0926]/95 px-3 py-1 text-[10px] tracking-wide font-semibold text-white/90 shadow-2xl opacity-0 transition-all duration-300 group-hover:opacity-100 lg:inline-flex uppercase'>
							Profile
						</span>
						<span className='pointer-events-none absolute top-[130%] left-1/2 inline-flex lg:hidden -translate-x-1/2 mb-2 rounded-full bg-[#0c0926]/95 px-3 py-1 text-[10px] tracking-wide font-semibold text-white/90 shadow-2xl opacity-0 transition-all duration-300 group-hover:opacity-100 uppercase'>
							Profile
						</span>
					</button>

					<button
						onClick={async () => {
							await logout();
							navigate("/login");
						}}
						className='relative group p-3 rounded-full text-red-400/70 group-hover:text-red-400/90 hover:bg-red-500/3 transition-all duration-300 ease-in-out cursor-pointer'>
						<FiLogOut className='text-sm md:text-base lg:text-lg' />
						<span className='pointer-events-none absolute left-full top-1/2 hidden -translate-y-1/2 ml-3 rounded-full bg-[#0c0926]/95 px-3 py-1 text-[10px] tracking-wide font-semibold text-white/90 shadow-2xl opacity-0 transition-all duration-300 group-hover:opacity-100 lg:inline-flex uppercase'>
							Logout
						</span>
						<span className='pointer-events-none absolute top-[130%] left-1/2 inline-flex lg:hidden -translate-x-1/2 mb-2 rounded-full bg-[#0c0926]/95 px-3 py-1 text-[10px] tracking-wide font-semibold text-white/90 shadow-2xl opacity-0 transition-all duration-300 group-hover:opacity-100 uppercase'>
							Logout
						</span>
					</button>
				</div>
			</div>
		</div>
	);
};

export default FloatingSidebar;
