import useChatStore from "@/store/useChatStore";
import { useCallback, useEffect, useRef, useState } from "react";
import { FiSearch } from "react-icons/fi";
import { IoCloseOutline } from "react-icons/io5";
import { RxPeople } from "react-icons/rx";
import EmptyState from "../shared/EmptyState";
import Input from "../ui/Input";
import { ChatSkeletonLoader } from "./ChatSkeletonLoader";
import PresenceAvatar from "./PresenceAvatar";

interface ContactListProps {
	onSelectChat: (id: string) => void;
}

const DEBOUNCE_MS = 350;

const ContactList = ({ onSelectChat }: ContactListProps) => {
	const [searchQuery, setSearchQuery] = useState("");
	const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
	const sentinelRef = useRef<HTMLDivElement>(null);

	const {
		contacts,
		contactsHasMore,
		isContactsLoading,
		isLoadingMoreContacts,
		getContacts,
		loadMoreContacts,
		setSelectedUser,
	} = useChatStore();

	// Initial load
	useEffect(() => {
		getContacts(1, "");
	}, []);

	// Debounced search — resets to page 1
	const handleSearch = useCallback((value: string) => {
		setSearchQuery(value);
		if (debounceRef.current) clearTimeout(debounceRef.current);
		debounceRef.current = setTimeout(() => {
			getContacts(1, value);
		}, DEBOUNCE_MS);
	}, []);

	// Infinite scroll sentinel
	useEffect(() => {
		if (!sentinelRef.current) return;

		const observer = new IntersectionObserver(
			(entries) => {
				if (
					entries[0].isIntersecting &&
					contactsHasMore &&
					!isLoadingMoreContacts
				) {
					loadMoreContacts(searchQuery);
				}
			},
			{ threshold: 0.1 },
		);

		observer.observe(sentinelRef.current);
		return () => observer.disconnect();
	}, [contactsHasMore, isLoadingMoreContacts, searchQuery]);

	return (
		<section className='w-full md:w-80 h-full bg-muted/30 flex flex-col'>
			<div className='p-4 flex items-center justify-between'>
				<h1 className='text-xl font-bold tracking-tight text-white/90'>
					Contacts
				</h1>
			</div>

			<div className='px-4 mb-4'>
				<div className='relative flex items-center'>
					<Input
						value={searchQuery}
						onChange={(e) => handleSearch(e.target.value)}
						placeholder='Search contacts...'
						type='search'
						className='rounded-full! border-primary/30! border w-full pr-10 text-xs!'
					/>
					{searchQuery && (
						<button
							onClick={() => handleSearch("")}
							className='absolute right-3 p-1 rounded-full hover:bg-white/10 text-foreground/50 hover:text-white transition-colors cursor-pointer'>
							<IoCloseOutline className='text-base' />
						</button>
					)}
				</div>
			</div>

			<div className='flex-1 overflow-y-auto space-y-2 px-2 pb-20 md:pb-4'>
				{isContactsLoading ? (
					<ChatSkeletonLoader count={6} />
				) : contacts.length > 0 ? (
					<>
						{contacts.map((contact) => (
							<div
								key={contact.id}
								onClick={() => {
									onSelectChat(contact.id);
									setSelectedUser(contact);
								}}
								className='flex items-center gap-3 p-3 rounded-md cursor-pointer transition-all duration-300 ease-in-out border border-transparent hover:bg-white/5'>
								<PresenceAvatar
									src={contact.image}
									name={contact.name}
									isOnline={contact.isOnline}
									size='md'
								/>
								<div className='flex-1 min-w-0'>
									<h3 className='text-sm font-medium text-white/90 truncate tracking-tight'>
										{contact.name}
									</h3>
									<p className='text-xs truncate font-light text-foreground/60'>
										@{contact.username}
									</p>
								</div>
							</div>
						))}

						{/* Infinite scroll sentinel */}
						<div ref={sentinelRef} className='py-1'>
							{isLoadingMoreContacts && <ChatSkeletonLoader count={3} />}
						</div>
					</>
				) : (
					<div className='flex flex-col h-full items-center justify-center text-center px-4 animate-fade-in'>
						<EmptyState
							icon={
								searchQuery ? (
									<FiSearch className='text-4xl' />
								) : (
									<RxPeople className='text-5xl' />
								)
							}
							title='No contacts found.'
							description={
								searchQuery
									? "Try checking the spelling or querying another contact."
									: "No contacts yet."
							}
						/>
					</div>
				)}
			</div>
		</section>
	);
};

export default ContactList;
