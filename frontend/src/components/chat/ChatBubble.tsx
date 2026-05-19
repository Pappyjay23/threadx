import useChatStore from "@/store/useChatStore";

interface ChatBubbleProps {
	message: string;
	isSelf: boolean;
	timestamp: string;
}

const ChatBubble = ({ message, isSelf, timestamp }: ChatBubbleProps) => {
	const { chats, activeChatId } = useChatStore();
	const chat = chats.find((c) => c.id === activeChatId);

	return (
		<div
			className={`flex w-full ${isSelf ? "justify-end" : "justify-start"} mb-3 px-2`}>
			<div
				className={`max-w-[85%] md:max-w-[70%] ${isSelf ? "order-1" : "order-2"}`}>
				<p className={`text-[10px] font-light text-white/60 mb-1 ${isSelf ? "text-right mr-1" : "text-left ml-1"}`}>
					{!isSelf ? chat?.name : "Me"}
				</p>

				<div
					className={`text-xs py-2 px-4 font-light shadow-lg ${
						isSelf
							? "bg-primary/80 text-white rounded-t-lg rounded-bl-lg"
							: "text-white/80 rounded-t-lg rounded-br-lg bg-secondary border border-primary/10"
					}`}>
					{message}
				</div>
				<span
					className={`block text-[10px] text-foreground/80 mt-1 ${isSelf ? "text-right mr-1" : "text-left ml-1"}`}>
					{timestamp}
				</span>
			</div>
		</div>
	);
};

export default ChatBubble;
