
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Minus, Plus, Trash2, ShoppingCart } from "lucide-react";
import Header from "@/components/Header";
import { toast } from "sonner";

const Cart = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (user) {
      fetchCartItems();
    }
  }, [user]);

  const fetchCartItems = async () => {
    try {
      const { data, error } = await supabase
        .from('cart_items')
        .select(`
          *,
          products(
            *,
            profiles:seller_id(full_name)
          )
        `)
        .eq('user_id', user?.id);

      if (error) throw error;
      setCartItems(data || []);
    } catch (error) {
      console.error('Error fetching cart items:', error);
      toast.error('Lỗi khi tải giỏ hàng');
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (itemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeItem(itemId);
      return;
    }

    setUpdating(true);
    try {
      const { error } = await supabase
        .from('cart_items')
        .update({ quantity: newQuantity })
        .eq('id', itemId);

      if (error) throw error;
      
      setCartItems(cartItems.map((item: any) => 
        item.id === itemId ? { ...item, quantity: newQuantity } : item
      ));
    } catch (error) {
      console.error('Error updating quantity:', error);
      toast.error('Lỗi khi cập nhật số lượng');
    } finally {
      setUpdating(false);
    }
  };

  const removeItem = async (itemId: string) => {
    setUpdating(true);
    try {
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('id', itemId);

      if (error) throw error;
      
      setCartItems(cartItems.filter((item: any) => item.id !== itemId));
      toast.success('Đã xóa sản phẩm khỏi giỏ hàng');
    } catch (error) {
      console.error('Error removing item:', error);
      toast.error('Lỗi khi xóa sản phẩm');
    } finally {
      setUpdating(false);
    }
  };

  const getTotalPrice = () => {
    return cartItems.reduce((total: number, item: any) => {
      return total + (Number(item.products.price) * item.quantity);
    }, 0);
  };

  const getTotalItems = () => {
    return cartItems.reduce((total: number, item: any) => total + item.quantity, 0);
  };

  const proceedToCheckout = () => {
    navigate('/checkout');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">Đang tải giỏ hàng...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Giỏ hàng của bạn</h1>

          {cartItems.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <ShoppingCart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Giỏ hàng trống</h3>
                <p className="text-gray-600 mb-6">Hãy thêm một số sản phẩm vào giỏ hàng của bạn</p>
                <Button 
                  onClick={() => navigate('/products')}
                  className="bg-green-600 hover:bg-green-700"
                >
                  Tiếp tục mua sắm
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Cart Items */}
              <div className="lg:col-span-2 space-y-4">
                {cartItems.map((item: any) => (
                  <Card key={item.id}>
                    <CardContent className="p-6">
                      <div className="flex items-center space-x-4">
                        <img
                          src={item.products.image_url || "/placeholder.svg"}
                          alt={item.products.name}
                          className="w-20 h-20 object-cover rounded-lg"
                        />
                        
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg">{item.products.name}</h3>
                          <p className="text-gray-600">
                            Người bán: {item.products.profiles?.full_name}
                          </p>
                          <p className="text-green-600 font-bold">
                            {Number(item.products.price).toLocaleString()}đ/{item.products.unit}
                          </p>
                        </div>

                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            disabled={updating}
                          >
                            <Minus className="w-4 h-4" />
                          </Button>
                          
                          <Input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => updateQuantity(item.id, parseInt(e.target.value) || 1)}
                            className="w-16 text-center"
                            min="1"
                          />
                          
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            disabled={updating}
                          >
                            <Plus className="w-4 h-4" />
                          </Button>
                        </div>

                        <div className="text-right">
                          <p className="font-bold text-lg">
                            {(Number(item.products.price) * item.quantity).toLocaleString()}đ
                          </p>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeItem(item.id)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            disabled={updating}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Order Summary */}
              <div className="lg:col-span-1">
                <Card className="sticky top-4">
                  <CardHeader>
                    <CardTitle>Tóm tắt đơn hàng</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between">
                      <span>Số lượng sản phẩm:</span>
                      <span>{getTotalItems()}</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span>Tạm tính:</span>
                      <span>{getTotalPrice().toLocaleString()}đ</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span>Phí vận chuyển:</span>
                      <span>Miễn phí</span>
                    </div>
                    
                    <div className="border-t pt-4">
                      <div className="flex justify-between font-bold text-lg">
                        <span>Tổng cộng:</span>
                        <span className="text-green-600">{getTotalPrice().toLocaleString()}đ</span>
                      </div>
                    </div>
                    
                    <Button 
                      onClick={proceedToCheckout}
                      className="w-full bg-green-600 hover:bg-green-700"
                      size="lg"
                    >
                      Tiến hành thanh toán
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      onClick={() => navigate('/products')}
                      className="w-full"
                    >
                      Tiếp tục mua sắm
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Cart;
