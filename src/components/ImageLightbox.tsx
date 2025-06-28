import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import React, { useState } from 'react';

interface Props {
  src: string;
  alt?: string;
  onRemove?: () => void;
  className?: string;
}

const ImageLightbox: React.FC<Props> = ({ src, alt = '', onRemove, className }) => {
  const [open, setOpen] = useState(false);

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <div className={`relative inline-block cursor-pointer ${className}`}>
          <img
            src={src}
            alt={alt}
            className="object-cover rounded-md w-full h-full"
          />

          {onRemove && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation(); // prevent dialog open
                onRemove();
              }}
              className="absolute -top-4 -right-4 bg-gray-200/50 text-red-500 rounded-full p-1 hover:bg-gray-500/50 z-10"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay onClick={() => setOpen(false)} className="fixed inset-0 bg-black/60 z-[60]" />
        <Dialog.Content className="fixed inset-0 flex items-center justify-center z-[70]">
          <div className="relative max-w-full max-h-full p-4">
            <Dialog.Close asChild>
              <button
                className="absolute -top-4 -right-4 text-white hover:bg-black/30 p-2 rounded-full z-20"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </Dialog.Close>

            <img
              src={src}
              alt={alt}
              className="max-h-[90vh] max-w-[90vw] object-contain rounded-lg"
            />
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default ImageLightbox;
