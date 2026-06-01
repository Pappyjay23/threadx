import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { FiX, FiDownload } from "react-icons/fi";
import LazyImage from "./LazyImage";

interface ImageLightboxProps {
	src: string;
	alt?: string;
	isOpen: boolean;
	onClose: () => void;
}

const ImageLightbox = ({ src, alt, isOpen, onClose }: ImageLightboxProps) => {
	const closeButtonRef = useRef<HTMLButtonElement>(null);

	useEffect(() => {
		if (!isOpen) return;
		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key === "Escape") onClose();
		};
		document.addEventListener("keydown", handleKeyDown);
		document.body.style.overflow = "hidden";
		return () => {
			document.removeEventListener("keydown", handleKeyDown);
			document.body.style.overflow = "";
		};
	}, [isOpen, onClose]);

	const handleDownload = async () => {
		try {
			const response = await fetch(src);
			const blob = await response.blob();
			const url = URL.createObjectURL(blob);
			const a = document.createElement("a");
			a.href = url;

			// Extract original filename from URL, e.g. "abc123.jpg" from the Cloudinary path
			const filename = src.split("/").pop()?.split("?")[0] ?? "image.jpg";
			a.download = filename;

			a.click();
			URL.revokeObjectURL(url);
		} catch {
			window.open(src, "_blank");
		}
	};

	if (!isOpen) return null;

	return createPortal(
		<>
			{/* Backdrop */}
			<div
				className='fixed inset-0 z-9998 bg-black/80 backdrop-blur-sm transition-opacity duration-300'
				onClick={onClose}
			/>

			{/* Lightbox */}
			<div className='fixed inset-0 z-9999 flex items-center justify-center p-4 pointer-events-none'>
				<div
					className='relative pointer-events-auto max-w-3xl w-full'
					onClick={(e) => e.stopPropagation()}>
					{/* Action buttons */}
					<div className='absolute -top-10 right-0 flex items-center gap-2'>
						<button
							onClick={handleDownload}
							className='p-2 text-white/60 border border-white/10 hover:border-primary/50 rounded-full hover:bg-white/5 transition-all duration-300 cursor-pointer'
							aria-label='Download image'>
							<FiDownload className='h-4 w-4' />
						</button>
						<button
							ref={closeButtonRef}
							onClick={onClose}
							className='p-2 text-white/60 border border-white/10 hover:border-primary/50 rounded-full hover:bg-white/5 transition-all duration-300 cursor-pointer'
							aria-label='Close lightbox'>
							<FiX className='h-4 w-4' />
						</button>
					</div>

					{/* Image */}
					<LazyImage
						src={src}
						alt={alt ?? "Shared image"}
						imgClassName='object-contain max-h-[80vh]'
						className='w-fit mx-auto rounded-lg border border-primary/10'
					/>
				</div>
			</div>
		</>,
		document.body, // ← renders directly on body, outside all stacking contexts
	);
};

export default ImageLightbox;
