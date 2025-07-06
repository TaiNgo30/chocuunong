import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import { useUploadRecords } from "@/hooks/useUploadRecords";
import { Database, ORDER_STATUS_LABELS } from "@/integrations/supabase/types";
import { toast } from "sonner";
import ImageLightbox from "@/components/ImageLightbox";
import { Label } from "@/components/ui/label";
import { ImageOff } from "lucide-react";
import * as Tabs from "@radix-ui/react-tabs";
import clsx from "clsx";
import OrderDetailsCard from "@/components/OrderDetailsCard";
import FilterButtons from "@/components/FilterButtons";

type Order = Database["public"]["Tables"]["orders"]["Row"];
type OrderItem = Database["public"]["Tables"]["order_items"]["Row"];
type Product = Database["public"]["Tables"]["products"]["Row"];
type Profile = Database["public"]["Tables"]["profiles"]["Row"];
type UploadRecord = Database["public"]["Tables"]["profiles"]["Row"];

export type JoinedOrder = Order & {
  order_items: (OrderItem & {
    products: Pick<Product, "name" | "image_url" | "unit" | "delivery_time">;
  })[];
  buyer: Pick<Profile, "id" | "full_name" | "phone">;
  seller: Pick<Profile, "id" | "full_name" | "phone" | "payment_description">;
};

const MyOrderFilterOptions = Object.entries(ORDER_STATUS_LABELS).filter((
  status,
) => status[0] !== "received" && status[0] !== "cancelled").map((order) => ({
  label: order[1].label,
  value: order[0],
}));
const MyOrderFilterOptionValues = MyOrderFilterOptions.map((opt) => opt.value);

// union type
type MyOrderFilterOptionsAsType = typeof MyOrderFilterOptionValues[number];

const HistoryFilterOptions = Object.entries(ORDER_STATUS_LABELS).filter((
  status,
) => status[0] === "received" || status[0] === "cancelled").map((order) => ({
  label: order[1].label,
  value: order[0],
}));
const HistoryFilterOptionValues = HistoryFilterOptions.map((opt) => opt.value);

// union type
type HistoryFilterOptionsAsType = typeof HistoryFilterOptionValues[number];

