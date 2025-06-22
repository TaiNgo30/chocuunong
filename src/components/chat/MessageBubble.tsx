import { ChatMessage } from "@/hooks/useChat";
import clsx from "clsx";

export type MessageBubbleProps = {
  message: ChatMessage;
  sentByUser: boolean;
};

const isValidDateString = (value: string): boolean => {
  const date = new Date(value);
  return !isNaN(date.getTime());
};

const parseTime = (val: string) => {
  if (val && isValidDateString(val)) {
    const date = new Date(val);

    return new Intl.DateTimeFormat("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).format(date);
  } else {
    if (val) return val;
    return "";
  }
};

const MessageBubble = ({ message, sentByUser }: MessageBubbleProps) => {
  return (
    <div
      className={clsx(
        "w-full flex mb-2",
        sentByUser ? "flex-row-reverse" : "flex-row",
      )}
    >
      <div>
        <div
          className={clsx(
            "flex mb-2 items-center gap-2",
            sentByUser ? "flex-row-reverse" : "flex-row",
          )}
        >
          <div>
            <div
              className={clsx(
                "rounded-xl px-4 py-2 max-w-xs",
                sentByUser
                  ? "bg-green-700 text-white rounded-br-none"
                  : "bg-gray-200 text-black rounded-bl-none",
              )}
            >
              {message.content}
              <p className="text-[11px] text-right">
                {parseTime(message.created_at)}
              </p>
            </div>
          </div>
          {/* Filler */}
          <div className="w-2"/>
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;
