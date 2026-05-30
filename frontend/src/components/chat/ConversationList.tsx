import { useAuthStore } from "@/store/useAuthStore";
import useChatStore from "@/store/useChatStore";
import type { ActiveTab, Chat } from "@/types/chat";
import { useCallback, useEffect, useRef, useState } from "react";
import { BsPinFill } from "react-icons/bs";
import { FiMoreVertical, FiPlus, FiSearch, FiTrash2 } from "react-icons/fi";
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

import { LuLoader } from "react-icons/lu";
import { MdGroupAdd } from "react-icons/md";
import CreateGroupModal from "./CreateGroupModal";

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
	const [isCreateGroupModalOpen, setIsCreateGroupModalOpen] = useState(false);
	const [isDeleting, setIsDeleting] = useState(false);
	const [searchQuery, setSearchQuery] = useState("");
	const searchRef = useRef<HTMLInputElement | null>(null);
	const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
	const [deleteConfirm, setDeleteConfirm] = useState<{
		chatId: string;
		chatName: string;
		isGroup: boolean;
	} | null>(null);

	const [menuData, setMenuData] = useState<{
		chat: Chat;
		top: number;
		left: number;
	} | null>(null);
	const longPressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
	const isLongPressActive = useRef(false);
	const longPressTarget = useRef<Chat | null>(null);

	const { onlineUsers, user } = useAuthStore();
	const {
		chats,
		setSelectedChat,
		getChatPartners,
		isChatsLoading,
		togglePin,
		markAsRead,
		deleteDirectChat,
		leaveGroup,
		deleteGroup,
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
		setSelectedChat(chat);
	};

	return (
		<section className='w-full md:w-80 h-full bg-muted/30 flex flex-col relative'>
			<div className='p-4 flex items-center justify-between'>
				<h1 className='text-xl font-bold tracking-tight text-white/90'>
					Chats
				</h1>
				<div className='flex items-center gap-2'>
					<button
						onClick={() => setIsCreateGroupModalOpen(true)}
						title='New Group'
						className='p-2 text-foreground border border-transparent hover:border-primary/50 rounded-full hover:bg-white/5 transition-all duration-500 ease-in-out cursor-pointer'>
						<MdGroupAdd className='text-lg' />
					</button>
					<button
						onClick={() => setActiveTab("contacts")}
						title='New Chat'
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
						const isActive =
							chat.id === activeChatId ||
							(chat.type === "direct" && chat.partnerId === activeChatId);
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
									isOnline={
										chat.type === "direct" && chat.partnerId
											? onlineUsers.includes(chat.partnerId)
											: false
									}
									size='md'
								/>
								<div className='flex-1 min-w-0'>
									<h3 className='text-sm font-medium text-white/90 truncate tracking-tight flex items-center gap-1.5 capitalize'>
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

								<div className='flex items-center gap-1 shrink-0'>
									<div className='flex flex-col items-end gap-1.5'>
										<span className='text-[10px] text-primary/90'>
											{chat.lastUpdated}
										</span>
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
					isGroup={menuData.chat.type === "group"}
					position={{ top: menuData.top, left: menuData.left }}
					onClose={closeMenu}
					onPinToggle={togglePin}
					onMarkRead={markAsRead}
					onDelete={(chatId) => {
						closeMenu();
						const chat = chats.find((c) => c.id === chatId);
						if (chat) {
							setDeleteConfirm({
								chatId,
								chatName: chat.name,
								isGroup: chat.type === "group",
							});
						}
					}}
				/>
			)}

			<CreateGroupModal
				isOpen={isCreateGroupModalOpen}
				onClose={() => setIsCreateGroupModalOpen(false)}
			/>

			{deleteConfirm && (
				<div
					className='fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in'
					onClick={(e) => {
						if (e.target === e.currentTarget && !isDeleting)
							setDeleteConfirm(null);
					}}>
					<div className='bg-background border border-primary/20 rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl'>
						<div className='p-6 text-center'>
							<div className='mx-auto w-12 h-12 rounded-full bg-red-400/10 flex items-center justify-center mb-4'>
								<FiTrash2 className='text-red-400 text-xl' />
							</div>
							<h3 className='text-lg font-bold text-white mb-2'>
								{deleteConfirm.isGroup ? "Delete Group" : "Delete Chat"}
							</h3>
							<p className='text-xs text-white/50 leading-relaxed'>
								Are you sure you want to delete{" "}
								<span className='text-white/80 font-medium'>
									{deleteConfirm.chatName}
								</span>
								?
								{deleteConfirm.isGroup
									? " This will remove the group and all messages for everyone."
									: " This will delete all messages in this conversation."}{" "}
								This action cannot be undone.
							</p>
						</div>
						<div className='border-t border-primary/10 flex'>
							<button
								onClick={() => setDeleteConfirm(null)}
								disabled={isDeleting}
								className='flex-1 px-4 py-3 text-xs font-medium text-white/60 hover:text-white hover:bg-white/5 transition-colors cursor-pointer disabled:opacity-50'>
								Cancel
							</button>
							<button
								onClick={async () => {
									setIsDeleting(true);
									if (deleteConfirm.isGroup) {
										const chat = chats.find(
											(c) => c.id === deleteConfirm.chatId,
										);
										if (chat?.admin === user?._id) {
											await deleteGroup(deleteConfirm.chatId);
										} else {
											await leaveGroup(deleteConfirm.chatId);
										}
									} else {
										await deleteDirectChat(deleteConfirm.chatId);
									}
									setIsDeleting(false);
									setDeleteConfirm(null);
								}}
								disabled={isDeleting}
								className='flex-1 px-4 py-3 text-xs font-bold text-red-400 hover:text-red-300 border-l border-primary/10 hover:bg-red-400/5 transition-colors cursor-pointer disabled:opacity-50'>
								{isDeleting ? (
									<span className='flex items-center justify-center gap-2'>
										Deleting
										<LuLoader className='animate-spin h-3.5 w-3.5' />
									</span>
								) : (
									"Delete"
								)}
							</button>
						</div>
					</div>
				</div>
			)}
		</section>
	);
};

export default ConversationList;
