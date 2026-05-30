import { useAuthStore } from "@/store/useAuthStore";
import useChatStore from "@/store/useChatStore";
import { useEffect, useRef, useState } from "react";
import { FiArrowDown, FiMessageSquare, FiSearch, FiX } from "react-icons/fi";
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
import type { PopulatedSender } from "@/types/chat";

interface ChatActiveAreaProps {
	chatId?: string;
	onCloseChat: () => void;
	onOpenHeaderProfile: () => void;
}

const ChatActiveArea = ({ chatId, onCloseChat }: ChatActiveAreaProps) => {
	const {
		selectedChat,
		messages,
		messagesHasMore,
		isMessagesLoading,
		isLoadingMoreMessages,
		lastReadAt,
		getMessages,
		loadMoreMessages,
		sendMessage,
		subscribeToMessages,
		unsubscribeFromMessages,
		markAsRead,
		chats,
	} = useChatStore();
	const { user, onlineUsers } = useAuthStore();

	const isDirect = selectedChat?.type === "direct";
	const isOnline =
		isDirect &&
		selectedChat?.partnerId &&
		onlineUsers.includes(selectedChat.partnerId);

	const activeChat = chats.find((c) => c.id === chatId);
	const isTyping = activeChat?.typing;

	const [showProfile, setShowProfile] = useState(false);
	const [isSearchOpen, setIsSearchOpen] = useState(false);
	const [messageSearch, setMessageSearch] = useState("");
	const [contextMenu, setContextMenu] = useState<{
		top: number;
		left: number;
	} | null>(null);
	const [showScrollButton, setShowScrollButton] = useState(false);
	const [hasInitialScrolled, setHasInitialScrolled] = useState(false);

	const scrollContainerRef = useRef<HTMLDivElement>(null);
	const messageEndRef = useRef<HTMLDivElement>(null);
	const topSentinelRef = useRef<HTMLDivElement>(null);
	const isInitialLoad = useRef(false);
	const searchInputRef = useRef<HTMLInputElement>(null);
	const unreadDividerIndex = useRef<number | null>(null);

	// Calculate unread divider index (first unread message FROM THE OTHER PERSON)
	useEffect(() => {
		if (!lastReadAt || messages.length === 0) {
			unreadDividerIndex.current = null;
			return;
		}

		const firstUnreadIndex = messages.findIndex(
			(msg) =>
				new Date(msg.createdAt) > new Date(lastReadAt) &&
				msg.senderId !== user?._id,
		);
		unreadDividerIndex.current =
			firstUnreadIndex >= 0 ? firstUnreadIndex : null;
	}, [messages, lastReadAt, user?._id]);

	const handleWorkspaceContextMenu = (e: React.MouseEvent<HTMLDivElement>) => {
		const target = e.target as HTMLElement;
		const bubbleElement = target.closest("[data-bubble='true']");

		if (bubbleElement) {
			return;
		}

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
			setHasInitialScrolled(false);
			getMessages(chatId);
			subscribeToMessages();
			setShowProfile(false);
			setIsSearchOpen(false);
			setMessageSearch("");
			setShowScrollButton(false);
		}

		return () => {
			unsubscribeFromMessages();
		};
	}, [chatId, getMessages, subscribeToMessages, unsubscribeFromMessages]);

	// Mark as read AFTER messages are loaded and scrolled
	useEffect(() => {
		if (
			chatId &&
			!isMessagesLoading &&
			messages.length > 0 &&
			hasInitialScrolled
		) {
			const timer = setTimeout(() => {
				markAsRead(chatId);
			}, 500);
			return () => clearTimeout(timer);
		}
	}, [
		chatId,
		isMessagesLoading,
		messages.length,
		hasInitialScrolled,
		markAsRead,
	]);

	// Detect scroll position for the "scroll to bottom" button
	useEffect(() => {
		const container = scrollContainerRef.current;
		if (!container) return;

		const handleScroll = () => {
			const distanceFromBottom =
				container.scrollHeight - container.scrollTop - container.clientHeight;
			setShowScrollButton(distanceFromBottom > 200);
		};

		handleScroll();

		container.addEventListener("scroll", handleScroll, { passive: true });
		return () => container.removeEventListener("scroll", handleScroll);
	}, [messages]);

	const scrollToBottom = (behavior: ScrollBehavior = "smooth") => {
		messageEndRef.current?.scrollIntoView({ behavior });
	};

	// Scroll logic
	useEffect(() => {
		if (!messageEndRef.current || messages.length === 0) return;

		const container = scrollContainerRef.current;
		if (!container) return;

		// If this is a socket update (not initial load), handle it separately
		if (hasInitialScrolled) {
			const distanceFromBottom =
				container.scrollHeight - container.scrollTop - container.clientHeight;

			if (distanceFromBottom < 100) {
				scrollToBottom("smooth");
			}
			return;
		}

		// Initial load — wait for DOM to render
		isInitialLoad.current = false;

		setTimeout(() => {
			if (!container) return;

			if (lastReadAt) {
				let lastReadMessageIndex = -1;

				for (let i = 0; i < messages.length; i++) {
					const msg = messages[i];
					if (
						new Date(msg.createdAt) > new Date(lastReadAt) &&
						msg.senderId !== user?._id
					) {
						lastReadMessageIndex = i - 1;
						break;
					}
				}

				if (lastReadMessageIndex >= 0) {
					const messageElements = container.querySelectorAll(
						'[data-bubble="true"]',
					);
					const targetElement = messageElements[lastReadMessageIndex];
					if (targetElement) {
						targetElement.scrollIntoView({
							behavior: "instant",
							block: "start",
						});
						setHasInitialScrolled(true);
						return;
					}
				} else if (lastReadMessageIndex === -1) {
					const hasUnreadFromOther = messages.some(
						(msg) =>
							new Date(msg.createdAt) > new Date(lastReadAt) &&
							msg.senderId !== user?._id,
					);
					if (hasUnreadFromOther) {
						container.scrollTop = 0;
						setHasInitialScrolled(true);
						return;
					}
				}
			}

			scrollToBottom("instant");
			setHasInitialScrolled(true);
		}, 100);
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
			<div className='border-b border-primary/10 backdrop-blur-md'>
				<div className='p-4 flex items-center justify-between gap-3'>
					<div
						className='flex items-center gap-3 cursor-pointer group shrink-0'
						onClick={() => setShowProfile(true)}>
						<PresenceAvatar
							isOnline={!!isOnline}
							size='md'
							src={selectedChat?.image}
							name={selectedChat?.name}
						/>
						<div>
							<p className='text-sm font-semibold text-white/90 group-hover:text-primary/90 transition-colors duration-300 mb-1 capitalize'>
								{selectedChat?.name ??
									(isDirect ? "ThreadX User" : "ThreadX Group")}
							</p>
							<span
								className={`text-[10px] ${
									isTyping
										? "text-primary italic animate-pulse"
										: isOnline
											? "text-[#10b981]"
											: "text-white/40"
								} font-light tracking-wide truncate max-w-50 block capitalize`}>
								{isTyping
									? "Typing..."
									: isDirect
										? isOnline
											? "Online"
											: "Offline"
										: selectedChat?.members
												?.map((m) => m.name.split(" ")[0])
												.join(", ") || "Group"}
							</span>
						</div>
					</div>

					<div className='flex items-center gap-1 md:gap-2'>
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
							<FiSearch className='text-xs md:text-sm' />
						</button>

						<button
							onClick={onCloseChat}
							className='p-2 text-foreground border border-transparent hover:border-primary/50 rounded-full hover:bg-white/5 transition-all duration-500 ease-in-out cursor-pointer shrink-0'>
							<FiX className='text-xs md:text-sm' />
						</button>
					</div>
				</div>

				{/* Search bar below header */}
				<div
					className={`overflow-hidden transition-all duration-300 ease-in-out ml-auto ${
						isSearchOpen
							? "max-h-14 opacity-100 pb-3 w-64"
							: "max-h-0 opacity-0 pb-0 w-64 pointer-events-none"
					}`}>
					<div className='relative flex items-center px-4'>
						<FiSearch className='absolute left-7 h-3.5 w-3.5 text-foreground/40 shrink-0' />
						<input
							ref={searchInputRef}
							value={messageSearch}
							onChange={(e) => setMessageSearch(e.target.value)}
							placeholder='Search messages...'
							className='w-full bg-white/5 border border-primary/20 rounded-full py-1.5 pl-8 pr-8 text-[10px] md:text-xs text-white/80 placeholder:text-foreground/30 focus:outline-none focus:border-primary/50 transition-colors'
						/>
						{messageSearch && (
							<button
								onClick={() => setMessageSearch("")}
								className='absolute right-7 text-foreground/40 hover:text-white transition-colors cursor-pointer'>
								<IoCloseOutline className='text-sm' />
							</button>
						)}
					</div>
				</div>
			</div>

			{/* Messages Viewport */}
			<div
				ref={scrollContainerRef}
				onContextMenu={handleWorkspaceContextMenu}
				className='flex-1 overflow-y-auto p-4 space-y-1 relative'>
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

						const showUnreadDivider =
							!messageSearch.trim() &&
							unreadDividerIndex.current !== null &&
							index === unreadDividerIndex.current;

						return (
							<div key={msg?._id}>
								{showDateSeparator && (
									<DateSeparator label={getDateLabel(msgDate)} />
								)}
								{showUnreadDivider && (
									<div className='flex items-center gap-3 my-4'>
										<div className='flex-1 h-px bg-primary/30' />
										<span className='text-[10px] font-semibold text-primary uppercase tracking-wider whitespace-nowrap'>
											New messages
										</span>
										<div className='flex-1 h-px bg-primary/30' />
									</div>
								)}
								<ChatBubble
									message={msg}
									isSelf={
										typeof msg.senderId === "string"
											? msg.senderId === user?._id
											: (msg.senderId as PopulatedSender)?._id === user?._id
									}
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

				{isTyping && (
					<div className={`flex w-full justify-start mb-3 px-2`}>
						<div className='max-w-[85%] md:max-w-[70%] group relative flex items-start gap-2 flex-row'>
							<div className='flex-1'>
								<p className='text-[10px] font-light text-white/60 mb-1 text-left ml-1 capitalize'>
									{activeChat?.typingUser ||
										(isDirect ? (selectedChat?.name ?? "User") : "Someone")}
								</p>

								<div className='w-17 shadow-lg text-white/80 rounded-t-lg rounded-br-lg bg-secondary border border-primary/10'>
									<div className='py-2 px-4 flex items-center justify-center gap-1.5'>
										<span
											className='w-1.5 h-1.5 bg-primary/60 rounded-full animate-typing-bounce'
											style={{ animationDelay: "0ms" }}
										/>
										<span
											className='w-1.5 h-1.5 bg-primary/60 rounded-full animate-typing-bounce'
											style={{ animationDelay: "150ms" }}
										/>
										<span
											className='w-1.5 h-1.5 bg-primary/60 rounded-full animate-typing-bounce'
											style={{ animationDelay: "300ms" }}
										/>
									</div>
								</div>
							</div>

							<div className='w-6 shrink-0' />
						</div>
					</div>
				)}

				<div ref={messageEndRef} />
			</div>

			{showScrollButton && (
				<button
					onClick={() => scrollToBottom()}
					className='absolute bottom-20 left-1/2 -translate-x-1/2 p-2 bg-primary/90 hover:bg-primary text-white rounded-full shadow-lg shadow-primary/20 transition-all duration-200 cursor-pointer z-50 animate-fade-in'
					aria-label='Scroll to bottom'>
					<FiArrowDown className='text-sm' />
				</button>
			)}

			<ChatInput
				onSendMessage={(text, imageFile, imagePreview) =>
					sendMessage({ text }, imageFile, imagePreview)
				}
			/>

			<ChatProfilePanel
				isOpen={showProfile}
				onClose={() => setShowProfile(false)}
				chat={selectedChat}
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
