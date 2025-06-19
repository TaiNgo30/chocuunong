import * as React from 'react';
import { Smile, Send } from 'lucide-react';

interface MessageComposeBarProps {
  message: string;
  onMessageChange: (value: string) => void;
  onSend: () => void;
}

const MessageComposeBar: React.FC<MessageComposeBarProps> = ({
  message,
  onMessageChange,
  onSend,
}) => {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  return (
    <div className="flex items-center gap-2 border-t border-gray-200 p-2">
      {/* Emoji Button */}
      <button
        type="button"
        className="p-2 rounded-full hover:bg-gray-100 transition"
        aria-label="Insert emoji"
      >
        <Smile size={20} className="text-gray-600" />
      </button>

      {/* Input Field */}
      <input
        type="text"
        value={message}
        onChange={(e) => onMessageChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Type a message..."
        className="flex-1 px-4 py-2 border border-gray-300 rounded-full text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      />

      {/* Send Button */}
      <button
        type="button"
        onClick={onSend}
        className="p-2 rounded-full bg-blue-600 hover:bg-blue-700 text-white transition"
        aria-label="Send message"
      >
        <Send size={18} />
      </button>
    </div>
  );
};

export default MessageComposeBar;
