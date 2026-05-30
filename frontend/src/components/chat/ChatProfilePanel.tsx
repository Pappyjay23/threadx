import { useEffect, useRef, useState } from "react";
import { FiMail, FiUserPlus, FiX, FiTrash2 } from "react-icons/fi";
import { LuUser } from "react-icons/lu";
import { IoExitOutline } from "react-icons/io5";
import PresenceAvatar from "./PresenceAvatar";
import { MdCardMembership } from "react-icons/md";
import type { Chat } from "@/types/chat";
import useChatStore from "@/store/useChatStore";
import { useAuthStore } from "@/store/useAuthStore";
import { toast } from "sonner";
import type { ErrorResponse } from "@/types/auth";
import AddMembersModal from "./AddMembersModal";

interface ChatProfilePanelProps {
	isOpen: boolean;
	onClose: () => void;
	chat?: Chat | null;
}

const ChatProfilePanel = ({ isOpen, onClose, chat }: ChatProfilePanelProps) => {
	const panelRef = useRef<HTMLDivElement>(null);
	const { user } = useAuthStore();
	const { deleteGroup, leaveGroup, removeMember } = useChatStore();
	const [showAddMembers, setShowAddMembers] = useState(false);
	const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
	const [isDeleting, setIsDeleting] = useState(false);

	const isGroup = chat?.type === "group";
	const isAdmin = isGroup && chat?.admin === user?._id;
	const isOnline = !isGroup && chat?.isOnline === true;

	useEffect(() => {
		if (!isOpen) return;

		const handleClickOutside = (e: MouseEvent) => {
			if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
				onClose();
			}
		};

		const timer = setTimeout(() => {
			document.addEventListener("mousedown", handleClickOutside);
		}, 10);

		return () => {
			clearTimeout(timer);
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, [isOpen, onClose]);

	const handleLeaveGroup = async () => {
		if (!chat?.id) return;
		try {
			await leaveGroup(chat.id);
			onClose();
		} catch (error) {
			toast.error((error as ErrorResponse)?.message ?? "Failed to leave group");
		}
	};

	const handleDeleteGroup = async () => {
		if (!chat?.id) return;
		setIsDeleting(true);
		try {
			await deleteGroup(chat.id);
			setShowDeleteConfirm(false);
			onClose();
		} catch (error) {
			toast.error(
				(error as ErrorResponse)?.message ?? "Failed to delete group",
			);
		} finally {
			setIsDeleting(false);
		}
	};

	const handleRemoveMember = async (memberId: string) => {
		if (!chat?.id) return;
		try {
			await removeMember(chat.id, memberId);
		} catch (error) {
			toast.error(
				(error as ErrorResponse)?.message ?? "Failed to remove member",
			);
		}
	};

	return (
		<>
			<div
				className={`absolute inset-0 z-30 bg-black/40 backdrop-blur-[2px] transition-opacity duration-300 ${
					isOpen
						? "opacity-100 pointer-events-auto"
						: "opacity-0 pointer-events-none"
				}`}
			/>

			<div
				ref={panelRef}
				className={`absolute top-0 right-0 z-40 h-full w-full sm:w-85 bg-background-noise border-l border-primary/10 backdrop-blur-xl flex flex-col transition-transform duration-300 ease-in-out ${
					isOpen ? "translate-x-0" : "translate-x-full"
				}`}>
				<div className='flex items-center justify-between py-2 px-4 border-b border-primary/10'>
					<h3 className='text-sm font-semibold text-white/90 tracking-wide'>
						{isGroup ? "Group Info" : "Profile"}
					</h3>
					<button
						onClick={onClose}
						className='p-2 text-foreground/60 border border-transparent hover:border-primary/50 rounded-full hover:bg-white/5 transition-all duration-300 cursor-pointer'
						aria-label='Close profile panel'>
						<FiX className='h-4 w-4' />
					</button>
				</div>

				<div className='flex-1 overflow-y-auto'>
					{/* Avatar and Name Section */}
					<div className='flex flex-col items-center pt-8 pb-6 px-6 border-b border-primary/10'>
						<PresenceAvatar
							isOnline={isOnline}
							size='lg'
							src={chat?.image}
							name={chat?.name}
						/>
						<h2 className='mt-4 text-lg font-semibold text-white/90 text-center capitalize'>
							{chat?.name ?? "ThreadX User"}
						</h2>
						<span
							className={`mt-1 text-xs font-light tracking-wide ${
								isOnline ? "text-[#10b981]" : "text-white/40"
							}`}>
							{isGroup
								? `${chat?.members?.length || 0} members`
								: isOnline
									? "Online"
									: "Offline"}
						</span>
					</div>

					{/* Details Section (Direct Chat only) */}
					{!isGroup && (
						<div className='px-6 py-5 border-b border-primary/10 space-y-4'>
							<h4 className='text-[10px] font-semibold text-foreground/80 uppercase tracking-widest mb-2'>
								Details
							</h4>

							{chat?.email && (
								<div className='flex items-center gap-3'>
									<div className='p-2 rounded-full border border-primary/20 bg-primary/5'>
										<FiMail className='h-3.5 w-3.5 text-primary/60' />
									</div>
									<div>
										<p className='text-[10px] text-foreground/40'>Email</p>
										<p className='text-xs text-white/70'>{chat.email}</p>
									</div>
								</div>
							)}

							{chat?.username && (
								<div className='flex items-center gap-3'>
									<div className='p-2 rounded-full border border-primary/20 bg-primary/5'>
										<LuUser className='h-3.5 w-3.5 text-primary/60' />
									</div>
									<div>
										<p className='text-[10px] text-foreground/40'>Username</p>
										<p className='text-xs text-white/70'>@{chat.username}</p>
									</div>
								</div>
							)}

							<div className='flex items-center gap-3'>
								<div className='p-2 rounded-full border border-primary/20 bg-primary/5'>
									<MdCardMembership className='h-3.5 w-3.5 text-primary/60' />
								</div>
								<div>
									<p className='text-[10px] text-foreground/40'>Joined</p>
									<p className='text-xs text-white/70'>
										{chat?.dateJoined ?? "—"}
									</p>
								</div>
							</div>
						</div>
					)}

					{/* Group Members Section */}
					{isGroup && (
						<div className='px-6 py-5 border-b border-primary/10 space-y-3'>
							<div className='flex items-center justify-between'>
								<h4 className='text-[10px] font-semibold text-foreground/80 uppercase tracking-widest'>
									Members ({chat?.members?.length || 0})
								</h4>
								{isAdmin && (
									<button
										onClick={() => setShowAddMembers(true)}
										className='text-[10px] text-primary/70 hover:text-primary transition-colors cursor-pointer flex items-center gap-1'>
										<FiUserPlus className='text-xs' />
										Add
									</button>
								)}
							</div>

							<div className='space-y-1 max-h-60 overflow-y-auto'>
								{chat?.members?.map((member) => (
									<div
										key={member.id}
										className='flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors'>
										<PresenceAvatar
											src={member.image}
											name={member.name}
											size='sm'
											isOnline={false}
										/>
										<div className='flex-1 min-w-0'>
											<p className='text-xs text-white/80 truncate capitalize'>
												{member.name}
												{member.id === chat.admin && (
													<span className='text-[10px] text-primary/60 ml-1.5 font-medium'>
														Admin
													</span>
												)}
											</p>
										</div>
										{isAdmin && member.id !== user?._id && (
											<button
												onClick={() => handleRemoveMember(member.id)}
												className='p-1 text-white/20 hover:text-red-400 transition-colors cursor-pointer'
												aria-label={`Remove ${member.name}`}>
												<FiX className='text-xs' />
											</button>
										)}
									</div>
								))}
							</div>
						</div>
					)}

					{/* Group Actions */}
					{isGroup && (
						<div className='px-6 py-5 space-y-3'>
							{isAdmin && (
								<button
									onClick={() => setShowAddMembers(true)}
									className='w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-full text-xs font-medium text-primary/70 hover:text-primary border border-primary/20 hover:border-primary/40 hover:bg-primary/5 transition-all cursor-pointer'>
									<FiUserPlus className='text-sm' />
									Add Members
								</button>
							)}
							{isAdmin ? (
								<button
									onClick={() => setShowDeleteConfirm(true)}
									className='w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-full text-xs font-medium text-red-400 hover:text-red-300 border border-red-400/20 hover:border-red-400/40 hover:bg-red-400/5 transition-all cursor-pointer'>
									<FiTrash2 className='text-sm' />
									Delete Group
								</button>
							) : (
								<button
									onClick={handleLeaveGroup}
									className='w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-full text-xs font-medium text-red-400 hover:text-red-300 border border-red-400/20 hover:border-red-400/40 hover:bg-red-400/5 transition-all cursor-pointer'>
									<IoExitOutline className='text-sm' />
									Leave Group
								</button>
							)}
						</div>
					)}
				</div>
			</div>

			{showAddMembers && (
				<AddMembersModal
					isOpen={showAddMembers}
					onClose={() => setShowAddMembers(false)}
					groupId={chat?.id || ""}
					existingMemberIds={chat?.members?.map((m) => m.id) || []}
				/>
			)}

			{/* Delete Confirmation Modal */}
			{showDeleteConfirm && (
				<div
					className='fixed inset-0 z-90 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in'
					onClick={(e) => {
						if (e.target === e.currentTarget && !isDeleting)
							setShowDeleteConfirm(false);
					}}>
					<div className='bg-background border border-primary/20 rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl'>
						<div className='p-6 text-center'>
							<div className='mx-auto w-12 h-12 rounded-full bg-red-400/10 flex items-center justify-center mb-4'>
								<FiTrash2 className='text-red-400 text-xl' />
							</div>
							<h3 className='text-lg font-bold text-white mb-2'>
								Delete Group
							</h3>
							<p className='text-xs text-white/50 leading-relaxed'>
								Are you sure you want to delete{" "}
								<span className='text-white/80 font-medium'>{chat?.name}</span>?
								This will remove the group and all messages for everyone. This
								action cannot be undone.
							</p>
						</div>
						<div className='border-t border-primary/10 flex'>
							<button
								onClick={() => setShowDeleteConfirm(false)}
								disabled={isDeleting}
								className='flex-1 px-4 py-3 text-xs font-medium text-white/60 hover:text-white hover:bg-white/5 transition-colors cursor-pointer'>
								Cancel
							</button>
							<button
								onClick={handleDeleteGroup}
								disabled={isDeleting}
								className='flex-1 px-4 py-3 text-xs font-bold text-red-400 hover:text-red-300 border-l border-primary/10 hover:bg-red-400/5 transition-colors cursor-pointer disabled:opacity-50'>
								{isDeleting ? "Deleting..." : "Delete"}
							</button>
						</div>
					</div>
				</div>
			)}
		</>
	);
};

export default ChatProfilePanel;
