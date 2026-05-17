import React, { useState } from 'react';
import { IoSend } from 'react-icons/io5';

interface ChatInputProps {
  onSendMessage: (text: string) => void;
  soundEnabled: boolean;
}

const ChatInput = ({ onSendMessage, soundEnabled }: ChatInputProps) => {
  const [text, setText] = useState('');

  const playKeySound = () => {
    if (!soundEnabled) return;
    const audio = new Audio('/sounds/keypress.mp3'); 
    audio.volume = 0.15;
    audio.play().catch(() => {});
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    onSendMessage(text);
    setText('');
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 border-t border-white/5 bg-[#08061b]">
      <div className="relative flex items-center">
        <input
          type="text"
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            playKeySound();
          }}
          placeholder="Text Input Field..."
          className="w-full bg-[#0c0926] border border-white/5 rounded-xl py-3 pl-4 pr-12 text-sm text-white placeholder-white/20 focus:outline-none focus:border-[#7556d3]/50 transition-colors"
        />
        <button
          type="submit"
          className="absolute right-2 p-2 rounded-lg bg-[#7556d3] text-white hover:bg-[#a286f7] transition-colors"
        >
          <IoSend className="h-4 w-4" />
        </button>
      </div>
    </form>
  );
};

export default ChatInput;