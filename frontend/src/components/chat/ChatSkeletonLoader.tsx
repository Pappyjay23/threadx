const ChatSkeleton = () => {
	return (
		<div className='flex items-center gap-3 p-3 rounded-md border border-transparent'>
			<div className='relative inline-block shrink-0'>
				<div className='h-10 w-10 rounded-full bg-white/10 animate-pulse' />
				<span className='absolute bottom-0.5 right-1 h-2 w-2 rounded-full bg-white/10 animate-pulse' />
			</div>

			{/* Text skeleton */}
			<div className='flex-1 min-w-0 flex flex-col gap-1.5'>
				<div className='h-3.5 w-28 rounded-md bg-white/10 animate-pulse' />
				<div className='h-3 w-20 rounded-md bg-white/10 animate-pulse' />
			</div>
		</div>
	);
};

export const ChatSkeletonLoader = ({ count = 5 }: { count?: number }) => {
	return (
		<>
			{Array.from({ length: count }).map((_, i) => (
				<ChatSkeleton key={i} />
			))}
		</>
	);
};
