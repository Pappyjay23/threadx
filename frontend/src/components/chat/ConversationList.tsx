import { useAuthStore } from "@/store/useAuthStore";
import useChatStore from "@/store/useChatStore";
import type { ActiveTab, Chat } from "@/types/chat";
import { useCallback, useEffect, useRef, useState } from "react";
import { BsPinFill } from "react-icons/bs";
import { FiMoreVertical, FiPlus, FiSearch } from "react-icons/fi";
import {
	IoChatbubblesOutline,
	IoCloseOutline,
	IoSearchOutline,
} from "react-icons/io5";
import EmptyState from "../shared/EmptyState";
import Input from "../ui/Input";
import { ChatSkeletonLoader } from "./ChatSkeletonLoader";
import ConversationMenu from "./ConversationMenu";
import PresenceAvatar from "./PresenceAvatar";

interface ConversationListProps {
	onSelectChat: (id: string) => void;
	activeChatId?: string;
	setActiveTab: React.Dispatch<React.SetStateAction<ActiveTab>>;
}

const DEBOUNCE_MS = 350;
const LONG_PRESS_MS = 500;

const ConversationList = ({
	onSelectChat,
	activeChatId,
	setActiveTab,
}: ConversationListProps) => {
	const [isSearchOpen, setIsSearchOpen] = useState(false);
	const [searchQuery, setSearchQuery] = useState("");
	const searchRef = useRef<HTMLInputElement | null>(null);
	const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

	const [menuData, setMenuData] = useState<{
		chat: Chat;
		top: number;
		left: number;
	} | null>(null);
	const longPressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
	const isLongPressActive = useRef(false);
	const longPressTarget = useRef<Chat | null>(null);

	const { onlineUsers } = useAuthStore();
	const {
		chats,
		setSelectedUser,
		getChatPartners,
		isChatsLoading,
		togglePin,
		markAsRead,
	} = useChatStore();

	useEffect(() => {
		getChatPartners("");
	}, [getChatPartners]);

	const handleSearch = useCallback(
		(value: string) => {
			setSearchQuery(value);
			if (debounceRef.current) clearTimeout(debounceRef.current);
			debounceRef.current = setTimeout(() => {
				getChatPartners(value);
			}, DEBOUNCE_MS);
		},
		[getChatPartners],
	);

	const handleCloseSearch = () => {
		setSearchQuery("");
		getChatPartners("");
	};

	// Sorting: Pinned first, then by lastUpdated
	const sortedChats = [...chats].sort((a, b) => {
		if (a.isPinned && !b.isPinned) return -1;
		if (!a.isPinned && b.isPinned) return 1;
		return 0; // Rest is handled by backend sort
	});

	const openMenu = (chat: Chat, x: number, y: number) => {
		const menuWidth = 176;
		const menuHeight = 120;
		const left = Math.min(x, window.innerWidth - menuWidth - 8);
		const top = Math.min(y, window.innerHeight - menuHeight - 8);

		setMenuData({ chat, top, left });
	};

	const closeMenu = () => {
		setMenuData(null);
	};

	const handleMenuButtonClick = (e: React.MouseEvent, chat: Chat) => {
		e.stopPropagation();
		e.preventDefault();

		if (menuData && menuData.chat.id === chat.id) {
			closeMenu();
			return;
		}

		const rect = e.currentTarget.getBoundingClientRect();
		openMenu(chat, rect.left, rect.bottom + 4);
	};

	const handleTouchStart = (e: React.TouchEvent, chat: Chat) => {
		isLongPressActive.current = false;
		longPressTarget.current = chat;
		if (longPressTimerRef.current) clearTimeout(longPressTimerRef.current);

		const touch = e.touches[0];
		longPressTimerRef.current = setTimeout(() => {
			isLongPressActive.current = true;
			openMenu(chat, touch.clientX, touch.clientY);
		}, LONG_PRESS_MS);
	};

	const handleTouchEnd = () => {
		if (longPressTimerRef.current) clearTimeout(longPressTimerRef.current);
	};

	const handleTouchMove = () => {
		// Cancel long press if user scrolls
		if (longPressTimerRef.current) clearTimeout(longPressTimerRef.current);
	};

	const handleChatClick = (chat: Chat) => {
		if (isLongPressActive.current) {
			isLongPressActive.current = false;
			return;
		}
		onSelectChat(chat.id);
		setSelectedUser(chat);
	};

	return (
		<section className='w-full md:w-80 h-full bg-muted/30 flex flex-col relative'>
			<div className='p-4 flex items-center justify-between'>
				<h1 className='text-xl font-bold tracking-tight text-white/90'>
					Chats
				</h1>
				<div className='flex items-center gap-2'>
					<button
						onClick={() => setActiveTab("contacts")}
						className='p-2 text-foreground border border-transparent hover:border-primary/50 rounded-full hover:bg-white/5 transition-all duration-500 ease-in-out cursor-pointer'>
						<FiPlus className='text-base' />
					</button>
					<button
						onClick={() => {
							setIsSearchOpen(!isSearchOpen);
							setTimeout(() => searchRef.current?.focus(), 50);
						}}
						className={`p-2 border rounded-full transition-all duration-500 ease-in-out cursor-pointer ${
							isSearchOpen
								? "text-[#a286f7] border-[#7556d3]/50 bg-[#7556d3]/10"
								: "text-foreground border-transparent hover:border-primary/50 hover:bg-white/5"
						}`}>
						<IoSearchOutline className='text-base' />
					</button>
				</div>
			</div>

			<div
				className={`px-4 overflow-hidden transition-all duration-300 ease-out ${
					isSearchOpen
						? "max-h-14 opacity-100 mb-4"
						: "max-h-0 opacity-0 mb-0 pointer-events-none"
				}`}>
				<div className='relative flex items-center'>
					<Input
						ref={searchRef}
						value={searchQuery}
						onChange={(e) => handleSearch(e.target.value)}
						placeholder='Search chats...'
						type='search'
						className='rounded-full! border-primary/30! border w-full pr-10 text-xs!'
					/>
					{searchQuery && (
						<button
							onClick={handleCloseSearch}
							className='absolute right-3 p-1 rounded-full hover:bg-white/10 text-foreground/50 hover:text-white transition-colors cursor-pointer'>
							<IoCloseOutline className='text-base' />
						</button>
					)}
				</div>
			</div>

			<div className='flex-1 overflow-y-auto space-y-2 px-2 pb-20 md:pb-4'>
				{isChatsLoading ? (
					<ChatSkeletonLoader count={6} />
				) : sortedChats.length > 0 ? (
					sortedChats.map((chat) => {
						const isActive = chat.id === activeChatId;
						return (
							<div
								key={chat.id}
								onClick={() => handleChatClick(chat)}
								onTouchStart={(e) => handleTouchStart(e, chat)}
								onTouchEnd={handleTouchEnd}
								onTouchMove={handleTouchMove}
								onContextMenu={(e) => {
									e.preventDefault();
									openMenu(chat, e.clientX, e.clientY);
								}}
								className={`group flex items-center gap-3 p-3 rounded-md cursor-pointer transition-all duration-150 relative ${
									isActive
										? "bg-[#7556d3]/20 border border-[#7556d3]/30"
										: "border border-transparent hover:bg-white/5"
								}`}>
								<PresenceAvatar
									src={chat.image}
									name={chat.name}
									isOnline={onlineUsers.includes(chat.id)}
									size='md'
								/>
								<div className='flex-1 min-w-0'>
									<h3 className='text-sm font-medium text-white/90 truncate tracking-tight flex items-center gap-1.5'>
										{chat.name}
										{chat.isPinned && (
											<BsPinFill className='text-[10px] text-primary shrink-0' />
										)}
									</h3>
									<p
										title={chat.typing ? "Typing..." : chat.message}
										className={`text-xs truncate font-light ${
											chat.typing
												? "text-primary font-normal"
												: "text-foreground/50"
										}`}>
										{chat.typing ? "Typing..." : chat.message}
									</p>
								</div>

								<div className='flex items-center gap-1.5 shrink-0'>
									<div className='flex flex-col items-end gap-1.5'>
										<p className='text-[10px] truncate font-light text-foreground/70'>
											{chat.lastUpdated}
										</p>
									</div>

									{chat.unread > 0 && (
										<span className='h-5 min-w-5 px-1 flex items-center justify-center bg-[#7556d3] text-white text-[10px] font-bold rounded-full shrink-0'>
											{chat.unread}
										</span>
									)}

									{/* Three-dot menu button — visible on hover (desktop) */}
									<button
										onClick={(e) => handleMenuButtonClick(e, chat)}
										className='hidden md:flex opacity-0 group-hover:opacity-100 p-1 rounded-full hover:bg-white/10 transition-all duration-150 cursor-pointer shrink-0'
										aria-label='Chat menu'>
										<FiMoreVertical className='text-sm text-foreground/50' />
									</button>
								</div>
							</div>
						);
					})
				) : (
					<div className='flex flex-col h-full items-center justify-center text-center px-4 animate-fade-in'>
						<EmptyState
							icon={
								searchQuery ? (
									<FiSearch className='text-4xl' />
								) : (
									<IoChatbubblesOutline className='text-5xl' />
								)
							}
							title='No chats found.'
							description={
								searchQuery
									? "Try searching for something else."
									: "No chats yet."
							}
						/>
					</div>
				)}
			</div>

			{menuData && (
				<ConversationMenu
					chatId={menuData.chat.id}
					isPinned={menuData.chat.isPinned}
					hasUnread={menuData.chat.unread > 0}
					position={{ top: menuData.top, left: menuData.left }}
					onClose={closeMenu}
					onPinToggle={togglePin}
					onMarkRead={markAsRead}
				/>
			)}
		</section>
	);
};

export default ConversationList;
