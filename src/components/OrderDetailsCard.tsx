import clsx from "clsx";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { JoinedOrder } from "@/pages/Orders";
import { ORDER_STATUS_LABELS } from "@/integrations/supabase/types";
import { useMemo, useState } from "react";
import { Button } from "./ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import * as Dialog from "@radix-ui/react-dialog";

interface OrderDetailsCardProps {
  order: JoinedOrder;
  onConfirmOrder?: () => void;
  onCancelOrder?: () => void;
  className?: string;
}

const formatPrice = (price) => `${Number(price).toLocaleString()}đ`;
const formatDate = (date) =>
  new Date(date).toLocaleString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

// Timeline steps
const steps = [
  { key: "pending", label: "Chờ xác nhận" },
  { key: "processing", label: "Đang xử lý" },
  { key: "shipping", label: "Đang giao" },
  { key: "delivered", label: "Đã giao" },
  { key: "received", label: "Đã nhận" },
  { key: "cancelled", label: "Đã hủy" },
];

const OrderDetailsCard = (
  { order, onConfirmOrder, onCancelOrder, className }: OrderDetailsCardProps,
) => {
  const deliveryTime = useMemo(() => {
    const deliveryTimes = order?.order_items.map((item) =>
      item.products.delivery_time
    );

    // Just get the highest value for as long as the criteria is not defined
    if (deliveryTimes && deliveryTimes.length > 0) {
      // return Math.max(...deliveryTimes);
      return deliveryTimes.reduce((a, b) => (b > a ? b : a), "");
    } else return null;
  }, [order?.order_items]);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<
    "confirm" | "cancel" | null
  >(null);

  const handleConfirmOrder = async () => {
    if (order) {
      try {
        const { error } = await supabase
          .from("orders")
          .update({
            status: "received",
            updated_at: new Date().toISOString(),
          })
          .eq("id", order.id);

        if (error) throw error;

        toast.success("Cập nhật trạng thái đơn hàng thành công");
        if (onConfirmOrder) onConfirmOrder();
      } catch (error) {
        console.error("Error updating order status:", error);
        toast.error("Có lỗi xảy ra khi cập nhật trạng thái");
      }
    } else {
      toast.error("Không thể cập nhật trạng thái khi chưa chọn đơn hàng!");
    }
  };

  const handleCancelOrder = async () => {
    if (order) {
      try {
        const { error } = await supabase
          .from("orders")
          .update({
            status: "cancelled",
            updated_at: new Date().toISOString(),
          })
          .eq("id", order.id);

        if (error) throw error;

        toast.success("Cập nhật trạng thái đơn hàng thành công");
        if (onCancelOrder) onCancelOrder();
      } catch (error) {
        console.error("Error updating order status:", error);
        toast.error("Có lỗi xảy ra khi cập nhật trạng thái");
      }
    } else {
      toast.error("Không thể cập nhật trạng thái khi chưa chọn đơn hàng!");
    }
  };

  return (
    <Card
      className={clsx(
        "flex flex-col",
        order?.status === "received"
          ? "border-green-500"
          : order?.status === "cancelled"
            ? "border-red-500"
            : "",
        className,
      )}
    >
      <CardHeader>
        <CardTitle>
          Đơn hàng{" "}
          <span className="font-mono text-base text-gray-500">
            #{order.id.slice(0, 8).toUpperCase()}
          </span>
        </CardTitle>
        <CardDescription>
          Ngày đặt: {formatDate(order.created_at)}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 flex flex-col grow">
        <div className="flex flex-wrap gap-4 mb-2">
          <span
            className={`px-3 py-1 rounded-full font-semibold ${ORDER_STATUS_LABELS[order.status]?.color ||
              "bg-gray-200 text-gray-700"
              }`}
          >
            {ORDER_STATUS_LABELS[order.status]?.label ||
              order.status}
          </span>
          <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-700 font-mono">
            Tổng tiền: {formatPrice(order?.total_amount)}
          </span>
          <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-700">
            {order.payment_method === "cod"
              ? "Thanh toán khi nhận hàng (COD)"
              : order.payment_method}
          </span>
        </div>
        <div className="mb-2">
          <b>Địa chỉ giao hàng:</b> {order.shipping_address}
        </div>
        <div className="mb-2">
          <b>Số điện thoại:</b> {order.shipping_phone}
        </div>
        {deliveryTime && (
          <div className="mb-2">
            <b>Thời gian giao hàng dự kiến:</b> {deliveryTime}
          </div>
        )}
        <div className="mb-2">
          <b>Chi tiết sản phẩm:</b>
          <div className="space-y-2 mt-2">
            {order.order_items.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-4 border p-2 rounded bg-white shadow-sm"
              >
                {item.products?.image_url && (
                  <img
                    src={item.products.image_url}
                    alt={item.products.name}
                    className="w-16 h-16 object-cover rounded"
                  />
                )}
                <div>
                  <div className="font-medium">
                    {item.products?.name}
                  </div>
                  <div>
                    Số lượng: {item.quantity} {item.products?.unit}
                  </div>
                  <div>Giá: {formatPrice(item.price)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="mb-2 flex flex-col">
          <b>Tiến trình giao hàng:</b>
          <div className="flex flex-col gap-2 mt-2">
            {steps.filter((s) => s.key !== "cancelled").map((
              step,
              idx,
            ) => (
              <div
                key={step.key}
                className="flex items-center gap-2"
              >
                <div
                  className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${steps.indexOf(steps.find((stp) =>
                    stp.key === order.status
                  )) >= idx
                      ? "bg-green-500 border-green-500"
                      : "bg-gray-200 border-gray-300"
                    }`}
                >
                </div>
                <span
                  className={order.status === step.key
                    ? "font-bold text-green-700"
                    : "text-gray-700"}
                >
                  {step.label}
                </span>
              </div>
            ))}
            {order.status === "cancelled" && (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full border-2 bg-red-500 border-red-500">
                </div>
                <span className="font-bold text-red-700">
                  Đã hủy
                </span>
              </div>
            )}
          </div>
        </div>
        <div className="grow" />
        <div className="flex gap-2">
          {order.status === "delivered" && (
            <Button
              className="bg-green-600 hover:bg-green-700"
              onClick={() => {
                setPendingAction("confirm");
                setDialogOpen(true);
              }}
            >
              Đã nhận hàng
            </Button>
          )}

          {(order.status !== "received" && order.status !== "cancelled") &&
            (
              <Button
                className="bg-red-600 hover:bg-red-700"
                onClick={() => {
                  setPendingAction("cancel");
                  setDialogOpen(true);
                }}
              >
                {order.status == "delivered"
                  ? "Trả lại đơn hàng"
                  : "Hủy đơn hàng"}
              </Button>
            )}

          <Dialog.Root open={dialogOpen} onOpenChange={setDialogOpen}>
            <Dialog.Portal>
              <Dialog.Overlay className="fixed inset-0 bg-black/40" />
              <Dialog.Content className="bg-white rounded shadow p-6 fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col gap-4 z-50 min-w-[320px]">
                <Dialog.Title className="font-bold text-lg">
                  Xác nhận{" "}
                  {pendingAction === "confirm" ? "nhận hàng" : "hủy đơn"}
                </Dialog.Title>
                <Dialog.Description>
                  {pendingAction === "confirm"
                    ? "Bạn xác nhận đã nhận được hàng và muốn hoàn tất đơn này?"
                    : "Bạn chắc chắn muốn hủy đơn hàng này?"}
                </Dialog.Description>
                <div className="flex justify-end gap-2 mt-4">
                  <Dialog.Close asChild>
                    <Button variant="outline">Thoát</Button>
                  </Dialog.Close>
                  <Button
                    className={pendingAction === "confirm"
                      ? "bg-green-600 hover:bg-green-700"
                      : "bg-red-600 hover:bg-red-700"}
                    onClick={async () => {
                      setDialogOpen(false);
                      if (pendingAction === "confirm") {
                        await handleConfirmOrder();
                      } else if (pendingAction === "cancel") {
                        await handleCancelOrder();
                      }
                    }}
                  >
                    {pendingAction === "confirm" ? "Xác nhận" : "Hủy đơn"}
                  </Button>
                </div>
              </Dialog.Content>
            </Dialog.Portal>
          </Dialog.Root>
        </div>
      </CardContent>
    </Card>
  );
};

export default OrderDetailsCard;
