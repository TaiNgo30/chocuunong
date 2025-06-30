import * as Dialog from "@radix-ui/react-dialog";
import { useState } from "react";
import { X } from "lucide-react";
import { OrderStatus } from "@/integrations/supabase/types";
import clsx from "clsx";

interface Props {
  orderStatus?: OrderStatus;
  updateOrderStatus: (newStatus: OrderStatus) => void;
  buttonClass?: string;
}

const statusFlow: Record<OrderStatus, {
  next?: OrderStatus;
  buttonLabel: string;
  dialogText: string;
  confirmText: string;
  cancelText: string;
}> = {
  pending: {
    next: "shipping", // Step skip
    buttonLabel: "Xác nhận",
    dialogText: "Xác nhận đơn hàng và tiến hành giao hàng?",
    confirmText: "Xác nhận",
    cancelText: "Hủy",
  },
  confirmed: {
    next: "processing",
    buttonLabel: "Xử lý đơn hàng",
    dialogText: "Bắt đầu xử lý đơn hàng?",
    confirmText: "Xác nhận",
    cancelText: "Hủy",
  },
  processing: {
    next: "shipping",
    buttonLabel: "Giao hàng",
    dialogText: "Bắt đầu giao hàng?",
    confirmText: "Xác nhận",
    cancelText: "Hủy",
  },
  shipping: {
    next: "delivered",
    buttonLabel: "Xác nhận đã giao hàng",
    dialogText: "Cập nhật trạng thái thành đã giao hàng?",
    confirmText: "Xác nhận",
    cancelText: "Hủy",
  },
  delivered: {
    buttonLabel: "Đang chờ khách hàng xác nhận",
    dialogText: "",
    confirmText: "",
    cancelText: "",
  },
  received: {
    buttonLabel: "Đơn hàng đã hoàn thành",
    dialogText: "",
    confirmText: "",
    cancelText: "",
  },
  cancelled: {
    buttonLabel: "Đơn hàng đã bị hủy",
    dialogText: "",
    confirmText: "",
    cancelText: "",
  },
};

const OrderStatusAction: React.FC<Props> = (
  { orderStatus, updateOrderStatus, buttonClass },
) => {
  const [open, setOpen] = useState(false);

  const config = statusFlow[orderStatus];
  const disabled = !config?.next;

  if (!orderStatus || !config) {
    return <p>{JSON.stringify(orderStatus)}</p>;
  }

  if (disabled) {
    return (
      <button
        disabled
        className={clsx(
          "px-4 py-2 rounded-md bg-gray-200 text-gray-500 cursor-not-allowed",
          buttonClass,
        )}
      >
        {config.buttonLabel}
      </button>
    );
  }

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <button
          className={clsx(
            "px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700",
            buttonClass,
          )}
        >
          {config.buttonLabel}
        </button>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-50" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-[60] -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-lg p-6 w-[90vw] max-w-md">
          <div className="flex flex-row justify-between items-center mb-4">
            <Dialog.Title className="text-lg font-semibold">
              Cập nhật trạng thái đơn hàng
            </Dialog.Title>
            <Dialog.Close asChild>
              <button className="text-gray-500 hover:text-gray-700">
                <X className="w-5 h-5" />
              </button>
            </Dialog.Close>
          </div>

          <Dialog.Content>
            {config.dialogText}
          </Dialog.Content>

          <div className="mt-6 flex justify-end gap-3">
            <Dialog.Close asChild>
              <button className="px-3 py-2 rounded-md bg-gray-200 text-gray-700 hover:bg-gray-300">
                {config.cancelText}
              </button>
            </Dialog.Close>

            <button
              onClick={() => {
                if (config.next) {
                  updateOrderStatus(config.next);
                  setOpen(false);
                }
              }}
              className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700"
            >
              {config.confirmText}
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default OrderStatusAction;
