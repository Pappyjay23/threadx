import { useState, useMemo } from "react";
import { FiSearch } from "react-icons/fi";
import { IoCloseOutline } from "react-icons/io5";
import Input from "../ui/Input";
import PresenceAvatar from "./PresenceAvatar";
import EmptyState from "../shared/EmptyState";

interface ContactListProps {
  onSelectChat: (id: string) => void;
  activeChatId?: string;
}

const ContactList = ({ onSelectChat, activeChatId }: ContactListProps) => {
  const [searchQuery, setSearchQuery] = useState("");

  const mockChats = [
    {
      id: "1",
      name: "Ann Schleifer",
      image:
        "https://images.unsplash.com/photo-1524502397800-2eeaad7c3fe5?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      username: "annschleifer",
      isOnline: true,
    },
    {
      id: "2",
      name: "Hussein Saddam",
      image: "",
      username: "husseinsaddam",
      isOnline: true,
    },
    {
      id: "3",
      name: "Vladimir Basuki",
      image: "",
      username: "vladimirbasuki",
      isOnline: false,
    },
  ];

  const filteredContacts = useMemo(() => {
    return mockChats.filter(
      (contact) =>
        contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        contact.username.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  return (
    <section className='w-full md:w-80 h-full bg-muted/50 flex flex-col'>
      <div className='p-4 flex items-center justify-between'>
        <h1 className='text-xl font-bold tracking-tight text-white/90'>
          Contacts
        </h1>
      </div>

      <div className='px-4 mb-4'>
        <div className="relative flex items-center">
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder='Search contacts...'
            type='search'
            className='rounded-full! border-primary/30! border w-full pr-10 text-xs!'
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className='absolute right-3 p-1 rounded-full hover:bg-white/10 text-foreground/50 hover:text-white transition-colors cursor-pointer'
            >
              <IoCloseOutline className='text-base' />
            </button>
          )}
        </div>
      </div>

      <div className='flex-1 overflow-y-auto space-y-2 px-2 pb-20 md:pb-4'>
        {filteredContacts.length > 0 ? (
          filteredContacts.map((chat) => {
            const isActive = chat.id === activeChatId;
            return (
              <div
                key={chat.id}
                onClick={() => onSelectChat(chat.id)}
                className={`flex items-center gap-3 p-3 rounded-md cursor-pointer transition-all duration-150 ${
                  isActive
                    ? "bg-[#7556d3]/20 border border-[#7556d3]/30"
                    : "border border-transparent hover:bg-white/5"
                }`}
              >
                <PresenceAvatar
                  src={chat.image}
                  name={chat.name}
                  isOnline={chat.isOnline}
                  size='md'
                />
                <div className='flex-1 min-w-0'>
                  <div className='flex items-center justify-between mb-0.5'>
                    <h3 className='text-sm font-medium text-white/90 truncate tracking-tight'>
                      {chat.name}
                    </h3>
                  </div>
                  <p className='text-xs truncate font-light text-foreground/60'>
                    @{chat.username}
                  </p>
                </div>
              </div>
            );
          })
        ) : (
          <div className='flex flex-col h-full items-center justify-center text-center px-4 animate-fade-in'>
            <EmptyState
              icon={<FiSearch className='text-4xl' />}
              title='No contacts match your search.'
              description='Try checking the spelling or querying another contact.'
            />
          </div>
        )}
      </div>
    </section>
  );
};

export default ContactList;