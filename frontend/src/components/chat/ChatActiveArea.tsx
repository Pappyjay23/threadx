import { FiSearch, FiX } from 'react-icons/fi';
import ChatBubble from './ChatBubble';
import ChatInput from './ChatInput';
import PresenceAvatar from './PresenceAvatar';

interface ChatActiveAreaProps {
  chatId?: string;
  onCloseChat: () => void;
  soundEnabled: boolean;
  onOpenHeaderProfile: () => void;
}

const ChatActiveArea = ({ chatId, onCloseChat, soundEnabled, onOpenHeaderProfile }: ChatActiveAreaProps) => {
  if (!chatId) {
    return (
      <div className="hidden md:flex flex-1 flex-col items-center justify-center text-center p-6">
        <div className="h-16 w-16 rounded-2xl bg-white/5 flex items-center justify-center border border-white/5 mb-4 opacity-40">
          <PresenceAvatar isOnline={false} size="sm" />
        </div>
        <p className="text-white/20 text-sm tracking-wide">Select a chat context from the console hierarchy to bridge connection.</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex-col bg-workspace-noise h-full relative flex z-20">
      <div className="p-4 border-b border-white/5 bg-[#08061b]/80 backdrop-blur-md flex items-center justify-between">
        <div className="flex items-center gap-3 cursor-pointer" onClick={onOpenHeaderProfile}>
          <PresenceAvatar isOnline={true} size="md" />
          <div>
            <h2 className="text-sm font-semibold text-white/90">Ann Schleifer</h2>
            <span className="text-[10px] text-[#10b981] font-medium tracking-wide">• Online</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button className="p-2 text-white/40 hover:text-white rounded-lg hover:bg-white/5 transition-all">
            <FiSearch className="h-4 w-4" />
          </button>
          <button onClick={onCloseChat} className="p-2 text-white/40 hover:text-white rounded-lg hover:bg-white/5 transition-all">
            <FiX className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-1">
        <ChatBubble message="Hey! Did you check out that new café downtown? I heard they have the best lattes." isSelf={false} timestamp="11:00 AM" />
        <ChatBubble message="Hey! Yeah, I actually went there yesterday. The lattes are amazing, and the ambiance is super cozy." isSelf={true} timestamp="11:02 AM" />
        <ChatBubble message="Nice! I've been wanting to try their pastries too. Were they any good?" isSelf={false} timestamp="11:05 AM" />
      </div>

      <ChatInput onSendMessage={() => {}} soundEnabled={soundEnabled} />
    </div>
  );
};

export default ChatActiveArea;