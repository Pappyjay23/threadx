interface ChatBubbleProps {
	message: string;
	isSelf: boolean;
	timestamp: string;
}

const ChatBubble = ({ message, isSelf, timestamp }: ChatBubbleProps) => {
	return (
		<div
			className={`flex w-full ${isSelf ? "justify-end" : "justify-start"} mb-3 px-2`}>
			<div
				className={`max-w-[85%] md:max-w-[70%] ${isSelf ? "order-1" : "order-2"}`}>
				{!isSelf && (
					<p className='text-xs font-semibold text-white/60 mb-1 ml-1'>
						Ann Schleifer
					</p>
				)}

				<div
					className={`text-sm py-2.5 px-4 tracking-wide shadow-lg ${
						isSelf
							? "bg-gradient-to-r from-[#a286f7] to-[#7556d3] text-white rounded-t-2xl rounded-bl-2xl rounded-br-sm"
							: "text-white/80 rounded-2xl bg-transparent border border-white/5"
					}`}>
					{message}
				</div>
				<span
					className={`block text-[10px] text-white/20 mt-1 ${isSelf ? "text-right mr-1" : "text-left ml-1"}`}>
					{timestamp}
				</span>
			</div>
		</div>
	);
};

export default ChatBubble;
