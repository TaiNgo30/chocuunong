import * as React from "react";
import * as Popover from "@radix-ui/react-popover";
import { CircleAlert, Megaphone, MessageCircleMore, SquareChartGantt, X } from "lucide-react";
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
import "./chat/ChatScrollbar.css";
import DateDivider from "./chat/DateDivider";
import { Skeleton } from "./ui/skeleton";
import LoadingBubble from "./chat/LoadingBubble";

const PENDING_MSG_TEMP_ID = "pending";
const PENDING_MSG_TIMESTAMP = "Đang gửi";

type GroupedMessages = {
  date: string;
  messages: ChatMessage[];
};

const isValidDateString = (value: string): boolean => {
  const date = new Date(value);
  return !isNaN(date.getTime());
};

const parseTime = (val: string) => {
  if (val && isValidDateString(val)) {
    const date = new Date(val);

    const d = date.getDate().toString();
    const m = (date.getMonth() + 1).toString();
    const y = date.getFullYear();
    return `${d} tháng ${m}, ${y}`;
  } else {
    if (val) return val;
    return "";
  }
};

const ChatWidget: React.FC = () => {
  const { user } = useAuth();
  const [message, setMessage] = React.useState("");
  const [messageList, setMessageList] = React.useState<ChatMessage[]>([]);
  const groupedMessages = React.useMemo<GroupedMessages[]>(() => {
    const result: GroupedMessages[] = [];

    for (const msg of messageList) {
      const dateKey = parseTime(msg.created_at); // YYYY-MM-DD
      const lastGroup = result[result.length - 1];

      if (
        !lastGroup ||
        (dateKey !== PENDING_MSG_TIMESTAMP && lastGroup.date !== dateKey)
      ) {
        result.push({
          date: dateKey,
          messages: [msg],
        });
      } else {
        lastGroup.messages.push(msg);
      }
    }

    return result;
  }, [messageList]);

  const { data: fetchedMessages, isLoading, error } = useMessages(
    { bot_receiver_id: "openai_virtual_assistant" },
    0,
    20,
  );

  const [aiResponding, setAiResponding] = React.useState(false);
  const [chatError, setChatError] = React.useState(false);

  React.useEffect(() => {
    if (fetchedMessages) {
      setMessageList(fetchedMessages);
    }
  }, [fetchedMessages]);

  const { mutate: sendMessage, isPending } = useSendMessage({
    onSuccess: (newMessage) => {
      // Find pending mesages and adjust id
      const pendingMessage = messageList.find((msg) =>
        msg.id === PENDING_MSG_TEMP_ID
      );
      if (pendingMessage) {
        pendingMessage.id = newMessage.id;
        pendingMessage.created_at = newMessage.created_at;
        pendingMessage.updated_at = newMessage.updated_at;
      }

      setAiResponding(true);
      const wrap = async () => {
        await getAIChatResponse(newMessage.id)
          .then((response) => {
            setMessageList((prev) => {
              return [response, ...prev];
            });
          })
          .catch((_err) => {
            setChatError(true);
          })
          .finally(() => {
            setAiResponding(false);
          });
      };
      wrap();
    },
  });

  const handleSendMessage = () => {
    setMessageList((prev) => {
      return [{
        id: PENDING_MSG_TEMP_ID,
        sender_id: user?.id,
        updated_at: PENDING_MSG_TIMESTAMP,
        content: message,
        bot_receiver_id: "openai_virtual_assistant",
        created_at: PENDING_MSG_TIMESTAMP,
        receiver_id: null,
        bot_sender_id: null,
        embedding: null,
      }, ...prev];
    });

    sendMessage({
      target: { bot_receiver_id: "openai_virtual_assistant" },
      content: message,
    });

    setMessage("");
  };

  const constentSwitch = () => {
    if (isLoading) {
      return (
        <div className="h-full flex flex-col">
          <div className="grow flex flex-col gap-2 p-4 justify-center items-center">
            <div
              className={`animate-spin rounded-full border-2 border-t-transparent border-gray-400`}
              style={{ width: 30, height: 30 }}
            />
          </div>
        </div>
      );
    }

    if (!user) {
      return (
        <div className="h-full flex flex-col">
          <div className="grow flex flex-col gap-2 p-4 justify-center items-center">
            <SquareChartGantt width={"30%"} height={"30%"} color="gray" />
            <div className="text-gray-400 text-center">
              Hãy đăng nhập để bắt đầu trò chuyện với trợ lý ảo!
            </div>
          </div>
        </div>
      );
    }

    if (error || chatError) {
      return (
        <div className="h-full flex flex-col">
          <div className="grow flex flex-col gap-2 p-4 justify-center items-center">
            <CircleAlert width={"30%"} height={"30%"} color="red" />
            <div className="text-red-400">
              Đã có lỗi xảy ra, hãy thử tải lại trang!
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="h-full flex flex-col">
        <div className="grow flex flex-col-reverse overflow-y-auto gap-2 p-2 chat-scrollbar">
          {groupedMessages.length < 1 &&
            (
              <div className="grow flex flex-col gap-2 p-4 justify-center items-center">
                <Megaphone width={"30%"} height={"30%"} color="gray" />
                <div className="text-gray-400">
                  Hãy bắt đầu trò chuyện với AI tư vấn!
                </div>
              </div>
            )}
          {groupedMessages.length >= 1 && (
            <div className="flex flex-col-reverse">
              {aiResponding && <LoadingBubble />}
              {groupedMessages.map((msgGroup, index) => (
                <div key={index}>
                  {msgGroup.date !== PENDING_MSG_TIMESTAMP && (
                    <DateDivider label={msgGroup.date} />
                  )}
                  <div className="flex flex-col-reverse">
                    {msgGroup.messages.map((msg, ind) => (
                      <MessageBubble
                        key={ind + " - " + msg.id}
                        message={msg}
                        sentByUser={msg.sender_id === user.id}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        <MessageComposeBar
          message={message}
          onMessageChange={(val) => setMessage(val)}
          onSend={() => handleSendMessage()}
          enabled={!isPending && !aiResponding}
        />
      </div>
    );
  };

  return (
    <Popover.Root>
      <Popover.Trigger asChild>
        <button
          className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-green-600 text-white shadow-md flex items-center justify-center hover:bg-green-700 transition"
          aria-label="Open chat"
        >
          <MessageCircleMore color="white"/>
          <span className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-green-400 opacity-50 animate-ripple-pulse pointer-events-none" />
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
            <h2 className="text-lg font-bold">Chat với AI tư vấn</h2>
            <Popover.Close
              className="text-gray-500 hover:text-gray-800"
              aria-label="Close chat"
            >
              <X size={18} />
            </Popover.Close>
          </div>
          <div className="flex-1 overflow-auto custom-scrollbar">
            {constentSwitch()}
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
};

export default ChatWidget;
