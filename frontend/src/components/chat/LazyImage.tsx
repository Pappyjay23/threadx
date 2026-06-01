import { useState } from "react";

interface LazyImageProps {
	src: string;
	alt: string;
	className?: string;
	imgClassName?: string;
	aspectRatio?: string;
	onClick?: () => void;
}

const LazyImage = ({
	src,
	alt,
	className = "",
	imgClassName = "",
	aspectRatio,
	onClick,
}: LazyImageProps) => {
	const [isLoading, setIsLoading] = useState(true);

	return (
		<div
			className={`relative overflow-hidden ${className}`}
			style={aspectRatio ? { aspectRatio } : undefined}
			onClick={onClick}>
			{/* Skeleton Loader */}
			{isLoading && (
				<div className='absolute inset-0 bg-primary/10 animate-pulse' />
			)}

			<img
				src={src}
				alt={alt}
				loading='lazy'
				onLoad={() => setIsLoading(false)}
				className={`w-full ${imgClassName ? "" : "h-full object-cover"} ${imgClassName} transition-opacity duration-500 ${
					isLoading ? "opacity-0" : "opacity-100"
				}`}
			/>
		</div>
	);
};

export default LazyImage;
