import { Star, Heart, ShoppingCart, Phone, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    price: number;
    originalPrice: number;
    unit: string;
    image: string;
    farmer: string;
    location: string;
    rating: number;
    reviews: number;
    category: string;
    discount: number;
  };
}

const ProductCard = ({ product }: ProductCardProps) => {
  const { user } = useAuth();
  const [userType, setUserType] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      if (user) {
        const { data, error } = await supabase
          .from('profiles')
          .select('user_type')
          .eq('id', user.id)
          .single();
        if (!error && data) {
          setUserType(data.user_type);
        } else {
          setUserType(null);
        }
      } else {
        setUserType(null);
      }
    };
    fetchProfile();
  }, [user]);

  const handleAddToCart = async () => {
    if (!user) {
      toast.error("Bạn cần đăng nhập để thêm vào giỏ hàng");
      return;
    }
    if (userType !== "buyer") {
      toast.error("Chỉ người mua mới được thêm vào giỏ hàng");
      return;
    }
    try {
      // Kiểm tra đã có sản phẩm này trong giỏ chưa
      const { data: existing, error: checkError } = await supabase
        .from("cart_items")
        .select("*")
        .eq("user_id", String(user.id))
        .eq("product_id", String(product.id))
        .single();

      if (checkError && checkError.code !== "PGRST116") throw checkError;

      if (existing) {
        // Nếu đã có, tăng số lượng lên 1
        const { error } = await supabase
          .from("cart_items")
          .update({ quantity: existing.quantity + 1 })
          .eq("id", existing.id);
        if (error) throw error;
      } else {
        // Nếu chưa có, thêm mới
        const { error } = await supabase
          .from("cart_items")
          .insert({
            user_id: String(user.id),
            product_id: String(product.id),
            quantity: 1,
          });
        if (error) throw error;
      }
      toast.success("Đã thêm vào giỏ hàng!");
    } catch (err) {
      toast.error("Có lỗi khi thêm vào giỏ hàng");
    }
  };

  const handleBuyNow = async () => {
    if (!user) {
      toast.error("Bạn cần đăng nhập để mua hàng");
      return;
    }
    if (userType !== "buyer") {
      toast.error("Chỉ người mua mới được mua hàng");
      return;
    }
    try {
      // Kiểm tra đã có sản phẩm này trong giỏ chưa
      const { data: existing, error: checkError } = await supabase
        .from("cart_items")
        .select("*")
        .eq("user_id", String(user.id))
        .eq("product_id", String(product.id))
        .single();

      if (checkError && checkError.code !== "PGRST116") throw checkError;

      if (existing) {
        // Nếu đã có, cập nhật số lượng thành 1
        const { error } = await supabase
          .from("cart_items")
          .update({ quantity: 1 })
          .eq("id", existing.id);
        if (error) throw error;
      } else {
        // Nếu chưa có, thêm mới
        const { error } = await supabase
          .from("cart_items")
          .insert({
            user_id: String(user.id),
            product_id: String(product.id),
            quantity: 1,
          });
        if (error) throw error;
      }
      navigate('/checkout');
    } catch (err) {
      toast.error("Có lỗi khi mua hàng");
    }
  };

  return (
    <Card className="group hover:shadow-xl transition-all duration-300 border-0 shadow-md">
      <Link to={`/products/${product.id}`} className="block">
        <div className="relative overflow-hidden rounded-t-lg">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <Badge className="absolute top-3 left-3 bg-red-500 text-white">
            -{product.discount}%
          </Badge>
          <Button
            size="sm"
            variant="ghost"
            className="absolute top-3 right-3 bg-white/80 hover:bg-white"
          >
            <Heart className="w-4 h-4" />
          </Button>
        </div>

        <CardContent className="p-4">
          <div className="mb-2">
            <Badge variant="outline" className="text-green-600 border-green-600">
              {product.category}
            </Badge>
          </div>

          <h3 className="font-bold text-lg mb-2 group-hover:text-green-600 transition-colors">
            {product.name}
          </h3>

          <div className="flex items-center mb-2">
            <div className="flex items-center">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <span className="ml-1 text-sm text-gray-600">
                {product.rating} ({product.reviews} đánh giá)
              </span>
            </div>
          </div>

          <div className="flex items-center text-sm text-gray-600 mb-3">
            <MapPin className="w-4 h-4 mr-1" />
            <span>{product.location}</span>
          </div>

          <div className="text-sm text-gray-600 mb-3">
            Bởi: <span className="font-medium text-green-600">{product.farmer}</span>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-2xl font-bold text-green-600">
                  {(typeof product.price === 'number' ? product.price : 0).toLocaleString()}đ
                </span>
                <span className="text-sm text-gray-600">/{product.unit}</span>
              </div>
              <div className="text-sm text-gray-400 line-through">
                {(typeof product.originalPrice === 'number' ? product.originalPrice : 0).toLocaleString()}đ
              </div>
            </div>
          </div>
        </CardContent>
      </Link>

      <CardFooter className="p-4 pt-0">
        <div className="w-full space-y-2">
          <Button className="w-full bg-green-600 hover:bg-green-700" onClick={handleAddToCart}>
            <ShoppingCart className="w-4 h-4 mr-2" />
            Thêm vào giỏ
          </Button>
          <Button variant="outline" className="w-full border-green-600 text-green-600 hover:bg-green-50"
            onClick={handleBuyNow}
          >
            <ShoppingCart className="w-4 h-4 mr-2" />
            Mua ngay
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default ProductCard;
