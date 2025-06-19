import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { BotIdentification, Database } from "@/integrations/supabase/types";
import { useAuth } from "./useAuth";
import { getAIChatResponse } from "@/services/getAIChatResponse";

export type ChatMessage = Database["public"]["Tables"]["messages"]["Row"];

export type ChatTarget = {
  receiver_id?: string | null;
  bot_receiver_id?: BotIdentification | null;
};

export const useMessages = (
  target: ChatTarget,
  pageIndex = 0,
  pageSize = 20,
) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["messages", target, pageIndex, pageSize],
    enabled: !!(target.receiver_id || target.bot_receiver_id), // Only run if valid target
    queryFn: async () => {
      if (!user || !user?.id) {
        throw new Error("User not authenticated");
      }

      const currentUserId = user.id;
      const botReceiverId = target.bot_receiver_id ?? null;
      const userReceiverId = target.receiver_id ?? null;

      const query = supabase
        .from("messages")
        .select("*")
        .order("created_at", { ascending: false })
        .range(pageIndex * pageSize, (pageIndex + 1) * pageSize - 1);

      if (botReceiverId) {
        query.or(
          `and(sender_id.eq.${currentUserId},bot_receiver_id.eq.${botReceiverId}),and(bot_sender_id.eq.${botReceiverId},receiver_id.eq.${currentUserId})`,
        );
      } else if (userReceiverId) {
        query.or(
          `and(sender_id.eq.${currentUserId},receiver_id.eq.${userReceiverId}),and(sender_id.eq.${userReceiverId},receiver_id.eq.${currentUserId})`,
        );
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching messages:", error);
        throw error;
      }

      return data;
    },
  });
};

export async function insertMessage({
  content,
  senderId,
  target,
}: {
  content: string;
  senderId: string;
  target: ChatTarget;
}): Promise<ChatMessage> {
  const { data, error } = await supabase
    .from("messages")
    .insert({
      content,
      sender_id: senderId,
      receiver_id: target.receiver_id ?? null,
      bot_receiver_id: target.bot_receiver_id ?? null,
    })
    .select()
    .single();

  if (error) {
    console.error("Insert message failed:", error);
    throw error;
  }

  return data;
}

export type useSendMessageProps = {
  onSuccess?: (newMessage: ChatMessage) => void;
};

export const useSendMessage = ({
  onSuccess,
}: useSendMessageProps = {}) => {
  const { user } = useAuth();
  // const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      content,
      target,
    }: {
      content: string;
      target: ChatTarget;
    }): Promise<ChatMessage> => {
      if (!user || !user?.id) {
        throw new Error("User not authenticated");
      }

      return await insertMessage({ senderId: user.id, target, content });
    },

    onSuccess: (newMessage) => {
      // queryClient.invalidateQueries({ queryKey: ["messages"] });
      if (onSuccess) onSuccess(newMessage);
    },
  });
};

export const useSendAIMessage = ({
  onSuccess,
}: useSendMessageProps = {}) => {
  const { user } = useAuth();
  // const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      content,
      target,
    }: {
      content: string;
      target: ChatTarget;
    }): Promise<ChatMessage> => {
      if (!user || !user?.id) {
        throw new Error("User not authenticated");
      }

      const insertedMessage = await insertMessage({
        senderId: user.id,
        target,
        content,
      });
      const aiResponse = await getAIChatResponse(insertedMessage.id);
      return aiResponse;
    },

    onSuccess: (newMessage) => {
      // queryClient.invalidateQueries({ queryKey: ["messages"] });
      if (onSuccess) onSuccess(newMessage);
    },
  });
};
