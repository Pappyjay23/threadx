const MessageBubbleSkeleton = ({ isSelf }: { isSelf: boolean }) => {
  return (
    <div className={`flex w-full ${isSelf ? "justify-end" : "justify-start"} mb-3 px-2`}>
      <div className={`max-w-[85%] md:max-w-[70%] ${isSelf ? "order-1" : "order-2"}`}>
        {/* Sender name */}
        <div className={`mb-1 ${isSelf ? "flex justify-end mr-1" : "ml-1"}`}>
          <div className="h-2.5 w-10 rounded-md bg-white/10 animate-pulse" />
        </div>

        {/* Bubble */}
        <div
          className={`py-2 px-4 rounded-t-lg animate-pulse ${
            isSelf
              ? "bg-primary/20 rounded-bl-lg"
              : "bg-secondary/50 border border-primary/10 rounded-br-lg"
          }`}>
          <div className="h-3 rounded-md bg-white/10 mb-1.5" style={{ width: `${isSelf ? 140 : 180}px` }} />
          <div className="h-3 rounded-md bg-white/10" style={{ width: `${isSelf ? 100 : 120}px` }} />
        </div>

        {/* Timestamp */}
        <div className={`mt-1 ${isSelf ? "flex justify-end mr-1" : "ml-1"}`}>
          <div className="h-2 w-8 rounded-md bg-white/10 animate-pulse" />
        </div>
      </div>
    </div>
  );
};

const MessageSkeletonLoader = () => {
  // Alternate self/other to mimic a real conversation
  const pattern = [false, true, false, true, false, true];

  return (
    <>
      {pattern.map((isSelf, i) => (
        <MessageBubbleSkeleton key={i} isSelf={isSelf} />
      ))}
    </>
  );
};

export default MessageSkeletonLoader;