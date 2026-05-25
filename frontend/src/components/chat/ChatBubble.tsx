import useChatStore from "@/store/useChatStore";
import { useState } from "react";
import HighlightedText from "./HighlightedText";
import ImageLightbox from "./ImageLightbox";

interface ChatBubbleProps {
	message?: string;
	image?: string;
	isSelf: boolean;
	timestamp: string;
	searchQuery?: string;
}

const ChatBubble = ({
	message,
	image,
	isSelf,
	timestamp,
	searchQuery = "",
}: ChatBubbleProps) => {
	const { chats, activeChatId } = useChatStore();
	const chat = chats.find((c) => c.id === activeChatId);
	const [lightboxOpen, setLightboxOpen] = useState(false);

	return (
		<>
			<div
				className={`flex w-full ${isSelf ? "justify-end" : "justify-start"} mb-3 px-2`}>
				<div
					className={`max-w-[85%] md:max-w-[70%] ${isSelf ? "order-1" : "order-2"}`}>
					<p
						className={`text-[10px] font-light text-white/60 mb-1 ${isSelf ? "text-right mr-1" : "text-left ml-1"}`}>
						{!isSelf ? chat?.name : "Me"}
					</p>

					<div
						className={`text-xs shadow-lg overflow-hidden ${
							isSelf
								? "bg-primary/80 text-white rounded-t-lg rounded-bl-lg"
								: "text-white/80 rounded-t-lg rounded-br-lg bg-secondary border border-primary/10"
						}`}>
						{image && (
							<img
								src={image}
								alt='Shared image'
								onClick={() => setLightboxOpen(true)}
								className='w-full max-w-xs object-cover rounded-sm cursor-zoom-in transition-opacity duration-200 hover:opacity-90'
							/>
						)}
						{message && (
							<p
								className={`py-2 px-4 font-light ${image ? "border-t border-white/10" : ""}`}>
								<HighlightedText text={message} query={searchQuery} />
							</p>
						)}
					</div>

					<span
						className={`block text-[10px] text-foreground/80 mt-1 ${isSelf ? "text-right mr-1" : "text-left ml-1"}`}>
						{timestamp}
					</span>
				</div>
			</div>

			{image && (
				<ImageLightbox
					src={image}
					isOpen={lightboxOpen}
					onClose={() => setLightboxOpen(false)}
				/>
			)}
		</>
	);
};

export default ChatBubble;
