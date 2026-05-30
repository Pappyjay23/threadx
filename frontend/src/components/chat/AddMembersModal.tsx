import { useAuthStore } from "@/store/useAuthStore";
import useChatStore from "@/store/useChatStore";
import type { ErrorResponse } from "@/types/auth";
import { useCallback, useEffect, useRef, useState } from "react";
import { FiSearch, FiX } from "react-icons/fi";
import { IoCheckmarkOutline } from "react-icons/io5";
import { RxPeople } from "react-icons/rx";
import { toast } from "sonner";
import { ChatSkeletonLoader } from "./ChatSkeletonLoader";
import PresenceAvatar from "./PresenceAvatar";
import Button from "../ui/Button";

interface AddMembersModalProps {
	isOpen: boolean;
	onClose: () => void;
	groupId: string;
	existingMemberIds: string[];
}

const DEBOUNCE_MS = 350;

const AddMembersModal = ({
	isOpen,
	onClose,
	groupId,
	existingMemberIds,
}: AddMembersModalProps) => {
	const {
		contacts,
		contactsHasMore,
		isContactsLoading,
		isLoadingMoreContacts,
		getContacts,
		loadMoreContacts,
		addMembers,
	} = useChatStore();
	const { onlineUsers } = useAuthStore();

	const [selectedIds, setSelectedIds] = useState<string[]>([]);
	const [searchQuery, setSearchQuery] = useState("");
	const [isAdding, setIsAdding] = useState(false);

	const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
	const sentinelRef = useRef<HTMLDivElement>(null);

	const availableContacts = contacts.filter(
		(c) => !existingMemberIds.includes(c.id),
	);

	useEffect(() => {
		if (isOpen) {
			getContacts(1, "");
			setSelectedIds([]);
			setSearchQuery("");
		}
	}, [isOpen, getContacts]);

	const handleSearch = useCallback(
		(value: string) => {
			setSearchQuery(value);
			if (debounceRef.current) clearTimeout(debounceRef.current);
			debounceRef.current = setTimeout(() => {
				getContacts(1, value);
			}, DEBOUNCE_MS);
		},
		[getContacts],
	);

	useEffect(() => {
		if (!sentinelRef.current || !isOpen) return;
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
	}, [
		contactsHasMore,
		isLoadingMoreContacts,
		searchQuery,
		isOpen,
		loadMoreContacts,
	]);

	const toggleContact = (id: string) => {
		setSelectedIds((prev) =>
			prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id],
		);
	};

	const handleAdd = async () => {
		if (selectedIds.length === 0) return;
		setIsAdding(true);
		try {
			await addMembers(groupId, selectedIds);
			toast.success("Members added");
			onClose();
		} catch (error) {
			toast.error((error as ErrorResponse)?.message ?? "Failed to add members");
		} finally {
			setIsAdding(false);
		}
	};

	if (!isOpen) return null;

	return (
		<div
			className='fixed inset-0 z-90 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in'
			onClick={(e) => {
				if (e.target === e.currentTarget) onClose();
			}}>
			<div className='bg-background border border-primary/20 rounded-3xl w-full max-w-md overflow-hidden flex flex-col max-h-[80vh] shadow-2xl'>
				<div className='p-6 border-b border-primary/10 flex items-center justify-between'>
					<div>
						<h2 className='text-lg font-bold text-white'>Add Members</h2>
						<p className='text-xs text-white/40'>
							{selectedIds.length} selected
						</p>
					</div>
					<button
						onClick={onClose}
						className='p-2 hover:bg-white/5 rounded-full text-white/40 hover:text-white transition-colors cursor-pointer'>
						<FiX />
					</button>
				</div>

				<div className='p-4 border-b border-primary/10'>
					<div className='relative flex items-center'>
						<FiSearch className='absolute left-3 text-white/30' />
						<input
							value={searchQuery}
							onChange={(e) => handleSearch(e.target.value)}
							placeholder='Search contacts...'
							className='w-full bg-white/5 border border-primary/20 rounded-xl py-2 pl-10 pr-4 text-xs text-white focus:outline-none focus:border-primary/50 transition-colors'
						/>
					</div>
				</div>

				<div className='flex-1 overflow-y-auto p-4 space-y-1'>
					{isContactsLoading ? (
						<ChatSkeletonLoader count={3} />
					) : availableContacts.length > 0 ? (
						<>
							{availableContacts.map((contact) => {
								const isSelected = selectedIds.includes(contact.id);
								return (
									<div
										key={contact.id}
										onClick={() => toggleContact(contact.id)}
										className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all duration-300 border ${
											isSelected
												? "bg-primary/10 border-primary/30"
												: "border-transparent hover:bg-white/5"
										}`}>
										<PresenceAvatar
											src={contact.image}
											name={contact.name}
											isOnline={onlineUsers.includes(contact.id)}
											size='md'
										/>
										<div className='flex-1 min-w-0'>
											<h3 className='text-sm font-medium text-white/90 truncate'>
												{contact.name}
											</h3>
											<p className='text-xs text-white/40'>
												@{contact.username}
											</p>
										</div>
										<div
											className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all duration-300 ${
												isSelected
													? "bg-primary border-primary text-white"
													: "border-primary/30 bg-transparent"
											}`}>
											<IoCheckmarkOutline className='text-xs' />
										</div>
									</div>
								);
							})}
							<div ref={sentinelRef} className='h-4' />
							{isLoadingMoreContacts && <ChatSkeletonLoader count={1} />}
						</>
					) : (
						<div className='py-8 text-center'>
							<RxPeople className='mx-auto text-2xl text-white/20 mb-2' />
							<p className='text-xs text-white/40'>No contacts to add</p>
						</div>
					)}
				</div>

				<div className='p-4 border-t border-primary/10 flex justify-end gap-3'>
					<Button
						onClick={onClose}
						className='px-4 py-2 rounded text-xs font-medium bg-transparent border border-primary/50 text-white/60 hover:text-white hover:bg-white/5 transition-all cursor-pointer'>
						Cancel
					</Button>
					<Button
						onClick={handleAdd}
						disabled={isAdding || selectedIds.length === 0}
						className={`px-6 py-2 rounded text-xs font-bold transition-all shadow-lg shadow-primary/20 cursor-pointer ${
							isAdding || selectedIds.length === 0
								? "bg-white/5 text-white/20 pointer-events-none"
								: "bg-primary text-white active:scale-95"
						}`}>
						{isAdding ? "Adding..." : "Add"}
					</Button>
				</div>
			</div>
		</div>
	);
};

export default AddMembersModal;
