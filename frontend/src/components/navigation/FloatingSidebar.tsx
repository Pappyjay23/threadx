import { FiLogOut, FiMessageSquare, FiUsers, FiVolume2, FiVolumeX } from 'react-icons/fi';
import PresenceAvatar from '../chat/PresenceAvatar';


interface FloatingSidebarProps {
  activeTab: 'chats' | 'profile';
  setActiveTab: (tab: 'chats' | 'profile') => void;
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
    <aside className="fixed md:sticky bottom-0 md:bottom-auto left-0 right-0 md:right-auto md:top-0 z-50 h-16 md:h-svh w-full md:w-20 bg-[#0c0926]/60 backdrop-blur-md border-t md:border-t-0 md:border-r border-white/5 flex flex-row md:flex-col items-center justify-between p-3 md:py-6 shadow-2xl">
      <div className="hidden md:flex items-center justify-center w-12 h-12 rounded-[12px] bg-[#0c0926] border border-[#7556d3]/20 p-2.5 mb-6">
        <img src="logo.png" alt="ThreadX" className="h-full w-full object-contain" />
      </div>

      <nav className="flex flex-row md:flex-col items-center gap-6 md:gap-4 flex-1 justify-center md:justify-start w-full px-4 md:px-0">
        <button
          onClick={() => setActiveTab('chats')}
          className={`p-3 rounded-xl transition-all duration-200 ${
            activeTab === 'chats' ? 'bg-[#7556d3] text-white' : 'text-white/40 hover:text-white/80'
          }`}
        >
          <FiMessageSquare className="h-5 w-5" />
        </button>

        <button
          onClick={onOpenContacts}
          className="p-3 rounded-xl text-white/40 hover:text-white/80 hover:bg-white/5 transition-all duration-200"
        >
          <FiUsers className="h-5 w-5" />
        </button>

        <button
          onClick={() => setSoundEnabled(!soundEnabled)}
          className="p-3 rounded-xl text-white/40 hover:text-white/80 hover:bg-white/5 transition-all duration-200"
        >
          {soundEnabled ? <FiVolume2 className="h-5 w-5" /> : <FiVolumeX className="h-5 w-5" />}
        </button>

        <button
          onClick={onLogout}
          className="md:hidden p-3 rounded-xl text-white/40 hover:text-red-400 transition-all duration-200"
        >
          <FiLogOut className="h-5 w-5" />
        </button>
      </nav>

      <button onClick={() => setActiveTab('profile')} className="focus:outline-none transition-transform active:scale-95 pr-2 md:pr-0">
        <PresenceAvatar isOnline={true} size="md" />
      </button>
    </aside>
  );
};

export default FloatingSidebar;

// const FloatingSidebar = () => {
// 	return (
// 		<div className='h-svh w-20 z-30 flex flex-col items-center justify-center px-8'>
// 			<div className='bg-muted rounded-[100px] p-1'>
// 				<div className='bg-primary/80 rounded-[100px] p-1'>
// 					<button className='p-3 rounded-full text-white/40 hover:text-white/80 hover:bg-white/5 transition-all duration-200'>
// 						<FiUsers className='text-sm md:text-base' />
// 					</button>
// 					<button className='p-3 rounded-full text-white/40 hover:text-white/80 hover:bg-white/5 transition-all duration-200'>
// 						<FiUsers className='text-sm md:text-base' />
// 					</button>
// 					<button className='p-3 rounded-full text-white/40 hover:text-white/80 hover:bg-white/5 transition-all duration-200'>
// 						<FiUsers className='text-sm md:text-base' />
// 					</button>
// 					<button className='p-3 rounded-full text-white/40 hover:text-white/80 hover:bg-white/5 transition-all duration-200'>
// 						<FiUsers className='text-sm md:text-base' />
// 					</button>
// 					<button className='p-3 rounded-full text-white/40 hover:text-white/80 hover:bg-white/5 transition-all duration-200'>
// 						<FiUsers className='text-sm md:text-base' />
// 					</button>
// 				</div>
// 			</div>
// 		</div>
// 	);
// };

// export default FloatingSidebar;
