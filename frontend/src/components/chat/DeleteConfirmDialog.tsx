import { IoCloseOutline } from "react-icons/io5";

interface DeleteConfirmDialogProps {
	isOpen: boolean;
	onConfirm: () => void;
	onCancel: () => void;
}

const DeleteConfirmDialog = ({
	isOpen,
	onConfirm,
	onCancel,
}: DeleteConfirmDialogProps) => {
	if (!isOpen) return null;

	return (
		<>
			<div
				onClick={onCancel}
				className='fixed inset-0 bg-black/60 z-50 animate-fade-in'
			/>

			<div className='fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none'>
				<div className='bg-secondary border border-primary/20 rounded-lg shadow-2xl w-full max-w-sm pointer-events-auto animate-scale-in'>
					<div className='flex items-center justify-between p-4 border-b border-white/10'>
						<h3 className='text-base font-semibold text-white/90'>
							Delete message?
						</h3>
						<button
							onClick={onCancel}
							className='p-1 rounded-full hover:bg-white/10 text-white/50 hover:text-white transition-colors cursor-pointer'>
							<IoCloseOutline className='text-xl' />
						</button>
					</div>

					<div className='p-4'>
						<p className='text-sm text-white/60 font-light'>
							This message will be deleted for you. This action cannot be undone.
						</p>
					</div>

					<div className='flex items-center justify-end gap-2 p-4 border-t border-white/10'>
						<button
							onClick={onCancel}
							className='px-4 py-2 text-sm font-medium text-white/70 hover:text-white hover:bg-white/5 rounded-md transition-colors cursor-pointer'>
							Cancel
						</button>
						<button
							onClick={onConfirm}
							className='px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md transition-colors cursor-pointer'>
							Delete
						</button>
					</div>
				</div>
			</div>
		</>
	);
};

export default DeleteConfirmDialog;