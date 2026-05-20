import useChatStore from "@/store/useChatStore";
import { useEffect, useState } from "react";
import { FiMessageSquare, FiSearch, FiX } from "react-icons/fi";
import EmptyState from "../shared/EmptyState";
import ChatBubble from "./ChatBubble";
import ChatInput from "./ChatInput";
import ChatProfilePanel from "./ChatProfilePanel";
import PresenceAvatar from "./PresenceAvatar";
import { toast } from "sonner";

interface ChatActiveAreaProps {
	chatId?: string;
	onCloseChat: () => void;
	soundEnabled: boolean;
	onOpenHeaderProfile: () => void;
}

const mockMessages = [
	{
		id: "1",
		message:
			"Hey! Did you check out that new café downtown? I heard they have the best lattes.",
		isSelf: false,
		timestamp: "11:00 AM",
	},
	{
		id: "2",
		message:
			"Hey! Yeah, I actually went there yesterday. The lattes are amazing, and the ambiance is super cozy.",
		isSelf: true,
		timestamp: "11:02 AM",
	},
	{
		id: "3",
		message:
			"Nice! I've been wanting to try their pastries too. Were they any good?",
		isSelf: false,
		timestamp: "11:05 AM",
	},
];

const ChatActiveArea = ({
	chatId,
	onCloseChat,
	soundEnabled,
}: ChatActiveAreaProps) => {
	const { chats } = useChatStore();
	const chat = chats.find((c) => c.id === chatId);

	const [showProfile, setShowProfile] = useState(false);

	useEffect(() => {
		setShowProfile(false);
	}, [chatId]);

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
					className='flex items-center gap-3 cursor-pointer group'
					onClick={() => setShowProfile(true)}>
					<PresenceAvatar
						isOnline={chat?.isOnline ?? false}
						size='md'
						src={chat?.image}
						name={chat?.name}
					/>
					<div>
						<p className='text-sm font-semibold text-white/90 group-hover:text-primary/90 transition-colors duration-300'>
							{chat?.name ?? "ThreadX User"}
						</p>
						<span
							className={`text-[10px] ${
								chat?.isOnline ? "text-[#10b981]" : "text-white/40"
							} font-light tracking-wide`}>
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
				{mockMessages && mockMessages.length > 0 ? (
					mockMessages.map((msg) => (
						<ChatBubble
							key={msg.id}
							message={msg.message}
							isSelf={msg.isSelf}
							timestamp={msg.timestamp}
						/>
					))
				) : (
					<div className='h-full flex items-center justify-center'>
						<EmptyState
							icon={<FiMessageSquare className='text-5xl' />}
							title='No messages yet'
							description='Start a conversation by sending a message'
							className='max-w-md'
						/>
					</div>
				)}
			</div>

			<ChatInput
				onSendMessage={(text) => {
					toast.info(text);
					console.log(text);
				}}
				soundEnabled={soundEnabled}
			/>

			<ChatProfilePanel
				isOpen={showProfile}
				onClose={() => setShowProfile(false)}
				chat={
					chat
						? {
								id: chat.id,
								name: chat.name,
								image: chat.image,
								isOnline: chat.isOnline,
								email: chat.email,
								username: chat.username,
								// bio: chat.bio,
							}
						: undefined
				}
			/>
		</div>
	);
};

export default ChatActiveArea;
