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
import { Database } from "@/integrations/supabase/types";
import { toast } from "sonner";
import ImageLightbox from "@/components/ImageLightbox";
import { Label } from "@/components/ui/label";
import { ImageOff } from "lucide-react";

type Order = Database["public"]["Tables"]["orders"]["Row"];
type OrderItem = Database["public"]["Tables"]["order_items"]["Row"];
type Product = Database["public"]["Tables"]["products"]["Row"];
type Profile = Database["public"]["Tables"]["profiles"]["Row"];
type UploadRecord = Database["public"]["Tables"]["profiles"]["Row"];

type JoinedOrder = Order & {
  order_items: (OrderItem & {
    products: Pick<Product, "name" | "image_url" | "unit">;
  })[];
  buyer: Pick<Profile, "id" | "full_name" | "phone">;
  seller: Pick<Profile, "id" | "full_name" | "phone" | "payment_description">;
};

const ORDER_STATUS = {
  pending: { label: "Chờ xác nhận", color: "text-yellow-600 bg-yellow-100" },
  confirmed: { label: "Đã xác nhận", color: "text-blue-600 bg-blue-100" },
  processing: { label: "Đang xử lý", color: "text-purple-600 bg-purple-100" },
  shipping: { label: "Đang giao", color: "text-orange-600 bg-orange-100" },
  delivered: { label: "Đã giao", color: "text-green-600 bg-green-100" },
  cancelled: { label: "Đã hủy", color: "text-red-600 bg-red-100" },
};

const Orders = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState<JoinedOrder>(null);
  const [loading, setLoading] = useState(false);

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
        `*, order_items(*, products(name, image_url, unit)), buyer:buyer_id(id, full_name, phone), seller:seller_id(id, full_name, phone, payment_description)`,
      ) // join buyer profile
      .eq("buyer_id", user.id)
      .order("created_at", { ascending: false });
    if (!error) setOrders(data || []);
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

  // Timeline steps
  const steps = [
    { key: "pending", label: "Chờ xác nhận" },
    { key: "processing", label: "Đang xử lý" },
    { key: "shipping", label: "Đang giao" },
    { key: "delivered", label: "Đã giao" },
    { key: "cancelled", label: "Đã hủy" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Đơn hàng của tôi</h1>
        {loading ? <div>Đang tải đơn hàng...</div> : selectedOrder
          ? (
            <div>
              <Button
                variant="outline"
                className="mb-4"
                onClick={() => setSelectedOrder(null)}
              >
                Quay lại danh sách
              </Button>
              <div className="w-full gap-8 grid grid-cols-1 lg:grid-cols-7 gap-4">
                <Card className="lg:col-span-4">
                  <CardHeader>
                    <CardTitle>
                      Đơn hàng{" "}
                      <span className="font-mono text-base text-gray-500">
                        #{selectedOrder.id.slice(0, 8).toUpperCase()}
                      </span>
                    </CardTitle>
                    <CardDescription>
                      Ngày đặt: {formatDate(selectedOrder.created_at)}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex flex-wrap gap-4 mb-2">
                      <span
                        className={`px-3 py-1 rounded-full font-semibold ${ORDER_STATUS[selectedOrder.status]?.color ||
                          "bg-gray-200 text-gray-700"
                          }`}
                      >
                        {ORDER_STATUS[selectedOrder.status]?.label ||
                          selectedOrder.status}
                      </span>
                      <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-700 font-mono">
                        Tổng tiền: {formatPrice(selectedOrder?.total_amount)}
                      </span>
                      <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-700">
                        {selectedOrder.payment_method === "cod"
                          ? "Thanh toán khi nhận hàng (COD)"
                          : selectedOrder.payment_method}
                      </span>
                    </div>
                    <div className="mb-2">
                      <b>Địa chỉ giao hàng:</b> {selectedOrder.shipping_address}
                    </div>
                    <div className="mb-2">
                      <b>Số điện thoại:</b> {selectedOrder.shipping_phone}
                    </div>
                    {selectedOrder.delivery_time && (
                      <div className="mb-2">
                        <b>Thời gian giao hàng dự kiến:</b>{" "}
                        {selectedOrder.delivery_time}
                      </div>
                    )}
                    <div className="mb-2">
                      <b>Chi tiết sản phẩm:</b>
                      <div className="space-y-2 mt-2">
                        {selectedOrder.order_items.map((item) => (
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
                    <div className="mb-2">
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
                              className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${selectedOrder.status === step.key ||
                                  (step.key === "delivered" &&
                                    selectedOrder.status === "delivered") ||
                                  (step.key === "shipping" &&
                                    selectedOrder.status === "delivered") ||
                                  (step.key === "processing" &&
                                    (selectedOrder.status === "shipping" ||
                                      selectedOrder.status === "delivered"))
                                  ? "bg-green-500 border-green-500"
                                  : "bg-gray-200 border-gray-300"
                                }`}
                            >
                            </div>
                            <span
                              className={selectedOrder.status === step.key
                                ? "font-bold text-green-700"
                                : "text-gray-700"}
                            >
                              {step.label}
                            </span>
                          </div>
                        ))}
                        {selectedOrder.status === "cancelled" && (
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
                  </CardContent>
                </Card>

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
                      <pre className="p-2 bg-gray-50 rounded-md border-2">
                        {selectedOrder?.seller.payment_description}
                      </pre>

                      <div className="mt-4 mb-2">
                        <b>QR thanh toán:</b>
                      </div>
                      {fetchedQR?.[0]?.url && <ImageLightbox
                        src={fetchedQR[0].url}
                        alt={"Mã QR thanh toán"}
                        className="w-full"
                      />}

                      {!fetchedQR?.[0]?.url && 
                      <div className="px-2 py-5 text-gray-500 bg-gray-100 rounded-md flex flex-col items-center justify-center">
                        <ImageOff width={"30%"} height={"200px"}/>
                        Người bán chưa cập nhật mã QR
                      </div>
                      }
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )
          : (
            <div className="grid gap-6 max-w-3xl mx-auto">
              {orders.length === 0 && <div>Bạn chưa có đơn hàng nào.</div>}
              {orders.map((order) => (
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
                          className={`px-2 py-1 rounded-full text-xs font-semibold ${ORDER_STATUS[order.status]?.color ||
                            "bg-gray-200 text-gray-700"
                            }`}
                        >
                          {ORDER_STATUS[order.status]?.label || order.status}
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
          )}
      </div>
    </div>
  );
};

export default Orders;

