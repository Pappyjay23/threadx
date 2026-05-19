import ContactList from "@/components/chat/ContactList";
import useChatStore from "@/store/useChatStore";
import type { ActiveTab } from "@/types";
import { isMobile } from "@/utils/helpers";
import { useEffect, useState } from "react";
import ChatActiveArea from "../../components/chat/ChatActiveArea";
import ConversationList from "../../components/chat/ConversationList";
import FloatingSidebar from "../../components/navigation/FloatingSidebar";
import ProfilePane from "./ProfilePane";

const DashboardPage = () => {
	const [activeTab, setActiveTab] = useState<ActiveTab>("chats");
	const [soundEnabled, setSoundEnabled] = useState(true);
	const [showHeaderProfile, setShowHeaderProfile] = useState(false);

	const { activeChatId, setActiveChatId } = useChatStore();

	useEffect(() => {
		if (isMobile()) {
			setActiveChatId(undefined);
		}
	}, [activeTab]);

	useEffect(() => {
		const handleKeyDown = (event: KeyboardEvent) => {
			if (event.key === "Escape" && activeChatId) {
				setActiveChatId(undefined);
			}
		};

		document.addEventListener("keydown", handleKeyDown);
		return () => document.removeEventListener("keydown", handleKeyDown);
	}, [activeChatId, setActiveChatId]);

	return (
		<div className='flex flex-col lg:flex-row h-svh max-w-300 mx-auto overflow-hidden bg-background text-foreground select-none antialiased'>
			<FloatingSidebar
				activeTab={activeTab}
				setActiveTab={(tab) => {
					setActiveTab(tab);
					setShowHeaderProfile(false);
					if (isMobile()) {
						setActiveChatId(undefined);
					}
				}}
				soundEnabled={soundEnabled}
				setSoundEnabled={setSoundEnabled}
				onLogout={() => {}}
			/>

			<main className='flex-1 md:py-6 px-2 flex h-full relative'>
				{!showHeaderProfile && (
					<div className='flex gap-5 lg:gap-10 flex-1 h-full w-full relative'>
						{activeTab === "chats" && (
							<div
								className={`w-full md:w-auto h-full border border-primary/10 rounded-[20px] overflow-hidden ${activeChatId ? "hidden md:block" : "block"}`}>
								<ConversationList
									onSelectChat={(id) => setActiveChatId(id)}
									activeChatId={activeChatId}
									setActiveTab={setActiveTab}
								/>
							</div>
						)}

						{activeTab === "contacts" && (
							<div
								className={`w-full md:w-auto h-full border border-primary/10 rounded-[20px] overflow-hidden ${activeChatId ? "hidden md:block" : "block"}`}>
								<ContactList
									onSelectChat={(id) => {
										setActiveChatId(id);
										setActiveTab("chats");
									}}
								/>
							</div>
						)}
						<div
							className={`flex-1 h-full w-full border border-primary/10 rounded-[20px] overflow-hidden ${!activeChatId ? "hidden md:flex" : "flex"}`}>
							<ChatActiveArea
								chatId={activeChatId}
								onCloseChat={() => setActiveChatId(undefined)}
								soundEnabled={soundEnabled}
								onOpenHeaderProfile={() => setShowHeaderProfile(true)}
							/>
						</div>
					</div>
				)}

				{(activeTab === "profile" || showHeaderProfile) && (
					<ProfilePane
						onBack={() => {
							if (showHeaderProfile) {
								setShowHeaderProfile(false);
							} else {
								setActiveTab("chats");
							}
						}}
					/>
				)}
			</main>
		</div>
	);
};

export default DashboardPage;
