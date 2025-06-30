import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import Header from "@/components/Header";
import {
  DollarSign,
  Eye,
  Package,
  Plus,
  TrendingUp,
  Users,
  X,
} from "lucide-react";
import { OrderStatus } from "@/integrations/supabase/types";
import OrderStatusAction from "@/components/sellerdashboard/OrderStatusAction";
import * as Tabs from "@radix-ui/react-tabs";
import clsx from "clsx";
import * as Dialog from "@radix-ui/react-dialog";
import { JoinedOrder } from "./Orders";
import OrderDetailsCard from "@/components/OrderDetailsCard";

const SellerDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState<JoinedOrder[]>([]);
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    totalViews: 0,
  });
  const [loading, setLoading] = useState(true);
  const [orderHistoryOpen, setOrderHistoryOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<JoinedOrder>();

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }

    fetchSellerData();
  }, [user, navigate]);

  const fetchSellerData = async () => {
    if (!user) return;

    setLoading(true);

    try {
      // Fetch products
      const { data: productsData, error: productsError } = await supabase
        .from("products")
        .select("*")
        .eq("seller_id", user.id)
        .order("created_at", { ascending: false });

      if (productsError) throw productsError;

      // Fetch orders
      const { data: ordersData, error: ordersError } = await supabase
        .from("orders")
        .select(`
          *,
          buyer:buyer_id(id, full_name, phone),
          order_items(*, products(name, image_url, unit, delivery_time)),
          seller:seller_id(id, full_name, phone, payment_description)
        `)
        .eq("seller_id", user.id)
        .order("created_at", { ascending: false });

      if (ordersError) throw ordersError;

      setProducts(productsData || []);
      setOrders((ordersData as unknown) as JoinedOrder[] || []);

      // Calculate stats
      const totalProducts = productsData?.length || 0;
      const totalOrders = ordersData?.length || 0;
      const totalRevenue = ordersData?.reduce((sum, order) =>
        sum + order.total_amount, 0) || 0;
      const totalViews = productsData?.reduce((sum, product) =>
        sum + (product.views || 0), 0) || 0;

      setStats({
        totalProducts,
        totalOrders,
        totalRevenue,
        totalViews,
      });
    } catch (error) {
      console.error("Error fetching seller data:", error);
      toast.error("Có lỗi xảy ra khi tải dữ liệu");
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: OrderStatus) => {
    try {
      const { error } = await supabase
        .from("orders")
        .update({
          status: newStatus,
          updated_at: new Date().toISOString(),
        })
        .eq("id", orderId);

      if (error) throw error;

      toast.success("Cập nhật trạng thái đơn hàng thành công");
      fetchSellerData();
    } catch (error) {
      console.error("Error updating order status:", error);
      toast.error("Có lỗi xảy ra khi cập nhật trạng thái");
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: {
        label: "Chờ xác nhận",
        className: "bg-yellow-100 bg-yellow-200 text-yellow-800",
      },
      confirmed: {
        label: "Đã xác nhận",
        className: "bg-blue-100 bg-blue-200 text-blue-800",
      },
      processing: {
        label: "Đang xử lý",
        className: "bg-purple-100 bg-purple-200 text-purple-800",
      },
      shipping: {
        label: "Đang giao hàng",
        className: "bg-orange-100 bg-orange-200 text-orange-800",
      },
      delivered: {
        label: "Đã giao hàng",
        className: "bg-green-100 bg-green-200 text-green-800",
      },
      received: {
        label: "Đã nhận hàng",
        className: "bg-green-600 hover:bg-green-500 text-white",
      },
      cancelled: { label: "Đã hủy", className: "bg-red-100 text-red-800" },
    };

    const config = statusConfig[status] || statusConfig.pending;
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  const getProductStatusBadge = (status: string) => {
    const statusConfig = {
      pending: {
        label: "Chờ duyệt",
        className: "bg-yellow-100 text-yellow-800",
      },
      approved: { label: "Đã duyệt", className: "bg-green-100 text-green-800" },
      rejected: { label: "Bị từ chối", className: "bg-red-100 text-red-800" },
      sold_out: { label: "Hết hàng", className: "bg-gray-100 text-gray-800" },
    };

    const config = statusConfig[status] || statusConfig.pending;
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white p-6 rounded-lg shadow h-32">
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">
            Dashboard Người Bán
          </h1>
          <Link to="/seller/add-product">
            <Button className="bg-green-600 hover:bg-green-700">
              <Plus className="h-4 w-4 mr-2" />
              Đăng sản phẩm mới
            </Button>
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Tổng sản phẩm
              </CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalProducts}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Tổng đơn hàng
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalOrders}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Tổng doanh thu
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatPrice(stats.totalRevenue)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Lượt xem</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalViews}</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Orders */}
          <Card>
            <CardHeader>
              <CardTitle>
                <div className="flex justify-between items-center">
                  Đơn hàng gần đây

                  <Button
                    onClick={() => setOrderHistoryOpen(true)}
                    className="bg-gray-300 hover:bg-gray-400 text-black"
                  >
                    Lịch sử đơn hàng
                  </Button>
                </div>
              </CardTitle>
              <CardDescription>
                Quản lý các đơn hàng từ khách hàng
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {orders.filter((order) =>
                  order.status !== "received" &&
                  order.status !== "cancelled"
                ).slice(0, 5).map((order) => (
                  <div
                    key={order.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium">
                          {order.buyer?.full_name}
                        </p>
                        {getStatusBadge(order.status)}
                      </div>
                      <p className="text-sm text-gray-600">
                        {formatPrice(order.total_amount)} •{" "}
                        {new Date(order.created_at).toLocaleDateString(
                          "vi-VN",
                        )}
                      </p>
                      <p className="text-xs text-gray-500">
                        {order.order_items?.length} sản phẩm
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <OrderStatusAction
                        orderStatus={order.status}
                        updateOrderStatus={(value) =>
                          updateOrderStatus(order.id, value as OrderStatus)}
                        buttonClass="px-2 py-1 text-sm"
                      />
                      <button
                        onClick={() => {
                          updateOrderStatus(order.id, "cancelled");
                        }}
                        className="px-2 py-1 text-sm text-white rounded-md bg-red-600 hover:bg-red-500 transition"
                      >
                        Hủy đơn hàng
                      </button>
                    </div>
                  </div>
                ))}

                {orders.filter((order) =>
                  order.status !== "received" &&
                  order.status !== "cancelled"
                ).length === 0 && (
                    <p className="text-center text-gray-500 py-8">
                      Không có đơn hàng nào gần đây
                    </p>
                  )}

                <Dialog.Root
                  open={orderHistoryOpen}
                  onOpenChange={setOrderHistoryOpen}
                >
                  <Dialog.Portal>
                    <Dialog.Overlay className="fixed inset-0 bg-black/50 z-[60]" />
                    <Dialog.Content className="fixed flex flex-col left-1/2 top-1/2 w-full max-w-4xl max-h-[90vh] -translate-x-1/2 -translate-y-1/2 rounded-xl bg-white p-6 shadow-lg z-[70]">
                      <div className="flex items-center justify-between mb-4">
                        <Dialog.Title className="text-lg font-bold">
                          {selectedOrder
                            ? "Chi tiết đơn hàng"
                            : "Lịch sử đơn hàng"}
                        </Dialog.Title>
                        <Dialog.Close asChild>
                          <button className="text-gray-500 hover:text-gray-700">
                            <X className="w-5 h-5" />
                          </button>
                        </Dialog.Close>
                      </div>

                      {selectedOrder && (
                        <div className="space-y-4 overflow-auto">
                          <Button
                            variant="outline"
                            className="bg-gray-200 hover:bg-gray-300 text-black"
                            onClick={() => setSelectedOrder(null)}
                          >
                            Quay lại danh sách
                          </Button>
                          <OrderDetailsCard
                            order={selectedOrder}
                          />
                        </div>
                      )}

                      {!selectedOrder &&
                        (
                          <div className="space-y-4 overflow-auto">
                            {orders.filter((order) =>
                              order.status === "received" ||
                              order.status === "cancelled"
                            ).map((order) => (
                              <div
                                key={order.id}
                                className="flex items-center justify-between p-4 border rounded-lg"
                              >
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <p className="font-medium">
                                      {order.buyer?.full_name}
                                    </p>
                                    {getStatusBadge(order.status)}
                                  </div>
                                  <p className="text-sm text-gray-600">
                                    {formatPrice(order.total_amount)} •{" "}
                                    {new Date(order.created_at)
                                      .toLocaleDateString(
                                        "vi-VN",
                                      )}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    {order.order_items?.length} sản phẩm
                                  </p>
                                </div>

                                <Button
                                  onClick={() => setSelectedOrder(order)}
                                  className="bg-gray-300 hover:bg-gray-400 text-black"
                                >
                                  Xem chi tiết
                                </Button>
                              </div>
                            ))}

                            {orders.filter((order) =>
                              order.status === "received" ||
                              order.status === "cancelled"
                            ).length === 0 && (
                                <p className="text-center text-gray-500 py-8">
                                  Chưa có đơn hàng nào
                                </p>
                              )}
                          </div>
                        )}
                    </Dialog.Content>
                  </Dialog.Portal>
                </Dialog.Root>
              </div>
            </CardContent>
          </Card>

          {/* Recent Products */}
          <Card>
            <CardHeader>
              <CardTitle>Sản phẩm gần đây</CardTitle>
              <CardDescription>Quản lý sản phẩm của bạn</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {products.slice(0, 5).map((product) => (
                  <div
                    key={product.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center gap-4">
                      {product.image_url && (
                        <img
                          src={product.image_url}
                          alt={product.name}
                          className="w-12 h-12 object-cover rounded"
                        />
                      )}
                      <div>
                        <p className="font-medium">{product.name}</p>
                        <p className="text-sm text-gray-600">
                          {formatPrice(product.price)} • {product.quantity}{" "}
                          {product.unit}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          {getProductStatusBadge(product.status)}
                          <span className="text-xs text-gray-500">
                            {product.views || 0} lượt xem
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2 items-end">
                      <Select
                        value={product.status}
                        onValueChange={async (value) => {
                          try {
                            const statusValue = value as
                              | "pending"
                              | "approved"
                              | "rejected"
                              | "sold_out";
                            const { error } = await supabase
                              .from("products")
                              .update({ status: statusValue })
                              .eq("id", product.id);
                            if (error) throw error;
                            toast.success(
                              "Cập nhật trạng thái sản phẩm thành công",
                            );
                            fetchSellerData();
                          } catch (error) {
                            toast.error("Có lỗi khi cập nhật trạng thái");
                          }
                        }}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Chờ duyệt</SelectItem>
                          <SelectItem value="approved">Đã duyệt</SelectItem>
                          <SelectItem value="rejected">Bị từ chối</SelectItem>
                          <SelectItem value="sold_out">Hết hàng</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          navigate(`/seller/edit-product/${product.id}`)}
                      >
                        Chỉnh sửa
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={async () => {
                          if (
                            window.confirm("Bạn có chắc muốn xóa sản phẩm này?")
                          ) {
                            try {
                              const { error } = await supabase
                                .from("products")
                                .delete()
                                .eq("id", product.id);
                              if (error) throw error;
                              toast.success("Đã xóa sản phẩm");
                              fetchSellerData();
                            } catch (error) {
                              toast.error("Có lỗi khi xóa sản phẩm");
                            }
                          }
                        }}
                      >
                        Xóa
                      </Button>
                    </div>
                  </div>
                ))}

                {products.length === 0 && (
                  <div className="text-center py-8">
                    <p className="text-gray-500 mb-4">Chưa có sản phẩm nào</p>
                    <Link to="/seller/add-product">
                      <Button className="bg-green-600 hover:bg-green-700">
                        Đăng sản phẩm đầu tiên
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SellerDashboard;
