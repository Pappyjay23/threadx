import ContactList from "@/components/chat/ContactList";
import useChatStore from "@/store/useChatStore";
import type { ActiveTab } from "@/types/chat";
import { isMobile } from "@/utils/helpers";
import { useEffect, useRef, useState } from "react";
import ChatActiveArea from "../../components/chat/ChatActiveArea";
import ConversationList from "../../components/chat/ConversationList";
import FloatingSidebar from "../../components/navigation/FloatingSidebar";
import ProfilePane from "./ProfilePane";

const DashboardPage = () => {
	const [activeTab, setActiveTab] = useState<ActiveTab>("chats");
	const tabChangedByNavRef = useRef(false);

	const { activeChatId, setActiveChatId } = useChatStore();

	useEffect(() => {
		if (isMobile() && tabChangedByNavRef.current) {
			setActiveChatId(undefined);
		}
		tabChangedByNavRef.current = false;
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

	const handleNavTabChange = (tab: ActiveTab) => {
		tabChangedByNavRef.current = true;
		setActiveTab(tab);
	};

	return (
		<div className='flex flex-col lg:flex-row h-svh max-h-dvh max-w-300 mx-auto bg-background text-foreground antialiased overflow-hidden'>
			<FloatingSidebar
				activeTab={activeTab}
				setActiveTab={handleNavTabChange}
			/>

			<main className='flex-1 min-h-0 md:py-6 px-2 pb-2 flex relative'>
				<div className='flex gap-5 lg:gap-10 flex-1 min-h-0 w-full relative'>
					{/* ── Left column: lists / profile ── */}

					{activeTab === "chats" && (
						<div
							className={`w-full md:w-auto min-h-0 border border-primary/10 rounded-[20px] overflow-hidden ${
								activeChatId ? "hidden md:block" : "block"
							}`}>
							<ConversationList
								onSelectChat={(id) => setActiveChatId(id)}
								activeChatId={activeChatId}
								setActiveTab={setActiveTab}
							/>
						</div>
					)}

					{activeTab === "contacts" && (
						<div
							className={`w-full md:w-auto min-h-0 border border-primary/10 rounded-[20px] overflow-hidden ${
								activeChatId ? "hidden md:block" : "block"
							}`}>
							<ContactList
								onSelectChat={(id) => {
									setActiveChatId(id);
									setActiveTab("chats");
								}}
							/>
						</div>
					)}

					{activeTab === "profile" && (
						<div
							className={`w-full md:w-auto min-h-0 overflow-hidden ${
								activeChatId ? "hidden md:block" : "block"
							}`}>
							<ProfilePane onBack={() => setActiveTab("chats")} />
						</div>
					)}

					{/* ── Right column: chat area ── */}
					<div
						className={`flex-1 min-h-0 w-full border border-primary/10 rounded-[20px] overflow-hidden ${
							!activeChatId ? "hidden md:flex" : "flex"
						}`}>
						<ChatActiveArea
							chatId={activeChatId}
							onCloseChat={() => setActiveChatId(undefined)}
							onOpenHeaderProfile={() => {}}
						/>
					</div>
				</div>
			</main>
		</div>
	);
};

export default DashboardPage;
