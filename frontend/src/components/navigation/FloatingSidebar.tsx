import { FiLogOut, FiVolume2, FiVolumeX } from "react-icons/fi";
import { IoChatbubblesOutline } from "react-icons/io5";
import { RxPeople } from "react-icons/rx";

interface FloatingSidebarProps {
	activeTab: "chats" | "profile";
	setActiveTab: (tab: "chats" | "profile") => void;
	soundEnabled: boolean;
	setSoundEnabled: (enabled: boolean) => void;
	onOpenContacts: () => void;
	onLogout: () => void;
}

const FloatingSidebar = ({
	activeTab,
	setActiveTab,
	soundEnabled,
	setSoundEnabled,
	onOpenContacts,
	onLogout,
}: FloatingSidebarProps) => {
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
			onClick: onOpenContacts,
			active: false,
			icon: <RxPeople className='text-sm md:text-base lg:text-lg' />,
		},
		{
			key: "sound",
			label: soundEnabled ? "Mute" : "Unmute",
			onClick: () => setSoundEnabled(!soundEnabled),
			active: false,
			icon: soundEnabled ? (
				<FiVolume2 className='text-sm md:text-base lg:text-lg' />
			) : (
				<FiVolumeX className='text-sm md:text-base lg:text-lg' />
			),
		},
	];

	return (
		<div className='lg:h-svh lg:w-20 z-30 flex lg:flex-col items-center justify-center p-4 lg:px-8'>
			<div className='bg-muted/50 rounded-[100px] p-1 border border-primary/10'>
				<div className='bg-muted/70 rounded-[100px] p-1 flex flex-row lg:flex-col items-center gap-2'>
					<button className='p-0.5 rounded-full text-white/40 hover:text-white/80 hover:bg-white/5 transition-all duration-300 ease-in-out cursor-pointer border-primary/50 border'>
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
						<img
							src='https://images.unsplash.com/photo-1524502397800-2eeaad7c3fe5?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
							alt='Profile Avatar'
							className='h-8 w-8 object-cover rounded-full'
						/>
						<span className='pointer-events-none absolute left-full top-1/2 hidden -translate-y-1/2 ml-3 rounded-full bg-[#0c0926]/95 px-3 py-1 text-[10px] tracking-wide font-semibold text-white/90 shadow-2xl opacity-0 transition-all duration-300 group-hover:opacity-100 lg:inline-flex uppercase'>
							Profile
						</span>
						<span className='pointer-events-none absolute top-[130%] left-1/2 inline-flex lg:hidden -translate-x-1/2 mb-2 rounded-full bg-[#0c0926]/95 px-3 py-1 text-[10px] tracking-wide font-semibold text-white/90 shadow-2xl opacity-0 transition-all duration-300 group-hover:opacity-100 uppercase'>
							Profile
						</span>
					</button>

					<button
						onClick={onLogout}
						className='relative group p-3 rounded-full text-white/40 hover:text-white/80 hover:bg-white/5 transition-all duration-300 ease-in-out cursor-pointer'>
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
