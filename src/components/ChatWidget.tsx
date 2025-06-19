import * as React from "react";
import * as Popover from "@radix-ui/react-popover";
import { X } from "lucide-react";
import { Button } from "./ui/button";
import {
  ChatMessage,
  useMessages,
  useSendAIMessage,
  useSendMessage,
} from "@/hooks/useChat";
import MessageComposeBar from "./chat/MessageComposeBar";
import { getAIChatResponse } from "@/services/getAIChatResponse";
import MessageBubble from "./chat/MessageBubble";
import { useAuth } from "@/hooks/useAuth";

const PENDING_MSG_TEMP_ID = "pending";

const ChatWidget: React.FC = () => {
  const [message, setMessage] = React.useState("");
  const [messageList, setMessageList] = React.useState<ChatMessage[]>([]);
  const { data: fetchedMessages, isLoading, error } = useMessages(
    { bot_receiver_id: "openai_virtual_assistant" },
    0,
    20,
  );
  const { user } = useAuth();

  React.useEffect(() => {
    if (fetchedMessages) {
      setMessageList(fetchedMessages);
    }
  }, [fetchedMessages]);

  const { mutate: sendMessage, isPending } = useSendMessage({
    onSuccess: (newMessage) => {
      // Find pending mesages and adjust id
      const pendingMessage = messageList.find((msg) =>
        msg.id === newMessage.id
      );
      if (pendingMessage) {
        pendingMessage.id = newMessage.id;
        pendingMessage.created_at = newMessage.created_at;
        pendingMessage.updated_at = newMessage.updated_at;
      }

      const wrap = async () => {
        const response = await getAIChatResponse(newMessage.id);
        setMessageList((prev) => {
          return [response, ...prev];
        });
      };
      wrap();
    },
  });

  const handleSendMessage = () => {
    setMessageList((prev) => {
      return [{
        id: PENDING_MSG_TEMP_ID,
        sender_id: user.id,
        updated_at: "", // temp here until date format function is implemented
        content: message,
        bot_receiver_id: "openai_virtual_assistant",
        created_at: "",
        receiver_id: null,
        bot_sender_id: null,
        embedding: null,
      }, ...prev];
    });

    sendMessage({
      target: { bot_receiver_id: "openai_virtual_assistant" },
      content: message,
    });
  };

  const constentSwitch = () => {
    if (isLoading) {
      return (
        <div>
          Loading
        </div>
      );
    }

    if (error) {
      return (
        <div>
          error: {JSON.stringify(error)}
          fetchedMessages: {JSON.stringify(fetchedMessages)}
        </div>
      );
    }

    return (
      <div className="h-full flex flex-col">
        {/* Your chat UI goes here */}
        <p>Welcome to the chat!</p>
        <div className="grow flex flex-col-reverse overflow-y-auto gap-2 p-2">
          {messageList.map((mes) => (
            <MessageBubble
              message={mes}
              sentByUser={mes.sender_id === user.id}
            />
          ))}
        </div>
        <MessageComposeBar
          message={message}
          onMessageChange={(val) => setMessage(val)}
          onSend={() => handleSendMessage()}
        />
      </div>
    );
  };

  return (
    <Popover.Root>
      <Popover.Trigger asChild>
        <button
          className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-blue-600 text-white shadow-md flex items-center justify-center hover:bg-blue-700 transition"
          aria-label="Open chat"
        >
          💬
        </button>
      </Popover.Trigger>

      <Popover.Portal>
        <Popover.Content
          side="top"
          sideOffset={10}
          align="end"
          className="z-50 w-[90vw] max-w-sm h-[500px] bg-white border border-gray-200 rounded-xl shadow-xl p-4 flex flex-col"
        >
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-lg font-bold">Chat</h2>
            <Popover.Close
              className="text-gray-500 hover:text-gray-800"
              aria-label="Close chat"
            >
              <X size={18} />
            </Popover.Close>
          </div>
          <div className="flex-1 overflow-auto">
            {constentSwitch()}
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
};

export default ChatWidget;
