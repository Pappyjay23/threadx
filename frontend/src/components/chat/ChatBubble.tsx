import useChatStore from "@/store/useChatStore";
import { useState } from "react";
import DeleteConfirmDialog from "./DeleteConfirmDialog";
import HighlightedText from "./HighlightedText";
import ImageLightbox from "./ImageLightbox";
import MessageDropdown from "./MessageDropdown";

interface ChatBubbleProps {
	messageId: string;
	message?: string;
	image?: string;
	isSelf: boolean;
	timestamp: string;
	searchQuery?: string;
	isLastMessage: boolean;
}

const ChatBubble = ({
	messageId,
	message,
	image,
	isSelf,
	timestamp,
	searchQuery = "",
	isLastMessage,
}: ChatBubbleProps) => {
	const { chats, activeChatId, deleteMessage } = useChatStore();
	const chat = chats.find((c) => c.id === activeChatId);
	const [lightboxOpen, setLightboxOpen] = useState(false);
	const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);

	const handleConfirmDelete = async () => {
		await deleteMessage(messageId);
		setConfirmDeleteOpen(false);
	};

	return (
		<>
			<div
				className={`flex w-full ${isSelf ? "justify-end" : "justify-start"} mb-3 px-2`}>
				<div
					className={`max-w-[85%] md:max-w-[70%] group relative flex items-start gap-2 ${isSelf ? "flex-row-reverse" : "flex-row"}`}>
					<div className='flex-1'>
						<p
							className={`text-[10px] font-light text-white/60 mb-1 ${isSelf ? "text-right mr-1" : "text-left ml-1"}`}>
							{!isSelf ? chat?.name : "Me"}
						</p>

						<div
							className={`max-w-xs text-xs shadow-lg overflow-hidden ${
								isSelf
									? "bg-primary/80 text-white rounded-t-lg rounded-bl-lg"
									: "text-white/80 rounded-t-lg rounded-br-lg bg-secondary border border-primary/10"
							}`}>
							{image && (
								<img
									src={image}
									alt='Shared image'
									onClick={() => setLightboxOpen(true)}
									className='w-full max-w-xs object-cover rounded-sm cursor-zoom-in transition-opacity duration-200 hover:opacity-90 select-none'
								/>
							)}
							{message && (
								<div
									className={`py-2 px-4 font-light ${image ? "border-t border-white/10" : ""}`}>
									<span className='whitespace-pre-wrap wrap-break-word'>
										<HighlightedText text={message} query={searchQuery} />
									</span>
								</div>
							)}
						</div>

						<span
							className={`block text-[10px] text-foreground/80 mt-1 ${isSelf ? "text-right mr-1" : "text-left ml-1"}`}>
							{timestamp}
						</span>
					</div>

					{/* Dropdown trigger */}
					<MessageDropdown
						message={message}
						isSelf={isSelf}
						onDelete={() => setConfirmDeleteOpen(true)}
						isLastMessage={isLastMessage}
						hasImage={!!image}
					/>
				</div>
			</div>

			{image && (
				<ImageLightbox
					src={image}
					isOpen={lightboxOpen}
					onClose={() => setLightboxOpen(false)}
				/>
			)}

			<DeleteConfirmDialog
				isOpen={confirmDeleteOpen}
				onConfirm={handleConfirmDelete}
				onCancel={() => setConfirmDeleteOpen(false)}
			/>
		</>
	);
};

export default ChatBubble;
