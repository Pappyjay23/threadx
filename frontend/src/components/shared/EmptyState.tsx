interface EmptyStateProps {
	icon?: React.ReactNode;
	title?: string;
	description: string;
	action?: React.ReactNode;
	className?: string;
}

const EmptyState = ({
	icon,
	title,
	description,
	action,
	className = "",
}: EmptyStateProps) => {
	return (
		<div
			className={`flex flex-col items-center justify-center text-center p-6 select-none animate-in fade-in duration-300 ease-in-out ${className}`}>
			{icon && (
				<div className='mb-3 text-foreground flex items-center justify-center'>
					{icon}
				</div>
			)}
			{title && (
				<h3 className='text-sm font-medium text-white/90 tracking-tight mb-1'>
					{title}
				</h3>
			)}
			<p className='text-xs text-foreground/40 font-light max-w-60 leading-relaxed'>
				{description}
			</p>
			{action && <div className='mt-4'>{action}</div>}
		</div>
	);
};

export default EmptyState;
