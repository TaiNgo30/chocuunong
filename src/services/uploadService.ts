import { supabase } from "@/integrations/supabase/client";

// See service at https://github.com/Quatn/s3_upload_service
export type UploadedFileInfo = {
  file: string;
  url: string;
};

export const uploadFilesToService = async (
  files: File[],
  saveDir: string,
): Promise<UploadedFileInfo[]> => {
  const session = await supabase.auth.getSession();
  const token = session.data.session?.access_token;

  const url = `${import.meta.env.VITE_UPLOAD_SERVICE_URL}/uploads`;

  const formData = new FormData();
  files.forEach((file) => formData.append("files", file));
  formData.append("saveDir", saveDir);

  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Upload failed: ${res.status} - ${text}`);
  }

  const data = await res.json();
  return data.files as UploadedFileInfo[];
};
