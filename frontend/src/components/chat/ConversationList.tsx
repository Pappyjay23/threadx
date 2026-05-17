import { FiSearch, FiLogOut } from 'react-icons/fi';
import PresenceAvatar from './PresenceAvatar';

interface ConversationListProps {
  onSelectChat: (id: string) => void;
  activeChatId?: string;
  onLogout: () => void;
}

const ConversationList = ({ onSelectChat, activeChatId, onLogout }: ConversationListProps) => {
  const mockChats = [
    { id: '1', name: 'Ann Schleifer', message: 'Hey! Did you check out that new...', unread: 3, isOnline: true, typing: false },
    { id: '2', name: 'Hussein Saddam', message: 'Typing...', unread: 0, isOnline: true, typing: true },
    { id: '3', name: 'Vladimir Basuki', message: 'Nice! I have been wanting to...', unread: 0, isOnline: false, typing: false },
  ];

  return (
    <section className="w-full md:w-80 h-full border-r border-white/5 bg-[#08061b] flex flex-col">
      <div className="p-4 flex items-center justify-between border-b border-white/5">
        <h1 className="text-xl font-bold tracking-tight text-white/90">Chats</h1>
        <button onClick={onLogout} className="hidden md:block p-2 text-white/40 hover:text-red-400 rounded-lg hover:bg-white/5 transition-all">
          <FiLogOut className="h-4 w-4" />
        </button>
      </div>

      <div className="p-3">
        <div className="relative">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20" />
          <input
            type="text"
            placeholder="Search Message..."
            className="w-full bg-[#0c0926] border border-white/5 rounded-xl py-2 pl-9 pr-4 text-sm text-white placeholder-white/20 focus:outline-none focus:border-[#7556d3]/50 transition-colors"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-1 px-2 pb-20 md:pb-4">
        {mockChats.map((chat) => {
          const isActive = chat.id === activeChatId;
          return (
            <div
              key={chat.id}
              onClick={() => onSelectChat(chat.id)}
              className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all duration-150 ${
                isActive ? 'bg-[#7556d3]/20 border border-[#7556d3]/30' : 'border border-transparent hover:bg-white/5'
              }`}
            >
              <PresenceAvatar isOnline={chat.isOnline} size="md" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-0.5">
                  <h3 className="text-sm font-semibold text-white/90 truncate">{chat.name}</h3>
                </div>
                <p className={`text-xs truncate ${chat.typing ? 'text-[#a286f7] font-medium' : 'text-white/40'}`}>
                  {chat.message}
                </p>
              </div>
              {chat.unread > 0 && (
                <span className="h-5 min-w-5 px-1 flex items-center justify-center bg-[#7556d3] text-white text-[10px] font-bold rounded-full">
                  {chat.unread}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default ConversationList;