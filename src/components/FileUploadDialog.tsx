import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import React, { useId } from "react";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpload: (files: FileList) => void;

  accept?: string;
  multiple?: boolean;
  label?: string;
  hint?: string;
}

const FileUploadDialog: React.FC<Props> = ({
  open,
  onOpenChange,
  onUpload,
  accept,
  multiple = false,
  label,
  hint,
}) => {
  const inputId = useId();

  const defaultLabel = "Nhấn để chọn tệp"
  const defaultHint = multiple
    ? "Chọn nhiều tệp"
    : "Chọn một tệp";

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-[60]" />
        <Dialog.Content className="fixed left-1/2 top-1/2 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl bg-white p-6 shadow-lg z-[70]">
          <div className="flex items-center justify-between mb-4">
            <Dialog.Title className="text-lg font-medium">Tải tệp lên</Dialog.Title>
            <Dialog.Close asChild>
              <button className="text-gray-500 hover:text-gray-700">
                <X className="w-5 h-5" />
              </button>
            </Dialog.Close>
          </div>

          <label
            htmlFor={inputId}
            className="block w-full cursor-pointer rounded-lg border-2 border-dashed border-gray-300 p-4 text-center hover:bg-gray-50 transition"
          >
            <div className="text-sm text-gray-600 font-medium">
              {label ?? defaultLabel}
            </div>
            <div className="mt-1 text-xs text-gray-400">
              {hint ?? defaultHint}
            </div>
          </label>

          <input
            id={inputId}
            type="file"
            accept={accept}
            multiple={multiple}
            className="hidden"
            onChange={(e) => {
              if (e.target.files && e.target.files.length > 0) {
                onUpload(e.target.files);
                onOpenChange(false); // auto-close
              }
            }}
          />
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default FileUploadDialog;
