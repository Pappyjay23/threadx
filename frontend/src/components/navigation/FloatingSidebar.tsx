import {
  FiLogOut,
  FiVolume2,
  FiVolumeX
} from "react-icons/fi";
import {
  IoChatbubblesOutline
} from "react-icons/io5";
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
	return (
		<div className='lg:h-svh lg:w-20 z-30 flex lg:flex-col items-center justify-center p-4 lg:px-8'>
			<div className='bg-muted/50 rounded-[100px] p-1 border border-primary/10'>
				<div className='bg-muted/70 rounded-[100px] p-1 flex flex-row lg:flex-col items-center gap-2'>
					<button className='p-0.5 rounded-full text-white/40 hover:text-white/80 hover:bg-white/5 transition-all duration-300 ease-in-out cursor-pointer'>
						<img
							src='logo.png'
							alt='ThreadX Icon'
							className='h-8 w-8 object-cover rounded-full border-primary/50 border'
						/>
					</button>
					<button
						onClick={() => setActiveTab("chats")}
						className={`p-3 rounded-full transition-all duration-300 ease-in-out cursor-pointer ${
							activeTab === "chats"
								? "bg-primary/80 text-foreground"
								: "text-white/40 hover:text-white/80 hover:bg-white/5"
						}`}>
						<IoChatbubblesOutline className='text-sm md:text-base lg:text-lg' />
					</button>
					<button
						onClick={onOpenContacts}
						className='p-3 rounded-full text-white/40 hover:text-white/80 hover:bg-white/5 transition-all duration-300 ease-in-out cursor-pointer'>
						<RxPeople className='text-sm md:text-base lg:text-lg' />
					</button>
					<button
						onClick={() => setSoundEnabled(!soundEnabled)}
						className='p-3 rounded-full text-white/40 hover:text-white/80 hover:bg-white/5 transition-all duration-300 ease-in-out cursor-pointer text-sm md:text-base lg:text-lg'>
						{soundEnabled ? <FiVolume2 /> : <FiVolumeX />}
					</button>
					<button
						onClick={() => setActiveTab("profile")}
						className='p-0.5 rounded-full text-white/40 hover:text-white/80 hover:bg-white/5 transition-all duration-300 ease-in-out cursor-pointer border-primary/50 border-[0.5px]'>
						<img
							src='https://images.unsplash.com/photo-1524502397800-2eeaad7c3fe5?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
							alt='ThreadX Icon'
							className='h-8 w-8 object-cover rounded-full'
						/>
					</button>
					<button
						onClick={onLogout}
						className='p-3 rounded-full text-white/40 hover:text-white/80 hover:bg-white/5 transition-all duration-300 ease-in-out cursor-pointer'>
						<FiLogOut className='text-sm md:text-base lg:text-lg' />
					</button>
				</div>
			</div>
		</div>
	);
};

export default FloatingSidebar;
