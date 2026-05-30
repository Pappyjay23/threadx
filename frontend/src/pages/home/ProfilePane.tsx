import PresenceAvatar from "@/components/chat/PresenceAvatar";
import { axiosInstance } from "@/config/axios";
import { useAuthStore } from "@/store/useAuthStore";
import { formatDate } from "@/utils/helpers";
import { useRef, useState } from "react";
import {
	FiArrowLeft,
	FiCamera,
	FiChevronRight,
	FiLogOut,
	FiMail,
} from "react-icons/fi";
import { LuUser } from "react-icons/lu";
import { MdCardMembership } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface ProfilePaneProps {
	onBack?: () => void;
}

const ProfilePane = ({ onBack }: ProfilePaneProps) => {
	const navigate = useNavigate();
	const { logout, user, updateProfile, onlineUsers } = useAuthStore();
	const [selectedImg, setSelectedImg] = useState<string | null>(null);
	const fileInputRef = useRef<HTMLInputElement>(null);

	const isOnline = user && onlineUsers.includes(user._id.toString());

	const fullName = user
		? `${user.firstName}${user.lastName ? ` ${user.lastName}` : ""}`
		: "Guest";
	const email = user?.email ?? "Unavailable";
	const username = user ? `@${user.email.split("@")[0]}` : "@guest";
	const dateJoined = formatDate(new Date(user?.createdAt ?? ""));

	const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;

		console.log(file);

		// Validate size (e.g. 5MB max)
		if (file.size > 5 * 1024 * 1024) {
			toast.error("Image must be less than 5MB");
			return;
		}

		// Validate type
		if (!file.type.startsWith("image/")) {
			toast.error("File must be an image");
			return;
		}

		setSelectedImg(URL.createObjectURL(file));

		try {
			const { data } = await axiosInstance.get(
				"/auth/upload-profile-signature",
			);
			const { timestamp, signature, cloudName, apiKey, folder } = data;

			const formData = new FormData();
			formData.append("file", file);
			formData.append("timestamp", timestamp);
			formData.append("signature", signature);
			formData.append("api_key", apiKey);
			formData.append("folder", folder);

			const cloudinaryRes = await fetch(
				`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
				{ method: "POST", body: formData },
			);
			const { secure_url } = await cloudinaryRes.json();

			await updateProfile(secure_url);
		} catch {
			setSelectedImg(user?.picture ?? null); // Revert with null coalescing
		}
	};

	const profileDetails = [
		{
			icon: <FiMail className='h-3.5 w-3.5 text-primary/60' />,
			label: "Email",
			value: email,
		},
		{
			icon: <LuUser className='h-3.5 w-3.5 text-primary/60' />,
			label: "Username",
			value: username,
		},
		{
			icon: <MdCardMembership className='h-3.5 w-3.5 text-primary/60' />,
			label: "Joined",
			value: dateJoined,
		},
	];

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
							isOnline={isOnline ?? false}
							size='lg'
							src={selectedImg || user?.picture}
							name={fullName}
						/>

						<input
							type='file'
							ref={fileInputRef}
							onChange={handleImageUpload}
							accept='image/*'
							className='hidden'
						/>
						<button
							onClick={() => fileInputRef.current?.click()}
							className='absolute z-7 h-16 w-16 inset-0 rounded-full flex flex-col items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 cursor-pointer'
							aria-label='Change profile photo'>
							<FiCamera className='h-5 w-5 text-white/90' />
							<span className='text-[9px] text-white/70 mt-1 font-medium uppercase tracking-wider'>
								Change
							</span>
						</button>
					</div>

					<h2 className='mt-4 text-lg font-semibold text-white/90 capitalize'>
						{fullName}
					</h2>
				</div>

				{/* Quick info */}
				<div className='px-6 py-4 border-b border-primary/10 space-y-3'>
					{profileDetails.map((detail, index) => (
						<div key={index} className='flex items-center gap-3'>
							<div className='p-2 rounded-full border border-primary/20 bg-primary/5'>
								{detail.icon}
							</div>
							<div>
								<p className='text-[10px] text-foreground/40'>{detail.label}</p>
								<p className='text-xs text-white/70'>{detail.value}</p>
							</div>
						</div>
					))}
				</div>

				<div className='px-4 py-4'>
					<h4 className='text-[10px] font-semibold text-red-400/60 uppercase tracking-widest mb-2 px-2'>
						Exit
					</h4>
					<div className='space-y-0.5'>
						<button
							onClick={async () => {
								await logout();
								navigate("/login");
							}}
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
