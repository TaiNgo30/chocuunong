import { useMutation, useQuery } from "@tanstack/react-query";
import { useAuth } from "./useAuth";
import { supabase } from "@/integrations/supabase/client";
import { FileContentType } from "@/integrations/supabase/types";

export type UploadRecordProps = {
  url: string;
  content_type?: FileContentType;
  ref?: string;
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
  user_id?: string;
  ref?: string;
  content_type?: FileContentType;
  startDate?: string; // ISO string
  endDate?: string; // ISO string
  search?: string;
  limit?: number;
  offset?: number;
  order?: "asc" | "desc";
};

export const useUploadRecords = (options: UploadQueryOptions = {}) => {
  return useQuery({
    queryKey: ["uploads", options],
    queryFn: async () => {
      let query = supabase
        .from("cloud_uploads")
        .select("*");

      if (options.user_id) {
        query = query.eq("user_id", options.user_id);
      }

      if (options.ref) {
        query = query.eq("ref", options.ref);
      }

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

export const pruneUploadRecordsByRef = async (ref: string, keepUrls: string[]) => {
  // First, get all records with that ref
  const { data: allUploads, error: fetchError } = await supabase
    .from("cloud_uploads")
    .select("id, url")
    .eq("ref", ref);

  if (fetchError) {
    console.error("Failed to fetch uploads for pruning:", fetchError);
    throw fetchError;
  }

  // Filter out those not in the keep list
  const toDelete = allUploads?.filter(upload => !keepUrls.includes(upload.url)) ?? [];

  if (toDelete.length === 0) return { deleted: 0 };

  const idsToDelete = toDelete.map(u => u.id);

  const { error: deleteError } = await supabase
    .from("cloud_uploads")
    .delete()
    .in("id", idsToDelete);

  if (deleteError) {
    console.error("Failed to delete old uploads:", deleteError);
    throw deleteError;
  }

  return { deleted: idsToDelete.length };
};
