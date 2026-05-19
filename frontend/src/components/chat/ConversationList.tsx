import { useState, useMemo } from "react";
import { BsPin } from "react-icons/bs";
import { FiPlus, FiSearch } from "react-icons/fi";
import { IoSearchOutline, IoCloseOutline } from "react-icons/io5";
import Input from "../ui/Input";
import PresenceAvatar from "./PresenceAvatar";
import type { ActiveTab } from "@/types";
import EmptyState from "../shared/EmptyState";

interface ConversationListProps {
	onSelectChat: (id: string) => void;
	activeChatId?: string;
	setActiveTab: React.Dispatch<React.SetStateAction<ActiveTab>>;
}

const ConversationList = ({
	onSelectChat,
	activeChatId,
	setActiveTab,
}: ConversationListProps) => {
	const [isSearchOpen, setIsSearchOpen] = useState(false);
	const [searchQuery, setSearchQuery] = useState("");

	const mockChats = [
		{
			id: "1",
			name: "Ann Schleifer",
			image:
				"https://images.unsplash.com/photo-1524502397800-2eeaad7c3fe5?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
			message: "Hey! Did you check out that new...",
			unread: 0,
			isOnline: true,
			typing: false,
			isPinned: true,
			lastUpdated: "10:00 AM",
		},
		{
			id: "2",
			name: "Hussein Saddam",
			image: "",
			message: "Typing...",
			unread: 3,
			isOnline: true,
			typing: true,
			isPinned: true,
			lastUpdated: "9:30 AM",
		},
		{
			id: "3",
			name: "Vladimir Basuki",
			image: "",
			message: "Nice! I have been wanting to...",
			unread: 0,
			isOnline: false,
			typing: false,
			isPinned: false,
			lastUpdated: "9:00 AM",
		},
	];

	const filteredChats = useMemo(() => {
		return mockChats.filter(
			(chat) =>
				chat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
				chat.message.toLowerCase().includes(searchQuery.toLowerCase()),
		);
	}, [searchQuery]);

	const handleCloseSearch = () => {
		// setIsSearchOpen(false);
		setSearchQuery("");
	};

	return (
		<section className='w-full md:w-80 h-full bg-muted/50 flex flex-col'>
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
						onClick={() => setIsSearchOpen(!isSearchOpen)}
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
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
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
				{filteredChats.length > 0 ? (
					filteredChats.map((chat) => {
						const isActive = chat.id === activeChatId;
						return (
							<div
								key={chat.id}
								onClick={() => onSelectChat(chat.id)}
								className={`flex items-center gap-3 p-3 rounded-md cursor-pointer transition-all duration-150 ${
									isActive
										? "bg-[#7556d3]/20 border border-[#7556d3]/30"
										: "border border-transparent hover:bg-white/5"
								}`}>
								<PresenceAvatar
									src={chat.image}
									name={chat.name}
									isOnline={chat.isOnline}
									size='md'
								/>
								<div className='flex-1 min-w-0'>
									<div className='flex items-center justify-between mb-0.5'>
										<h3 className='text-sm font-medium text-white/90 truncate tracking-tight'>
											{chat.name}
										</h3>
									</div>
									<p
										className={`text-xs truncate font-light ${chat.typing ? "text-[#a286f7] font-normal" : "text-foreground/50"}`}>
										{chat.message}
									</p>
									<p
										className={`text-[10px] truncate font-light text-foreground/70 mt-1`}>
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
							icon={<FiSearch className='text-4xl' />}
							title='No chats match your search.'
							description='Try searching for something else.'
						/>
					</div>
				)}
			</div>
		</section>
	);
};

export default ConversationList;
