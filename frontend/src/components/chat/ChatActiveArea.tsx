import { useAuthStore } from "@/store/useAuthStore";
import useChatStore from "@/store/useChatStore";
import { useEffect, useRef, useState } from "react";
import { FiMessageSquare, FiSearch, FiX } from "react-icons/fi";
import EmptyState from "../shared/EmptyState";
import ChatBubble from "./ChatBubble";
import ChatInput from "./ChatInput";
import ChatProfilePanel from "./ChatProfilePanel";
import PresenceAvatar from "./PresenceAvatar";
import MessageSkeletonLoader from "./MessageSkeletonLoader";

interface ChatActiveAreaProps {
	chatId?: string;
	onCloseChat: () => void;
	onOpenHeaderProfile: () => void;
}

const ChatActiveArea = ({ chatId, onCloseChat }: ChatActiveAreaProps) => {
	const {
		selectedUser,
		messages,
		isMessagesLoading,
		getMessagesByUserId,
		sendMessage,
	} = useChatStore();
	const { user } = useAuthStore();

	const [showProfile, setShowProfile] = useState(false);
	const messageEndRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (chatId) getMessagesByUserId(chatId);
		setShowProfile(false);
	}, [chatId]);

	useEffect(() => {
		if (messageEndRef.current) {
			messageEndRef.current.scrollIntoView({ behavior: "smooth" });
		}
	}, [messages]);

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
						isOnline={selectedUser?.isOnline ?? false}
						size='md'
						src={selectedUser?.image}
						name={selectedUser?.name}
					/>
					<div>
						<p className='text-sm font-semibold text-white/90 group-hover:text-primary/90 transition-colors duration-300'>
							{selectedUser?.name ?? "ThreadX User"}
						</p>
						<span
							className={`text-[10px] ${
								selectedUser?.isOnline ? "text-[#10b981]" : "text-white/40"
							} font-light tracking-wide`}>
							{selectedUser?.isOnline ? "Online" : "Offline"}
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
				{isMessagesLoading ? (
					<MessageSkeletonLoader />
				) : messages.length > 0 ? (
					messages.map((msg) => {
						return (
							<ChatBubble
								key={msg?._id}
								message={msg?.text ?? ""}
								isSelf={msg?.senderId === user?._id}
								timestamp={
									msg?.createdAt
										? new Date(msg.createdAt).toLocaleTimeString([], {
												hour: "2-digit",
												minute: "2-digit",
											})
										: ""
								}
								image={msg?.image}
							/>
						);
					})
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
				{messages.length > 0 && <div ref={messageEndRef} />}
			</div>

			<ChatInput
				onSendMessage={(text, imageFile, imagePreview) =>
					sendMessage({ text }, imageFile, imagePreview)
				}
			/>

			<ChatProfilePanel
				isOpen={showProfile}
				onClose={() => setShowProfile(false)}
				chat={
					selectedUser
						? {
								id: selectedUser.id,
								name: selectedUser.name,
								image: selectedUser.image,
								isOnline: selectedUser.isOnline,
								email: selectedUser.email,
								username: selectedUser.username,
								dateJoined: selectedUser.dateJoined,
							}
						: undefined
				}
			/>
		</div>
	);
};

export default ChatActiveArea;
