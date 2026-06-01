import type { Message, PopulatedSender } from "@/types/chat";
import useChatStore from "@/store/useChatStore";
import { useState } from "react";
import DeleteConfirmDialog from "./DeleteConfirmDialog";
import HighlightedText from "./HighlightedText";
import ImageLightbox from "./ImageLightbox";
import MessageDropdown from "./MessageDropdown";
import LazyImage from "./LazyImage";


interface ChatBubbleProps {
	message: Message;
	isSelf: boolean;
	searchQuery?: string;
	isLastMessage: boolean;
}

const ChatBubble = ({
	message,
	isSelf,
	searchQuery = "",
	isLastMessage,
}: ChatBubbleProps) => {
	const { deleteMessage, setReplyingTo } = useChatStore();
	const [lightboxOpen, setLightboxOpen] = useState(false);
	const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);

	const handleConfirmDelete = async () => {
		await deleteMessage(message._id);
		setConfirmDeleteOpen(false);
	};

	const scrollToMessage = (targetId: string) => {
		const element = document.getElementById(`msg-${targetId}`);
		if (element) {
			element.scrollIntoView({ behavior: "smooth", block: "center" });
			element.classList.add("highlight-pulse");
			setTimeout(() => element.classList.remove("highlight-pulse"), 2000);
		}
	};

	const sender = message.senderId as unknown as PopulatedSender;
	const senderName = isSelf
		? "Me"
		: sender?.firstName
			? `${sender.firstName}${sender.lastName ? ` ${sender.lastName}` : ""}`
			: "User";

	const timestamp = new Date(message.createdAt).toLocaleTimeString([], {
		hour: "2-digit",
		minute: "2-digit",
	});

	return (
		<>
			<div
				id={`msg-${message._id}`}
				className={`flex w-full ${isSelf ? "justify-end" : "justify-start"} mb-3 px-2 transition-colors duration-500`}>
				<div
					className={`max-w-[85%] md:max-w-[70%] group relative flex items-start gap-2 ${isSelf ? "flex-row-reverse" : "flex-row"}`}>
					<div className='flex-1 min-w-0'>
						<p
							className={`text-[10px] font-light text-white/40 mb-1 ${isSelf ? "text-right mr-1" : "text-left ml-1"} capitalize`}>
							{senderName}
						</p>

						<div
							data-bubble='true'
							className={`max-w-xs text-xs shadow-lg overflow-hidden flex flex-col ${
								isSelf
									? "bg-primary/60 text-white rounded-t-lg rounded-bl-lg"
									: "text-white/80 rounded-t-lg rounded-br-lg bg-secondary border border-primary/10"
							}`}>
							{/* Reply Preview */}
							{message.replyTo && (
								<div
									onClick={() =>
										message.replyTo && scrollToMessage(message.replyTo._id)
									}
									className={`mx-2 mt-2 mb-1 p-2 rounded bg-black/20 border-l-4 border-primary/50 cursor-pointer hover:bg-black/30 transition-colors flex flex-col gap-1`}>
									<span className='text-[10px] font-bold text-primary/90 capitalize'>
										{typeof message.replyTo.senderId === "object"
											? (message.replyTo.senderId as PopulatedSender).firstName
											: "User"}
									</span>
									<p className='text-[10px] text-white/60 line-clamp-2 italic'>
										{message.replyTo.text ||
											(message.replyTo.image ? "📷 Image" : "Message")}
									</p>
								</div>
							)}

							{message.image && (
								<LazyImage
									src={message.image}
									alt='Shared image'
									onClick={() => setLightboxOpen(true)}
									className='w-full max-w-xs rounded-sm cursor-zoom-in transition-opacity duration-200 hover:opacity-90 select-none'
								/>
							)}
							{message.text && (
								<div
									className={`py-2 px-4 font-light select-text ${
										message.image ? "border-t border-white/10" : ""
									}`}>
									<HighlightedText text={message.text} query={searchQuery} />
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
						message={message.text}
						isSelf={isSelf}
						onDelete={() => setConfirmDeleteOpen(true)}
						onReply={() => setReplyingTo(message)}
						isLastMessage={isLastMessage}
						hasImage={!!message.image}
					/>
				</div>
			</div>

			{message.image && (
				<ImageLightbox
					src={message.image}
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
