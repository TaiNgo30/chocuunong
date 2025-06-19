import { ChatMessage } from "@/hooks/useChat";
import clsx from "clsx";

export type MessageBubbleProps = {
  message: ChatMessage;
  sentByUser: boolean;
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
          {/*<Avatar src="" sx={{ width: 48, height: 48 }} />*/}
          <div>
            <p className="bg-green-700 text-white rounded-xl px-4 py-2 max-w-xs">
              {message.content}
            </p>
          </div>
        </div>
        <p>{message.updated_at}</p>
        {/*<p>By you: {sentByUser ? "true" : "false"}</p>*/}
      </div>
    </div>
  );
};

export default MessageBubble;
