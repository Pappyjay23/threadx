import { useAuthStore } from "@/store/useAuthStore";
import useChatStore from "@/store/useChatStore";
import { useEffect, useRef, useState } from "react";
import { FiMessageSquare, FiSearch, FiX } from "react-icons/fi";
import { IoCloseOutline } from "react-icons/io5";
import EmptyState from "../shared/EmptyState";
import ChatBubble from "./ChatBubble";
import ChatInput from "./ChatInput";
import ChatProfilePanel from "./ChatProfilePanel";
import MessageSkeletonLoader from "./MessageSkeletonLoader";
import PresenceAvatar from "./PresenceAvatar";
import DateSeparator from "./DateSeparator";
import { getDateLabel } from "@/utils/helpers";
import ChatContextMenu from "./ChatContextMenu";

interface ChatActiveAreaProps {
	chatId?: string;
	onCloseChat: () => void;
	onOpenHeaderProfile: () => void;
}

const ChatActiveArea = ({ chatId, onCloseChat }: ChatActiveAreaProps) => {
	const {
		selectedUser,
		messages,
		messagesHasMore,
		isMessagesLoading,
		isLoadingMoreMessages,
		getMessagesByUserId,
		loadMoreMessages,
		sendMessage,
		subscribeToMessages,
		unsubscribeFromMessages,
	} = useChatStore();
	const { user, onlineUsers } = useAuthStore();

	const isOnline =
		selectedUser && onlineUsers.includes(selectedUser.id.toString());

	const [showProfile, setShowProfile] = useState(false);
	const [isSearchOpen, setIsSearchOpen] = useState(false);
	const [messageSearch, setMessageSearch] = useState("");
	const [contextMenu, setContextMenu] = useState<{
		top: number;
		left: number;
	} | null>(null);

	const scrollContainerRef = useRef<HTMLDivElement>(null);
	const messageEndRef = useRef<HTMLDivElement>(null);
	const topSentinelRef = useRef<HTMLDivElement>(null);
	const isInitialLoad = useRef(false);
	const searchInputRef = useRef<HTMLInputElement>(null);

	const handleWorkspaceContextMenu = (e: React.MouseEvent<HTMLDivElement>) => {
		const target = e.target as HTMLElement;
		const bubbleElement = target.closest("[data-bubble='true']");

		// If the user right-clicked a bubble, let the bubble or browser handle it
		if (bubbleElement) {
			return;
		}

		// Explicitly stop the browser menu from showing up
		e.preventDefault();
		e.stopPropagation();

		const menuWidth = 176;
		const menuHeight = 90;
		const left = Math.min(e.clientX, window.innerWidth - menuWidth - 8);
		const top = Math.min(e.clientY, window.innerHeight - menuHeight - 8);

		setContextMenu({ top, left });
	};

	// Context Menu Handler
	useEffect(() => {
		const closeMenu = () => {
			setContextMenu(null);
		};

		document.addEventListener("click", closeMenu);
		document.addEventListener("contextmenu", closeMenu);

		return () => {
			document.removeEventListener("click", closeMenu);
			document.removeEventListener("contextmenu", closeMenu);
		};
	}, []);

	useEffect(() => {
		if (chatId) {
			isInitialLoad.current = true;
			getMessagesByUserId(chatId);
			subscribeToMessages();
			setShowProfile(false);
			setIsSearchOpen(false);
			setMessageSearch("");
		}

		return () => {
			unsubscribeFromMessages();
		};
	}, [
		chatId,
		getMessagesByUserId,
		subscribeToMessages,
		unsubscribeFromMessages,
	]);

	// Scroll to bottom logic
	useEffect(() => {
		if (!messageEndRef.current || messages.length === 0) return;

		if (isInitialLoad.current) {
			isInitialLoad.current = false;
			requestAnimationFrame(() => {
				requestAnimationFrame(() => {
					messageEndRef.current?.scrollIntoView({ behavior: "instant" });
				});
			});
			return;
		}

		const container = scrollContainerRef.current;
		if (!container) return;

		const distanceFromBottom =
			container.scrollHeight - container.scrollTop - container.clientHeight;

		if (distanceFromBottom < 100) {
			messageEndRef.current.scrollIntoView({ behavior: "smooth" });
		}
	}, [messages]);

	// Load older messages when top sentinel is visible
	useEffect(() => {
		if (!topSentinelRef.current) return;

		const observer = new IntersectionObserver(
			async (entries) => {
				if (
					!entries[0].isIntersecting ||
					!messagesHasMore ||
					isLoadingMoreMessages
				)
					return;

				const container = scrollContainerRef.current;
				const prevScrollHeight = container?.scrollHeight ?? 0;

				await loadMoreMessages(chatId!);

				requestAnimationFrame(() => {
					if (container) {
						container.scrollTop += container.scrollHeight - prevScrollHeight;
					}
				});
			},
			{ threshold: 0.1 },
		);

		observer.observe(topSentinelRef.current);
		return () => observer.disconnect();
	}, [chatId, messagesHasMore, isLoadingMoreMessages, loadMoreMessages]);

	// Focus search input when opened
	useEffect(() => {
		if (isSearchOpen) {
			const timer = setTimeout(() => searchInputRef.current?.focus(), 50);
			return () => clearTimeout(timer);
		}
	}, [isSearchOpen]);

	const filteredMessages = messageSearch.trim()
		? messages.filter((msg) =>
				msg.text?.toLowerCase().includes(messageSearch.toLowerCase()),
			)
		: messages;

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
			<div className='p-4 border-b border-primary/10 backdrop-blur-md flex items-center justify-between gap-3'>
				<div
					className='flex items-center gap-3 cursor-pointer group shrink-0'
					onClick={() => setShowProfile(true)}>
					<PresenceAvatar
						isOnline={isOnline ?? false}
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
								isOnline ? "text-[#10b981]" : "text-white/40"
							} font-light tracking-wide`}>
							{isOnline ? "Online" : "Offline"}
						</span>
					</div>
				</div>

				<div className='flex items-center gap-2'>
					<div
						className={`flex items-center gap-2 transition-all duration-300 ease-in-out ${
							isSearchOpen
								? "w-48 md:w-64"
								: "w-0 overflow-hidden opacity-0 pointer-events-none"
						}`}>
						<div className='relative flex items-center w-full'>
							<FiSearch className='absolute left-3 h-3.5 w-3.5 text-foreground/40 shrink-0' />
							<input
								ref={searchInputRef}
								value={messageSearch}
								onChange={(e) => setMessageSearch(e.target.value)}
								placeholder='Search messages...'
								className='w-full bg-white/5 border border-primary/20 rounded-full py-1.5 pl-8 pr-8 text-xs text-white/80 placeholder:text-foreground/30 focus:outline-none focus:border-primary/50 transition-colors'
							/>
							{messageSearch && (
								<button
									onClick={() => setMessageSearch("")}
									className='absolute right-3 text-foreground/40 hover:text-white transition-colors cursor-pointer'>
									<IoCloseOutline className='text-sm' />
								</button>
							)}
						</div>
					</div>

					<button
						onClick={() => {
							setIsSearchOpen((prev) => !prev);
							if (isSearchOpen) setMessageSearch("");
						}}
						className={`p-2 border rounded-full transition-all duration-300 ease-in-out cursor-pointer shrink-0 ${
							isSearchOpen
								? "text-[#a286f7] border-[#7556d3]/50 bg-[#7556d3]/10"
								: "text-foreground border-transparent hover:border-primary/50 hover:bg-white/5"
						}`}>
						<FiSearch className='h-4 w-4' />
					</button>

					<button
						onClick={onCloseChat}
						className='p-2 text-foreground border border-transparent hover:border-primary/50 rounded-full hover:bg-white/5 transition-all duration-500 ease-in-out cursor-pointer shrink-0'>
						<FiX className='h-4 w-4' />
					</button>
				</div>
			</div>

			{/* Messages Viewport */}
			<div
				ref={scrollContainerRef}
				onContextMenu={handleWorkspaceContextMenu}
				className='flex-1 overflow-y-auto p-4 space-y-1'>
				<div ref={topSentinelRef} className='py-1'>
					{isLoadingMoreMessages && (
						<div className='flex justify-center py-2'>
							<span className='text-xs text-foreground/50'>
								Loading older messages...
							</span>
						</div>
					)}
				</div>

				{isMessagesLoading ? (
					<MessageSkeletonLoader />
				) : filteredMessages.length > 0 ? (
					filteredMessages.map((msg, index) => {
						const msgDate = msg?.createdAt ? new Date(msg.createdAt) : null;
						const prevMsg = filteredMessages[index - 1];
						const prevDate = prevMsg?.createdAt
							? new Date(prevMsg.createdAt)
							: null;

						const showDateSeparator =
							msgDate &&
							(!prevDate || msgDate.toDateString() !== prevDate.toDateString());

						return (
							<div key={msg?._id}>
								{showDateSeparator && (
									<DateSeparator label={getDateLabel(msgDate)} />
								)}
								<ChatBubble
									messageId={msg._id}
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
									searchQuery={messageSearch}
									isLastMessage={index === filteredMessages.length - 1}
								/>
							</div>
						);
					})
				) : (
					<div className='h-full flex items-center justify-center'>
						<EmptyState
							icon={<FiMessageSquare className='text-5xl' />}
							title={
								messageSearch
									? "No messages match your search."
									: "No messages yet"
							}
							description={
								messageSearch
									? "Try a different search term."
									: "Start a conversation by sending a message"
							}
							className='max-w-md'
						/>
					</div>
				)}
				{filteredMessages.length > 0 && <div ref={messageEndRef} />}
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
								isOnline: isOnline || false,
								email: selectedUser.email,
								username: selectedUser.username,
								dateJoined: selectedUser.dateJoined,
							}
						: undefined
				}
			/>

			<ChatContextMenu
				position={contextMenu}
				onSearchMessages={() => setIsSearchOpen(true)}
				onCloseChat={onCloseChat}
				onClose={() => setContextMenu(null)}
			/>
		</div>
	);
};

export default ChatActiveArea;
