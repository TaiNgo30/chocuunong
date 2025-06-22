import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Search, ShoppingCart, TrendingUp, Shield, Users, Truck, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Header from "@/components/Header";
import ProductCard from "@/components/ProductCard";
import { supabase } from '@/integrations/supabase/client';
import HeroSlider from "@/components/HeroSlider";
import ChatWidget from "@/components/ChatWidget";
import Footer from "@/components/Footer";

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

  // Scroll reveal for elements with .reveal
  useEffect(() => {
    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('show');
          obs.unobserve(entry.target as Element);
        }
      });
    }, { rootMargin: '0px 0px -20% 0px', threshold: 0 });

    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <ChatWidget />
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-green-50 to-green-100 py-8">
        <div className="container mx-auto px-4 text-center">

          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/products">
              <Button size="lg" className="bg-green-600 hover:bg-green-700">
                Bạn muốn mua hàng?
              </Button>
            </Link>
            <Link to="/auth">
              <Button size="lg" variant="outline" className="border-green-600 text-green-600 hover:bg-green-50">
                Tôi là người nông dân!
              </Button>
            </Link>
          </div>
        </div>
      </section>
      {/* Categories + Featured Products Side-by-Side */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            {/* Danh mục 30% */}
            <div className="lg:col-span-4">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Danh mục sản phẩm</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-1 gap-4">
                {categories.map((category) => (
                  <Link
                    key={category.id}
                    to={`/products?category=${category.id}`}
                    className="flex items-center p-4 rounded-lg border hover:shadow-md transition bg-white hover:bg-green-50 group"
                  >
                    <div className="text-3xl mr-4">{category.icon}</div>
                    <div>
                      <h3 className="font-semibold text-gray-800 group-hover:text-green-600">
                        {category.name}
                      </h3>
                      <p className="text-sm text-gray-600">{category.description}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Sản phẩm nổi bật 70% */}
            <div className="lg:col-span-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-extrabold text-red-600 animate-pulse uppercase">Sản phẩm cần được GIẢI CỨU!</h2>
                <Link to="/products">
                  <Button variant="outline" className="border-green-600 text-green-600 hover:bg-green-50">
                    Xem tất cả
                  </Button>
                </Link>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
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
                      rating: 4.9,
                      reviews: 100,
                      category: product.categories?.name || "Nông sản",
                      discount: product.original_price ? Math.round((1 - Number(product.price) / Number(product.original_price)) * 100) : 0
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* <HeroSlider /> */}

      {/* About Us Description Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 max-w-3xl text-center">
          <h2 className="text-3xl md:text-4xl font-extrabold text-green-700 mb-6">
            Sứ mệnh của chúng tôi
          </h2>
          <div className="text-lg text-gray-700 leading-relaxed space-y-4 reveal">
            <img className="w-full rounded-xl" src="/assets/images/cho-cuu-nong-su-menh.jpg"/>
            <p>
              Sứ mệnh của chúng tôi là <span className="font-semibold text-green-700">giải cứu nông sản</span>, đưa sản phẩm tươi ngon – đậm đà hồn quê – đến tay người tiêu dùng với mức giá bình dị.
            </p>
            <p>
              Chúng tôi không chỉ trao đi sản vật của đất trời mà còn lan tỏa tình yêu thương, sẻ chia khó khăn và kiến tạo tương lai bền vững cho nông nghiệp Việt Nam.
            </p>
            <div className="space-y-3 text-left">
              {[
                { text: 'Kết nối trực tiếp nông dân & người tiêu dùng.' },
                { text: 'Đảm bảo chất lượng & độ tươi ngon.' },
                { text: 'Giá cả công bằng, giảm thiểu trung gian.' },
                { text: 'Lan tỏa yêu thương – hỗ trợ sinh kế nông hộ.' }
              ].map((item, idx) => (
                <div key={idx} className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600 shrink-0" />
                  <span>{item.text}</span>
                </div>
              ))}
            </div>
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

      {/* Video Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-8 text-gray-800">Cùng xem hành trình giải cứu nông sản</h2>
          <div className="relative" style={{ paddingTop: '56.25%' }}>
            <iframe
              className="absolute top-0 left-0 w-full h-full rounded-xl shadow-lg"
              src="https://www.youtube.com/embed/fFozI5lRTrQ"
              title="YouTube video player"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
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
              <Button size="lg" variant="secondary" className="bg-white text-green-600 hover:bg-gray-100">
                Mua sắm ngay
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Index;
