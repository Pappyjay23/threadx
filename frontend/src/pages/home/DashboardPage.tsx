import { useState } from "react";
import FloatingSidebar from "../../components/navigation/FloatingSidebar";
import ConversationList from "../../components/chat/ConversationList";
import ChatActiveArea from "../../components/chat/ChatActiveArea";
import ProfilePane from "./ProfilePane";

const DashboardPage = () => {
	const [activeTab, setActiveTab] = useState<"chats" | "profile">("chats");
	const [activeChatId, setActiveChatId] = useState<string | undefined>(
		undefined,
	);
	const [soundEnabled, setSoundEnabled] = useState(true);
	const [showHeaderProfile, setShowHeaderProfile] = useState(false);

	return (
		<div className='flex flex-col lg:flex-row h-svh max-w-300 mx-auto overflow-hidden bg-background text-white select-none antialiased'>
			<FloatingSidebar
				activeTab={activeTab}
				setActiveTab={(tab) => {
					setActiveTab(tab);
					setShowHeaderProfile(false);
				}}
				soundEnabled={soundEnabled}
				setSoundEnabled={setSoundEnabled}
				onOpenContacts={() => {}}
				onLogout={() => {}}
			/>

			<main className='flex-1 flex h-full relative overflow-hidden'>
				{activeTab === "chats" && !showHeaderProfile && (
					<div className='flex flex-1 h-full w-full relative'>
						<div
							className={`w-full md:w-auto h-full ${activeChatId ? "hidden md:block" : "block"}`}>
							<ConversationList
								onSelectChat={(id) => setActiveChatId(id)}
								activeChatId={activeChatId}
								onLogout={() => {}}
							/>
						</div>

						<div
							className={`flex-1 h-full w-full ${!activeChatId ? "hidden md:flex" : "flex"}`}>
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
