import { useMutation, useQuery } from "@tanstack/react-query";
import { useAuth } from "./useAuth";
import { supabase } from "@/integrations/supabase/client";
import { FileContentType } from "@/integrations/supabase/types";

type UploadRecordProps = {
  url: string;
  content_type?: FileContentType;
};

export const useCreateUploadRecords = () => {
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (uploads: UploadRecordProps[]) => {
      if (!user) throw new Error("User not authenticated");

      const withUser = uploads.map((u) => ({
        ...u,
        user_id: user.id,
        content_type: u.content_type ?? "uncategorized",
      }));

      const { data, error } = await supabase
        .from("cloud_uploads")
        .insert(withUser)
        .select("*");

      if (error) {
        console.error("Error inserting upload records:", error);
        throw error;
      }

      return data;
    },
  });
};

export type UploadQueryOptions = {
  content_type?: FileContentType;
  startDate?: string; // ISO string
  endDate?: string;   // ISO string
  search?: string;
  limit?: number;
  offset?: number;
  order?: "asc" | "desc";
};

export const useUploads = (options: UploadQueryOptions = {}) => {
  return useQuery({
    queryKey: ["uploads", options],
    queryFn: async () => {
      const { data: user } = await supabase.auth.getUser();
      if (!user?.user) throw new Error("User not authenticated");

      let query = supabase
        .from("cloud_uploads")
        .select("*")
        .eq("user_id", user.user.id);

      if (options.content_type) {
        query = query.eq("content_type", options.content_type);
      }

      if (options.startDate) {
        query = query.gte("upload_at", options.startDate);
      }

      if (options.endDate) {
        query = query.lte("upload_at", options.endDate);
      }

      if (options.search) {
        query = query.ilike("url", `%${options.search}%`);
      }

      if (options.limit !== undefined) {
        const from = options.offset || 0;
        const to = from + options.limit - 1;
        query = query.range(from, to);
      }

      query = query.order("upload_at", {
        ascending: options.order === "asc",
      });

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching uploads:", error);
        throw error;
      }

      return data;
    },
  });
};
