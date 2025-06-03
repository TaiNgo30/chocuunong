import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Search, ShoppingCart, TrendingUp, Shield, Users, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Header from "@/components/Header";
import ProductCard from "@/components/ProductCard";
import { supabase } from '@/integrations/supabase/client';
import HeroSlider from "@/components/HeroSlider";

const Index = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    fetchFeaturedProducts();
    fetchCategories();
  }, []);

  const fetchFeaturedProducts = async () => {
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        profiles:seller_id(full_name, phone, address),
        categories:category_id(name, icon)
      `)
      .eq('status', 'approved')
      .order('views', { ascending: false })
      .limit(8);

    if (error) {
      console.error('Error fetching products:', error);
      return;
    }

    setFeaturedProducts(data || []);
  };

  const fetchCategories = async () => {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name');

    if (error) {
      console.error('Error fetching categories:', error);
      return;
    }

    setCategories(data || []);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/products?search=${encodeURIComponent(searchQuery)}`;
    }
  };

  const features = [
    {
      icon: Shield,
      title: "Sản phẩm chất lượng",
      description: "Cam kết nguồn gốc rõ ràng, an toàn thực phẩm"
    },
    {
      icon: Users,
      title: "Kết nối nông dân",
      description: "Trực tiếp từ nông dân đến người tiêu dùng"
    },
    {
      icon: Truck,
      title: "Giao hàng nhanh",
      description: "Đảm bảo độ tươi ngon của sản phẩm"
    },
    {
      icon: TrendingUp,
      title: "Giá cả hợp lý",
      description: "Tiết kiệm chi phí trung gian"
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <HeroSlider />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-green-50 to-green-100 py-8">
        <div className="container mx-auto px-4 text-center">
          {/* Search Bar */}
          <form onSubmit={handleSearch} className="max-w-2xl mx-auto mb-8 mt-4">
            <div className="relative">
              <Input
                type="text"
                placeholder="Tìm kiếm nông sản: cà chua, gạo, cà phê..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="text-lg py-4 pr-16 pl-6 rounded-full border-2 border-green-200 focus:border-green-400"
              />
              <Button
                type="submit"
                size="lg"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-green-600 hover:bg-green-700 rounded-full px-6"
              >
                <Search className="h-5 w-5" />
              </Button>
            </div>
          </form>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/products">
              <Button size="lg" className="bg-green-600 hover:bg-green-700">
                Khám phá sản phẩm
              </Button>
            </Link>
            <Link to="/auth">
              <Button size="lg" variant="outline" className="border-green-600 text-green-600 hover:bg-green-50">
                Bắt đầu bán hàng
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">
            Danh mục sản phẩm
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {categories.map((category) => (
              <Link
                key={category.id}
                to={`/products?category=${category.id}`}
                className="text-center p-6 rounded-lg border hover:shadow-lg transition-shadow bg-white hover:bg-green-50 group"
              >
                <div className="text-4xl mb-3">{category.icon}</div>
                <h3 className="font-semibold text-gray-800 group-hover:text-green-600">
                  {category.name}
                </h3>
                <p className="text-sm text-gray-600 mt-1">{category.description}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800">Sản phẩm nổi bật</h2>
            <Link to="/products">
              <Button variant="outline" className="border-green-600 text-green-600 hover:bg-green-50">
                Xem tất cả
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={{
                  id: product.id,
                  name: product.name,
                  price: Number(product.price),
                  originalPrice: Number(product.original_price || product.price),
                  unit: product.unit,
                  image: product.image_url || "/placeholder.svg",
                  farmer: product.profiles?.full_name || "Nông dân",
                  location: product.location || "Việt Nam",
                  rating: 4.8,
                  reviews: 124,
                  category: product.categories?.name || "Nông sản",
                  discount: product.original_price ? Math.round((1 - Number(product.price) / Number(product.original_price)) * 100) : 0
                }}
                onViewDetails={() => {
                  // Update view count
                  supabase
                    .from('products')
                    .update({ views: (product.views || 0) + 1 })
                    .eq('id', product.id)
                    .then(() => {
                      console.log('View count updated');
                    });
                }}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">
            Tại sao chọn Chợ Cứu Nông?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="text-center border-none shadow-lg hover:shadow-xl transition-shadow">
                <CardHeader>
                  <div className="mx-auto bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                    <feature.icon className="h-8 w-8 text-green-600" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-gray-600">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-green-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">
            Bắt đầu mua bán nông sản ngay hôm nay
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Tham gia cộng đồng nông nghiệp bền vững của chúng tôi
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/auth">
              <Button size="lg" variant="secondary" className="bg-white text-green-600 hover:bg-gray-100">
                Đăng ký ngay
              </Button>
            </Link>
            <Link to="/products">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-green-600">
                Mua sắm ngay
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-12 mt-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="flex flex-col items-start">
              <div className="flex items-center mb-3">
                <img src="/logo.png" alt="Chợ Cứu Nông" className="w-12 h-12 rounded-full shadow border-2 border-yellow-400 mr-3 animate-bounce" />
                <div>
                  <h3 className="text-2xl font-extrabold text-yellow-300 mb-1">Chợ Cứu Nông</h3>
                  <div className="text-sm text-yellow-100 font-semibold">Nông sản sạch - Giá Việt - Giao tận nơi</div>
                </div>
              </div>
              <p className="text-gray-400 mb-2">
                Nền tảng kết nối nông dân và người tiêu dùng, hướng tới nền nông nghiệp bền vững.
              </p>
              <a href="https://chocuunong.liteease.com" target="_blank" rel="noopener noreferrer" className="mt-2 px-3 py-1 rounded-full bg-yellow-300 text-green-900 font-bold text-xs shadow hover:bg-yellow-400 transition animate-pulse">
                Website mới: chocuunong.liteease.com
              </a>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Liên kết nhanh</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="/products" className="hover:text-white">Sản phẩm</Link></li>
                <li><Link to="/auth" className="hover:text-white">Đăng ký</Link></li>
                <li><Link to="/auth" className="hover:text-white">Đăng nhập</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Hỗ trợ</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">Trung tâm trợ giúp</a></li>
                <li><a href="#" className="hover:text-white">Liên hệ</a></li>
                <li><a href="#" className="hover:text-white">Chính sách</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Liên hệ</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Email: support@chocunong.vn</li>
                <li>Hotline: 1900 1234</li>
                <li>Địa chỉ: Hà Nội, Việt Nam <span className='ml-1'>🇻🇳</span></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Chợ Cứu Nông. Tất cả quyền được bảo lưu.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
