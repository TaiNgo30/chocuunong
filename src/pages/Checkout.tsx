import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import Header from '@/components/Header';
import { Leaf, ArrowLeft } from 'lucide-react';

const Checkout = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [cartItems, setCartItems] = useState([]);
  const [userProfile, setUserProfile] = useState(null);

  const [formData, setFormData] = useState({
    shipping_address: '',
    shipping_phone: '',
    payment_method: 'cod' as 'cod' | 'bank_transfer' | 'e_wallet',
    notes: ''
  });

  useEffect(() => {
    if (!user) {
      // Guest: load cart from localStorage
      const guestCart = JSON.parse(localStorage.getItem('guest_cart') || '[]');
      setCartItems(guestCart.map(item => ({
        ...item,
        products: item // mimic supabase cart_items join
      })));
    } else {
      fetchCartItems();
      fetchUserProfile();
    }
  }, [user]);

  const fetchUserProfile = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error) {
      console.error('Error fetching profile:', error);
      return;
    }

    setUserProfile(data);
    setFormData(prev => ({
      ...prev,
      shipping_address: data.address || '',
      shipping_phone: data.phone || ''
    }));
  };

  const fetchCartItems = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('cart_items')
      .select(`
        *,
        products (
          *,
          profiles:seller_id (full_name, phone)
        )
      `)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error fetching cart items:', error);
      return;
    }

    setCartItems(data || []);
  };

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => {
      return total + (item.products.price * item.quantity);
    }, 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cartItems.length === 0) return;
    setLoading(true);
    try {
      // Group items by seller
      const itemsBySeller = cartItems.reduce((acc, item) => {
        const sellerId = item.products.seller_id;
        if (!acc[sellerId]) {
          acc[sellerId] = [];
        }
        acc[sellerId].push(item);
        return acc;
      }, {});

      for (const [sellerId, items] of Object.entries(itemsBySeller)) {
        const orderTotal = items.reduce((total, item) => {
          return total + (item.products.price * item.quantity);
        }, 0);

        const { data: order, error: orderError } = await supabase
          .from('orders')
          .insert({
            buyer_id: user ? user.id : null,
            seller_id: sellerId,
            total_amount: orderTotal,
            payment_method: formData.payment_method,
            shipping_address: formData.shipping_address,
            shipping_phone: formData.shipping_phone,
            notes: formData.notes || null
          })
          .select()
          .single();

        if (orderError) throw orderError;

        // Create order items
        const orderItems = items.map(item => ({
          order_id: order.id,
          product_id: item.product_id || item.id,
          quantity: item.quantity,
          price: item.products.price
        }));

        const { error: itemsError } = await supabase
          .from('order_items')
          .insert(orderItems);

        if (itemsError) throw itemsError;
      }

      // Clear cart
      if (user) {
        const { error: clearCartError } = await supabase
          .from('cart_items')
          .delete()
          .eq('user_id', user.id);
        if (clearCartError) throw clearCartError;
      } else {
        localStorage.removeItem('guest_cart');
      }

      toast.success('Đặt hàng thành công!');
      navigate('/orders');
    } catch (error) {
      console.error('Error creating order:', error);
      toast.error('Có lỗi xảy ra khi đặt hàng');
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  // Guest users are allowed, so always render
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center mb-6">
            <Button
              variant="ghost"
              onClick={() => navigate('/cart')}
              className="mr-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Quay lại giỏ hàng
            </Button>
            <h1 className="text-3xl font-bold text-green-800">Thanh toán</h1>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Order Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Thông tin đơn hàng</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex justify-between items-center border-b pb-2">
                      <div>
                        <h3 className="font-medium">{item.products.name}</h3>
                        <p className="text-sm text-gray-600">
                          {item.quantity} {item.products.unit} × {formatPrice(item.products.price)}
                        </p>
                      </div>
                      <p className="font-semibold">
                        {formatPrice(item.products.price * item.quantity)}
                      </p>
                    </div>
                  ))}
                  <div className="flex justify-between items-center text-lg font-bold border-t pt-2">
                    <span>Tổng cộng:</span>
                    <span className="text-green-600">{formatPrice(calculateTotal())}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Checkout Form */}
            <Card>
              <CardHeader>
                <CardTitle>Thông tin giao hàng</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="shipping_address">Địa chỉ giao hàng</Label>
                    <Textarea
                      id="shipping_address"
                      value={formData.shipping_address}
                      onChange={(e) => setFormData(prev => ({ ...prev, shipping_address: e.target.value }))}
                      required
                      placeholder="Nhập địa chỉ giao hàng đầy đủ"
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label htmlFor="shipping_phone">Số điện thoại</Label>
                    <Input
                      id="shipping_phone"
                      type="tel"
                      value={formData.shipping_phone}
                      onChange={(e) => setFormData(prev => ({ ...prev, shipping_phone: e.target.value }))}
                      required
                      placeholder="Số điện thoại nhận hàng"
                    />
                  </div>

                  <div>
                    <Label htmlFor="payment_method">Phương thức thanh toán</Label>
                    <Select
                      value={formData.payment_method}
                      onValueChange={(value: 'cod' | 'bank_transfer' | 'e_wallet') =>
                        setFormData(prev => ({ ...prev, payment_method: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cod">Thanh toán khi nhận hàng (COD)</SelectItem>
                        <SelectItem value="bank_transfer">Chuyển khoản ngân hàng</SelectItem>
                        <SelectItem value="e_wallet">Ví điện tử</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="notes">Ghi chú (tùy chọn)</Label>
                    <Textarea
                      id="notes"
                      value={formData.notes}
                      onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                      placeholder="Ghi chú cho người bán..."
                      rows={3}
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-green-600 hover:bg-green-700"
                    disabled={loading || cartItems.length === 0}
                  >
                    {loading ? 'Đang xử lý...' : `Đặt hàng ${formatPrice(calculateTotal())}`}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