const OrderDetails = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<JoinedOrder[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<JoinedOrder>(null);
  const [loading, setLoading] = useState(false);

  const [myOrderFilterOption, setMyOrderFilterOption] = useState<
    MyOrderFilterOptionsAsType
  >(null);

  const [historyFilterOption, setHistoryFilterOption] = useState<
    HistoryFilterOptionsAsType
  >(null);

  const {
    data: fetchedQR,
    isLoading: fetchingQR,
    error: fetchingQRError,
  } = useUploadRecords({
    content_type: "payment_qr",
    user_id: selectedOrder?.seller.id,
    order: "desc",
    limit: 1,
  });

  useEffect(() => {
    if (user) fetchOrders();
  }, [user]);

  const fetchOrders = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("orders")
      .select(
        `*, order_items(*, products(name, image_url, unit, delivery_time)), buyer:buyer_id(id, full_name, phone), seller:seller_id(id, full_name, phone, payment_description)`,
      ) // join buyer profile
      .eq("buyer_id", user.id)
      .order("created_at", { ascending: false });
    if (!error) setOrders((data as unknown) as JoinedOrder[] || []);
    setLoading(false);
  };

  const formatPrice = (price) => `${Number(price).toLocaleString()}đ`;
  const formatDate = (date) =>
    new Date(date).toLocaleString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });

  const handleConfirmOrder = async () => {
    if (selectedOrder) {
      try {
        const { error } = await supabase
          .from("orders")
          .update({
            status: "received",
            updated_at: new Date().toISOString(),
          })
          .eq("id", selectedOrder.id);

        if (error) throw error;

        toast.success("Cập nhật trạng thái đơn hàng thành công");
        setSelectedOrder((prev) => {
          return ({ ...prev, status: "received" });
        });
      } catch (error) {
        console.error("Error updating order status:", error);
        toast.error("Có lỗi xảy ra khi cập nhật trạng thái");
      }
    } else {
      toast.error("Không thể cập nhật trạng thái khi chưa chọn đơn hàng!");
    }
  };

  const shouldDisplayPayment = selectedOrder?.status !== "received" &&
    selectedOrder?.status !== "cancelled";

  const contentSwitch = () => {
    if (loading) {
      return <div>Đang tải đơn hàng...</div>;
    }

    // View Order details
    if (selectedOrder) {
      return (
        <div>
          <Button
            variant="outline"
            className="mb-4"
            onClick={() => setSelectedOrder(null)}
          >
            Quay lại danh sách
          </Button>
          <div className="w-full gap-8 grid grid-cols-1 lg:grid-cols-7 gap-4">
            <OrderDetailsCard
              order={selectedOrder}
              className={shouldDisplayPayment
                ? "lg:col-span-4"
                : "lg:col-span-7"}
              onConfirmOrder={() =>
                setSelectedOrder((prev) => {
                  return ({ ...prev, status: "received" });
                })}
              onCancelOrder={() =>
                setSelectedOrder((prev) => {
                  return ({ ...prev, status: "cancelled" });
                })}
            />

            {shouldDisplayPayment &&
              (
                <Card className="lg:col-span-3">
                  <CardHeader>
                    <CardTitle>
                      Phương thức thanh toán
                    </CardTitle>
                    <CardDescription>
                      Người bán: {selectedOrder.seller.full_name}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex flex-col">
                      <div className="mb-2">
                        <b>Chi tiết phương thức:</b>
                      </div>
                      <pre className="p-2 bg-gray-50 rounded-md border-2 text-wrap">
                        {selectedOrder?.seller.payment_description}
                      </pre>

                      <div className="mt-4 mb-2">
                        <b>QR thanh toán:</b>
                      </div>
                      {fetchedQR?.[0]?.url && (
                        <ImageLightbox
                          src={fetchedQR[0].url}
                          alt={"Mã QR thanh toán"}
                          className="w-full"
                        />
                      )}

                      {!fetchedQR?.[0]?.url &&
                        (
                          <div className="px-2 py-5 text-gray-500 bg-gray-100 rounded-md flex flex-col items-center justify-center">
                            <ImageOff width={"30%"} height={"200px"} />
                            Người bán chưa cập nhật mã QR
                          </div>
                        )}
                    </div>
                  </CardContent>
                </Card>
              )}
          </div>
        </div>
      );
    }

    // View Order List
    return (
      <Tabs.Root defaultValue="my-orders" className="w-full">
        {/* Tab Labels */}
        <Tabs.List className="flex border-b">
          <Tabs.Trigger
            value="my-orders"
            className={clsx(
              "px-4 py-2 text-sm font-medium text-gray-600 data-[state=active]:border-b-2 data-[state=active]:text-green-600 border-transparent border-b-2",
              "bg-transparent",
              "data-[state=active]:bg-[linear-gradient(to_right,rgba(229,231,235,0.5)_0px,rgba(229,231,235,0.5)_6px,rgba(22,163,74,0.5)_6px,rgba(22,163,74,0.5)_9px,rgba(229,231,235,0.5)_9px,rgba(229,231,235,0.5)_100%)]",
              // Draws a gray-200/50 line when active
            )}
          >
            Đơn hàng của tôi
          </Tabs.Trigger>
          <Tabs.Trigger
            value="history"
            className={clsx(
              "px-4 py-2 text-sm font-medium text-gray-600 data-[state=active]:border-b-2 data-[state=active]:text-green-600 border-transparent border-b-2",
              "bg-transparent",
              "data-[state=active]:bg-[linear-gradient(to_right,rgba(229,231,235,0.5)_0px,rgba(229,231,235,0.5)_6px,rgba(22,163,74,0.5)_6px,rgba(22,163,74,0.5)_9px,rgba(229,231,235,0.5)_9px,rgba(229,231,235,0.5)_100%)]",
              // Draws a gray-200/50 line when active
            )}
          >
            Lịch sử mua hàng
          </Tabs.Trigger>
        </Tabs.List>

        {/* Tab Content */}
        <Tabs.Content value="my-orders" className="p-4">
          <FilterButtons
            options={MyOrderFilterOptions}
            value={myOrderFilterOption}
            onSelect={(value) => setMyOrderFilterOption(value)}
            listClass="mb-5"
          />
          <div className="grid gap-6 max-w-3xl mx-auto">
            {orders.length === 0 && (
              <div className="text-center">Bạn chưa có đơn hàng nào.</div>
            )}
            {orders.filter((order) =>
              myOrderFilterOption
                ? (order.status === myOrderFilterOption)
                : (order.status !== "received" && order.status !== "cancelled")
            ).map((order) => (
              <Card
                key={order.id}
                className="cursor-pointer hover:shadow-lg transition border-l-4 border-green-500"
                onClick={() => setSelectedOrder(order)}
              >
                <CardHeader className="flex flex-row items-center gap-4">
                  {order.order_items &&
                    order.order_items[0]?.products?.image_url && (
                      <img
                        src={order.order_items[0].products.image_url}
                        alt={order.order_items[0].products.name}
                        className="w-16 h-16 object-cover rounded"
                      />
                    )}
                  <div className="flex-1">
                    <CardTitle className="text-lg">
                      Đơn hàng{" "}
                      <span className="font-mono">
                        #{order.id.slice(0, 8).toUpperCase()}
                      </span>
                    </CardTitle>
                    <CardDescription>
                      Ngày đặt: {formatDate(order.created_at)}
                    </CardDescription>
                    <div className="flex flex-wrap gap-2 mt-2">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold ${ORDER_STATUS_LABELS[order.status]?.color ||
                          "bg-gray-200 text-gray-700"
                          }`}
                      >
                        {ORDER_STATUS_LABELS[order.status]?.label ||
                          order.status}
                      </span>
                      <span className="px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-700 font-mono">
                        {formatPrice(order.total_amount)}
                      </span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {order.order_items && order.order_items.length > 0 && (
                    <div className="flex items-center gap-4">
                      <div>
                        <div className="font-medium">
                          {order.order_items[0].products?.name}
                        </div>
                        <div className="text-xs text-gray-500">
                          Số lượng: {order.order_items[0].quantity}{" "}
                          {order.order_items[0].products?.unit}
                        </div>
                        <div className="text-xs text-gray-500">
                          Giá: {formatPrice(order.order_items[0].price)}
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </Tabs.Content>
        <Tabs.Content value="history" className="p-4">
          <FilterButtons
            options={HistoryFilterOptions}
            value={historyFilterOption}
            onSelect={(value) => setHistoryFilterOption(value)}
            listClass="mb-5"
          />
          <div className="grid gap-6 max-w-3xl mx-auto">
            {orders.length === 0 && (
              <div className="text-center">Bạn chưa có đơn hàng nào.</div>
            )}
            {orders
              .filter((order) =>
                historyFilterOption
                  ? (order.status === historyFilterOption)
                  : (order.status === "received" ||
                    order.status === "cancelled")
              )
              .map((order) => (
                <Card
                  key={order.id}
                  className="cursor-pointer hover:shadow-lg transition border-l-4 border-green-500"
                  onClick={() => setSelectedOrder(order)}
                >
                  <CardHeader className="flex flex-row items-center gap-4">
                    {order.order_items &&
                      order.order_items[0]?.products?.image_url && (
                        <img
                          src={order.order_items[0].products.image_url}
                          alt={order.order_items[0].products.name}
                          className="w-16 h-16 object-cover rounded"
                        />
                      )}
                    <div className="flex-1">
                      <CardTitle className="text-lg">
                        Đơn hàng{" "}
                        <span className="font-mono">
                          #{order.id.slice(0, 8).toUpperCase()}
                        </span>
                      </CardTitle>
                      <CardDescription>
                        Ngày đặt: {formatDate(order.created_at)}
                      </CardDescription>
                      <div className="flex flex-wrap gap-2 mt-2">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-semibold ${ORDER_STATUS_LABELS[order.status]?.color ||
                            "bg-gray-200 text-gray-700"
                            }`}
                        >
                          {ORDER_STATUS_LABELS[order.status]?.label ||
                            order.status}
                        </span>
                        <span className="px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-700 font-mono">
                          {formatPrice(order.total_amount)}
                        </span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {order.order_items && order.order_items.length > 0 && (
                      <div className="flex items-center gap-4">
                        <div>
                          <div className="font-medium">
                            {order.order_items[0].products?.name}
                          </div>
                          <div className="text-xs text-gray-500">
                            Số lượng: {order.order_items[0].quantity}{" "}
                            {order.order_items[0].products?.unit}
                          </div>
                          <div className="text-xs text-gray-500">
                            Giá: {formatPrice(order.order_items[0].price)}
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
          </div>
        </Tabs.Content>
      </Tabs.Root>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="container mx-auto px-4 py-8">
        {contentSwitch()}
      </div>
    </div>
  );
};

export default OrderDetails;
