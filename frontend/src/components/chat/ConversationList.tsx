import useChatStore from "@/store/useChatStore";
import type { ActiveTab } from "@/types/chat";
import { useCallback, useEffect, useRef, useState } from "react";
import { BsPin } from "react-icons/bs";
import { FiPlus, FiSearch } from "react-icons/fi";
import {
	IoChatbubblesOutline,
	IoCloseOutline,
	IoSearchOutline,
} from "react-icons/io5";
import EmptyState from "../shared/EmptyState";
import Input from "../ui/Input";
import { ChatSkeletonLoader } from "./ChatSkeletonLoader";
import PresenceAvatar from "./PresenceAvatar";
import { useAuthStore } from "@/store/useAuthStore";

interface ConversationListProps {
	onSelectChat: (id: string) => void;
	activeChatId?: string;
	setActiveTab: React.Dispatch<React.SetStateAction<ActiveTab>>;
}

const DEBOUNCE_MS = 350;

const ConversationList = ({
	onSelectChat,
	activeChatId,
	setActiveTab,
}: ConversationListProps) => {
	const [isSearchOpen, setIsSearchOpen] = useState(false);
	const [searchQuery, setSearchQuery] = useState("");
	const searchRef = useRef<HTMLInputElement | null>(null);
	const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

	const { onlineUsers } = useAuthStore();
	const { chats, setSelectedUser, getChatPartners, isChatsLoading } =
		useChatStore();

	useEffect(() => {
		getChatPartners("");
	}, []);

	const handleSearch = useCallback((value: string) => {
		setSearchQuery(value);
		if (debounceRef.current) clearTimeout(debounceRef.current);
		debounceRef.current = setTimeout(() => {
			getChatPartners(value);
		}, DEBOUNCE_MS);
	}, []);

	const handleCloseSearch = () => {
		setSearchQuery("");
		getChatPartners("");
	};

	return (
		<section className='w-full md:w-80 h-full bg-muted/30 flex flex-col'>
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
				) : chats.length > 0 ? (
					chats.map((chat) => {
						const isActive = chat.id === activeChatId;
						return (
							<div
								key={chat.id}
								onClick={() => {
									onSelectChat(chat.id);
									setSelectedUser(chat);
								}}
								className={`flex items-center gap-3 p-3 rounded-md cursor-pointer transition-all duration-150 ${
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
									<h3 className='text-sm font-medium text-white/90 truncate tracking-tight'>
										{chat.name}
									</h3>
									<p
										title={chat.typing ? "Typing..." : chat.message}
										className={`text-xs truncate font-light ${chat.typing ? "text-primary font-normal" : "text-foreground/50"}`}>
										{chat.typing ? "Typing..." : chat.message}
									</p>
									<p className='text-[10px] truncate font-light text-foreground/70 mt-1'>
										{chat.lastUpdated}
									</p>
								</div>
								{chat.isPinned && (
									<BsPin className='text-sm text-foreground/70 mr-1 shrink-0' />
								)}
								{chat.unread > 0 && (
									<span className='h-5 min-w-5 px-1 flex items-center justify-center bg-[#7556d3] text-white text-[10px] font-bold rounded-full shrink-0'>
										{chat.unread}
									</span>
								)}
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
		</section>
	);
};

export default ConversationList;
