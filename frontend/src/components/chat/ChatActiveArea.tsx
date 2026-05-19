import useChatStore from "@/store/useChatStore";
import { FiMessageSquare, FiSearch, FiX } from "react-icons/fi";
import EmptyState from "../shared/EmptyState";
import ChatBubble from "./ChatBubble";
import ChatInput from "./ChatInput";
import PresenceAvatar from "./PresenceAvatar";

interface ChatActiveAreaProps {
	chatId?: string;
	onCloseChat: () => void;
	soundEnabled: boolean;
	onOpenHeaderProfile: () => void;
}

const ChatActiveArea = ({
	chatId,
	onCloseChat,
	soundEnabled,
	// onOpenHeaderProfile,
}: ChatActiveAreaProps) => {
	const { chats } = useChatStore();
	const chat = chats.find((c) => c.id === chatId);

	if (!chatId) {
		return (
			<div className='hidden md:flex flex-1 items-center justify-center p-6'>
				<EmptyState
					icon={<FiMessageSquare className='text-5xl' />}
					title='No conversation selected'
					description='Choose a chat from the list or start a new conversation to see messages here.'
					className='max-w-md'
				/>
			</div>
		);
	}

	return (
		<div className='flex-1 flex-col bg-workspace-noise h-full relative flex z-20'>
			<div className='p-4 border-b border-primary/10 backdrop-blur-md flex items-center justify-between'>
				<div
					className='flex items-center gap-3 cursor-pointer'
					// onClick={onOpenHeaderProfile}
				>
					<PresenceAvatar
						isOnline={chat?.isOnline ?? false}
						size='md'
						src={chat?.image}
						name={chat?.name}
					/>
					<div>
						<p className='text-sm font-semibold text-white/90'>
							{chat?.name ?? "ThreadX User"}
						</p>
						<span
							className={`text-[10px] ${chat?.isOnline ? "text-[#10b981]" : "text-white/40"} font-light tracking-wide`}>
							{chat?.isOnline ? "Online" : "Offline"}
						</span>
					</div>
				</div>

				<div className='flex items-center gap-2'>
					<button className='p-2 text-foreground border border-transparent hover:border-primary/50 rounded-full hover:bg-white/5 transition-all duration-500 ease-in-out cursor-pointer'>
						<FiSearch className='h-4 w-4' />
					</button>
					<button
						onClick={onCloseChat}
						className='p-2 text-foreground border border-transparent hover:border-primary/50 rounded-full hover:bg-white/5 transition-all duration-500 ease-in-out cursor-pointer'>
						<FiX className='h-4 w-4' />
					</button>
				</div>
			</div>

			<div className='flex-1 overflow-y-auto p-4 space-y-1'>
				<ChatBubble
					message='Hey! Did you check out that new café downtown? I heard they have the best lattes.'
					isSelf={false}
					timestamp='11:00 AM'
				/>
				<ChatBubble
					message='Hey! Yeah, I actually went there yesterday. The lattes are amazing, and the ambiance is super cozy.'
					isSelf={true}
					timestamp='11:02 AM'
				/>
				<ChatBubble
					message="Nice! I've been wanting to try their pastries too. Were they any good?"
					isSelf={false}
					timestamp='11:05 AM'
				/>
				<ChatBubble
					message='Hey! Did you check out that new café downtown? I heard they have the best lattes.'
					isSelf={false}
					timestamp='11:00 AM'
				/>
				<ChatBubble
					message='Hey! Yeah, I actually went there yesterday. The lattes are amazing, and the ambiance is super cozy.'
					isSelf={true}
					timestamp='11:02 AM'
				/>
				<ChatBubble
					message="Nice! I've been wanting to try their pastries too. Were they any good?"
					isSelf={false}
					timestamp='11:05 AM'
				/>
				<ChatBubble
					message='Hey! Did you check out that new café downtown? I heard they have the best lattes.'
					isSelf={false}
					timestamp='11:00 AM'
				/>
				<ChatBubble
					message='Hey! Yeah, I actually went there yesterday. The lattes are amazing, and the ambiance is super cozy.'
					isSelf={true}
					timestamp='11:02 AM'
				/>
				<ChatBubble
					message="Nice! I've been wanting to try their pastries too. Were they any good?"
					isSelf={false}
					timestamp='11:05 AM'
				/>
			</div>

			<ChatInput
				onSendMessage={(text) => {
					console.log(text);
				}}
				soundEnabled={soundEnabled}
			/>
		</div>
	);
};

export default ChatActiveArea;
