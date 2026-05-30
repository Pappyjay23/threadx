import { axiosInstance } from "@/config/axios";
import { useAuthStore } from "@/store/useAuthStore";
import useChatStore from "@/store/useChatStore";
import type { ErrorResponse } from "@/types/auth";
import type { Contact } from "@/types/chat";
import { useCallback, useEffect, useRef, useState } from "react";
import { FiCamera, FiSearch, FiX } from "react-icons/fi";
import { ImSpinner3 } from "react-icons/im";
import { IoCheckmarkOutline, IoCloseOutline } from "react-icons/io5";
import { RxPeople } from "react-icons/rx";
import { toast } from "sonner";
import Input from "../ui/Input";
import { ChatSkeletonLoader } from "./ChatSkeletonLoader";
import PresenceAvatar from "./PresenceAvatar";
import Button from "../ui/Button";

interface CreateGroupModalProps {
	isOpen: boolean;
	onClose: () => void;
}

const DEBOUNCE_MS = 350;

const CreateGroupModal = ({ isOpen, onClose }: CreateGroupModalProps) => {
	const {
		contacts,
		contactsHasMore,
		isContactsLoading,
		isLoadingMoreContacts,
		getContacts,
		loadMoreContacts,
		createGroup,
	} = useChatStore();
	const { onlineUsers } = useAuthStore();

	const [groupName, setGroupName] = useState("");
	const [selectedParticipants, setSelectedParticipants] = useState<Contact[]>(
		[],
	);
	const [searchQuery, setSearchQuery] = useState("");
	const [isCreating, setIsCreating] = useState(false);
	const [groupAvatar, setGroupAvatar] = useState<string | null>(null);
	const [isUploading, setIsUploading] = useState(false);

	const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
	const sentinelRef = useRef<HTMLDivElement>(null);
	const fileInputRef = useRef<HTMLInputElement>(null);

	useEffect(() => {
		if (isOpen) {
			getContacts(1, "");
			setGroupName("");
			setSelectedParticipants([]);
			setSearchQuery("");
			setGroupAvatar(null);
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

	const toggleParticipant = (contact: Contact) => {
		setSelectedParticipants((prev) =>
			prev.find((p) => p.id === contact.id)
				? prev.filter((p) => p.id !== contact.id)
				: [...prev, contact],
		);
	};

	const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;

		if (file.size > 5 * 1024 * 1024) {
			toast.error("Image must be less than 5MB");
			return;
		}
		if (!file.type.startsWith("image/")) {
			toast.error("File must be an image");
			return;
		}

		setIsUploading(true);
		try {
			const { data } = await axiosInstance.get(
				"/messages/upload-group-avatar-signature",
			);
			const { timestamp, signature, cloudName, apiKey, folder } = data;

			const formData = new FormData();
			formData.append("file", file);
			formData.append("timestamp", String(timestamp));
			formData.append("signature", signature);
			formData.append("api_key", apiKey);
			formData.append("folder", folder);

			const cloudinaryRes = await fetch(
				`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
				{ method: "POST", body: formData },
			);

			if (!cloudinaryRes.ok) throw new Error("Failed to upload image");

			const cloudinaryData = await cloudinaryRes.json();
			setGroupAvatar(cloudinaryData.secure_url);
		} catch {
			toast.error("Failed to upload image");
		} finally {
			setIsUploading(false);
		}
	};

	const handleCreateGroup = async () => {
		if (!groupName.trim()) {
			toast.error("Please enter a group name");
			return;
		}
		if (selectedParticipants.length === 0) {
			toast.error("Please select at least one participant");
			return;
		}

		setIsCreating(true);
		try {
			await createGroup(
				groupName,
				selectedParticipants.map((p) => p.id),
				groupAvatar || undefined,
			);
			onClose();
		} catch (error) {
			toast.error(
				(error as ErrorResponse)?.message || "Failed to create group",
			);
		} finally {
			setIsCreating(false);
		}
	};

	if (!isOpen) return null;

	return (
		<div
			className='fixed inset-0 z-90 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in'
			onClick={(e) => {
				if (e.target === e.currentTarget) onClose();
			}}>
			<div className='bg-background border border-primary/20 rounded-3xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh] shadow-2xl'>
				{/* Header */}
				<div className='p-6 border-b border-primary/10 flex items-center justify-between bg-workspace-noise'>
					<div>
						<h2 className='text-lg font-bold text-white'>New Group</h2>
						<p className='text-xs text-white/40'>
							Select participants and name your group
						</p>
					</div>
					<button
						onClick={onClose}
						className='p-2 hover:bg-white/5 rounded-full text-white/40 hover:text-white transition-colors cursor-pointer'>
						<FiX />
					</button>
				</div>

				<div className='flex-1 overflow-y-auto p-6 space-y-6'>
					{/* Group Info Section */}
					<div className='flex gap-4 items-center'>
						<input
							type='file'
							ref={fileInputRef}
							onChange={handleAvatarUpload}
							accept='image/*'
							className='hidden'
						/>
						<button
							type='button'
							onClick={() => fileInputRef.current?.click()}
							disabled={isUploading}
							className='relative group shrink-0'>
							{groupAvatar ? (
								<img
									src={groupAvatar}
									alt='Group avatar'
									className='w-16 h-16 rounded-2xl object-cover border-2 border-primary/30'
								/>
							) : (
								<div className='w-16 h-16 rounded-2xl bg-primary/10 border-2 border-dashed border-primary/30 flex items-center justify-center text-primary/40 group-hover:border-primary/60 group-hover:text-primary transition-all duration-300 cursor-pointer overflow-hidden'>
									{isUploading ? (
										<ImSpinner3 className='animate-spin text-primary/60 text-xl' />
									) : (
										<FiCamera className='text-xl' />
									)}
								</div>
							)}
							{groupAvatar && !isUploading && (
								<div className='absolute inset-0 rounded-2xl bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center'>
									<FiCamera className='text-white text-sm' />
								</div>
							)}
						</button>
						<div className='flex-1'>
							<p className='text-xs font-medium text-white/60 mb-1.5 ml-1'>
								Group Name
							</p>
							<Input
								placeholder='Enter group name...'
								value={groupName}
								onChange={(e) => setGroupName(e.target.value)}
								className='bg-white/5! border-primary/20!'
							/>
						</div>
					</div>

					{/* Selected Participants Chips */}
					{selectedParticipants.length > 0 && (
						<div className='flex flex-wrap gap-2'>
							{selectedParticipants.map((p) => (
								<div
									key={p.id}
									className='flex items-center gap-1 bg-primary/10 border border-primary/30 rounded-full pl-1 pr-2 py-0.5 animate-scale-in'>
									<PresenceAvatar
										name={p.name}
										src={p.image}
										size='sm'
										isOnline={false}
									/>
									<span className='text-[10px] font-medium text-white/90 capitalize'>
										{p.name.split(" ")[0]}
									</span>
									<button
										onClick={() => toggleParticipant(p)}
										className='text-white/40 hover:text-white transition-colors cursor-pointer'>
										<IoCloseOutline className='text-xs' />
									</button>
								</div>
							))}
						</div>
					)}

					{/* Search & List Section */}
					<div className='space-y-4'>
						<div className='relative flex items-center'>
							<FiSearch className='absolute left-3 text-white/30' />
							<input
								value={searchQuery}
								onChange={(e) => handleSearch(e.target.value)}
								placeholder='Search contacts...'
								className='w-full bg-white/5 border border-primary/20 rounded-xl py-2 pl-10 pr-4 text-xs text-white focus:outline-none focus:border-primary/50 transition-colors'
							/>
						</div>

						<div className='space-y-1 max-h-60 overflow-y-auto pr-1'>
							{isContactsLoading ? (
								<ChatSkeletonLoader count={3} />
							) : contacts.length > 0 ? (
								<>
									{contacts.map((contact) => {
										const isSelected = selectedParticipants.some(
											(p) => p.id === contact.id,
										);
										return (
											<div
												key={contact.id}
												onClick={() => toggleParticipant(contact)}
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
													<h3 className='text-sm font-medium text-white/90 truncate capitalize'>
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
															: "border-primary/30 bg-transparent text-transparent"
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
									<p className='text-xs text-white/40'>No contacts found</p>
								</div>
							)}
						</div>
					</div>
				</div>

				{/* Footer */}
				<div className='p-6 bg-workspace-noise border-t border-primary/10 flex justify-end gap-3'>
					<Button
						onClick={onClose}
						className='px-4 py-2 rounded text-xs font-medium bg-transparent border border-primary/50 text-white/60 hover:text-white hover:bg-white/5 transition-all cursor-pointer'>
						Cancel
					</Button>
					<Button
						onClick={handleCreateGroup}
						disabled={
							isCreating ||
							!groupName.trim() ||
							selectedParticipants.length === 0
						}
						className={`px-6 py-2 rounded text-xs font-bold transition-all shadow-lg shadow-primary/20 cursor-pointer ${
							isCreating ||
							!groupName.trim() ||
							selectedParticipants.length === 0
								? "bg-white/5 text-white/20 pointer-events-none"
								: "bg-primary text-white active:scale-95"
						}`}>
						{isCreating ? "Creating..." : "Create Group"}
					</Button>
				</div>
			</div>
		</div>
	);
};

export default CreateGroupModal;
