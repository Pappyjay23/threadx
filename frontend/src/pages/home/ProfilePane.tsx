import PresenceAvatar from "@/components/chat/PresenceAvatar";
import { useAuthStore } from "@/store/useAuthStore";
import { useRef } from "react";
import {
	FiArrowLeft,
	FiCamera,
	FiChevronRight,
	FiLogOut,
	FiMail,
} from "react-icons/fi";
import { LuUser } from "react-icons/lu";

interface ProfilePaneProps {
	onBack?: () => void;
}

// TODO: replace with real user data from your auth store
const mockUser = {
	name: "Peace Jinadu-Paul",
	username: "peacejp",
	email: "peace@piseye.studio",
	image: undefined as string | undefined,
	bio: "Hey there! I'm using ThreadX.",
};

const ProfilePane = ({ onBack }: ProfilePaneProps) => {
	const { setIsAuthenticated } = useAuthStore();
	const fileInputRef = useRef<HTMLInputElement>(null);

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;
		if (!file.type.startsWith("image/")) return;
		if (file.size > 5 * 1024 * 1024) return;

		// TODO: upload profile image
		console.log("Selected file:", file.name);
	};

	return (
		<div className='flex flex-col h-full w-full md:w-80 bg-muted/30 border border-primary/10 rounded-[20px] overflow-hidden'>
			<div className='flex items-center gap-3 p-4 border-b border-primary/10 shrink-0'>
				{onBack && (
					<button
						onClick={onBack}
						className='p-2 text-foreground/60 border border-transparent hover:border-primary/50 rounded-full hover:bg-white/5 transition-all duration-300 cursor-pointer'
						aria-label='Go back'>
						<FiArrowLeft className='h-4 w-4' />
					</button>
				)}
				<h1 className='text-sm font-semibold text-white/90 tracking-wide'>
					Profile
				</h1>
			</div>

			<div className='flex-1 overflow-y-auto'>
				<div className='flex flex-col items-center pt-8 pb-6 px-6 border-b border-primary/10'>
					{/* Avatar with upload overlay */}
					<div className='relative group'>
						<PresenceAvatar
							isOnline={true}
							size='lg'
							src={mockUser.image}
							name={mockUser.name}
						/>

						<input
							type='file'
							ref={fileInputRef}
							onChange={handleFileChange}
							accept='image/png,image/jpeg,image/webp'
							className='hidden'
						/>
						<button
							onClick={() => fileInputRef.current?.click()}
							className='absolute inset-0 rounded-full flex flex-col items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 cursor-pointer'
							aria-label='Change profile photo'>
							<FiCamera className='h-5 w-5 text-white/90' />
							<span className='text-[9px] text-white/70 mt-1 font-medium uppercase tracking-wider'>
								Change
							</span>
						</button>
					</div>

					<h2 className='mt-4 text-lg font-semibold text-white/90'>
						{mockUser.name}
					</h2>
				</div>

				{/* Quick info */}
				<div className='px-6 py-4 border-b border-primary/10 space-y-3'>
					<div className='flex items-center gap-3'>
						<div className='p-2 rounded-full border border-primary/20 bg-primary/5'>
							<FiMail className='h-3.5 w-3.5 text-primary/60' />
						</div>
						<div>
							<p className='text-[10px] text-foreground/40'>Email</p>
							<p className='text-xs text-white/70'>{mockUser.email}</p>
						</div>
					</div>

					<div className='flex items-center gap-3'>
						<div className='p-2 rounded-full border border-primary/20 bg-primary/5'>
							<LuUser className='h-3.5 w-3.5 text-primary/60' />
						</div>
						<div>
							<p className='text-[10px] text-foreground/40'>Username</p>
							<p className='text-xs text-white/70'>@{mockUser.username}</p>
						</div>
					</div>
				</div>

				<div className='px-4 py-4'>
					<h4 className='text-[10px] font-semibold text-red-400/60 uppercase tracking-widest mb-2 px-2'>
						Exit
					</h4>
					<div className='space-y-0.5'>
						<button
							onClick={() => setIsAuthenticated(false)}
							className='w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-red-500/5 transition-all duration-300 cursor-pointer group'>
							<div className='p-2 rounded-full border border-red-500/20 bg-red-500/5 group-hover:border-red-500/40 group-hover:bg-red-500/10 transition-all duration-300'>
								<FiLogOut className='h-3.5 w-3.5 text-red-400/60 group-hover:text-red-400/80' />
							</div>
							<div className='flex-1 text-left'>
								<p className='text-xs font-medium text-red-400/70 group-hover:text-red-400/90 transition-colors'>
									Logout
								</p>
							</div>
							<FiChevronRight className='h-3.5 w-3.5 text-red-400/20 group-hover:text-red-400/40 transition-colors' />
						</button>
					</div>
				</div>
			</div>
		</div>
	);
};

export default ProfilePane;
