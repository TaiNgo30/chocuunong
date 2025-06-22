import * as React from "react";
import { Send, Smile } from "lucide-react";
import clsx from "clsx";

interface MessageComposeBarProps {
  message: string;
  onMessageChange: (value: string) => void;
  onSend: () => void;
  enabled?: boolean;
}

const MessageComposeBar: React.FC<MessageComposeBarProps> = ({
  message,
  onMessageChange,
  onSend,
  enabled,
}) => {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  return (
    <div className="flex items-center gap-2 border-t border-gray-200 p-2 pt-4">
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
        placeholder="Nhập câu hỏi..."
        className="flex-1 px-4 py-2 border border-gray-300 rounded-full text-sm outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
        disabled={enabled == false}
      />

      {/* Send Button */}
      <button
        type="button"
        onClick={(enabled != false && message.length > 0) ? onSend : () => { }}
        className={clsx(
          "p-2 rounded-full bg-green-600 hover:bg-green-700 text-white transition",
          enabled != false && message.length > 0
            ? "bg-green-600 hover:bg-green-700"
            : "bg-gray-600 hover:bg-gray-700",
        )}
        disabled={enabled == false || message.length < 1}
        aria-label="Send message"
      >
        <Send size={18} />
      </button>
    </div>
  );
};

export default MessageComposeBar;
