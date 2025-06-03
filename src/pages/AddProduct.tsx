import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Package, DollarSign, Image, MapPin, Award, Clock } from "lucide-react";
import Header from "@/components/Header";

const AddProduct = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [product, setProduct] = useState({
    name: '',
    description: '',
    price: '',
    original_price: '',
    unit: 'kg',
    quantity: '',
    category_id: '',
    image_url: '',
    location: '',
    origin: '',
    certification: '',
    delivery_time: ''
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error('Lỗi khi tải danh mục');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!product.category_id) {
      toast.error('Vui lòng chọn danh mục sản phẩm');
      return;
    }
    
    setLoading(true);

    try {
      const { error } = await supabase
        .from('products')
        .insert({
          seller_id: user?.id,
          name: product.name,
          description: product.description,
          price: parseFloat(product.price),
          original_price: product.original_price ? parseFloat(product.original_price) : null,
          unit: product.unit,
          quantity: parseInt(product.quantity),
          category_id: product.category_id,
          image_url: product.image_url,
          location: product.location,
          origin: product.origin,
          certification: product.certification,
          delivery_time: product.delivery_time,
          status: 'pending'
        });

      if (error) throw error;

      toast.success('Đăng sản phẩm thành công! Sản phẩm đang chờ phê duyệt.');
      navigate('/seller/products');
    } catch (error) {
      console.error('Error creating product:', error);
      toast.error('Lỗi khi đăng sản phẩm');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Đăng sản phẩm mới</h1>
            <p className="text-gray-600">Thêm sản phẩm nông sản của bạn để bắt đầu bán hàng</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Thông tin sản phẩm</CardTitle>
              <CardDescription>
                Điền đầy đủ thông tin để khách hàng có thể hiểu rõ về sản phẩm của bạn
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Tên sản phẩm *</Label>
                    <div className="relative">
                      <Package className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="name"
                        className="pl-10"
                        placeholder="Ví dụ: Cà chua cherry Đà Lạt"
                        value={product.name}
                        onChange={(e) => setProduct({...product, name: e.target.value})}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="category">Danh mục *</Label>
                    <Select
                      value={product.category_id}
                      onValueChange={(value) => setProduct({...product, category_id: value})}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn danh mục" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category: any) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.icon} {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="description">Mô tả sản phẩm</Label>
                  <Textarea
                    id="description"
                    placeholder="Mô tả chi tiết về sản phẩm, chất lượng, đặc điểm..."
                    value={product.description}
                    onChange={(e) => setProduct({...product, description: e.target.value})}
                    rows={4}
                  />
                </div>

                {/* Price & Quantity */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="price">Giá bán *</Label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="price"
                        type="number"
                        className="pl-10"
                        placeholder="50000"
                        value={product.price}
                        onChange={(e) => setProduct({...product, price: e.target.value})}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="originalPrice">Giá gốc</Label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="originalPrice"
                        type="number"
                        className="pl-10"
                        placeholder="60000"
                        value={product.original_price}
                        onChange={(e) => setProduct({...product, original_price: e.target.value})}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="unit">Đơn vị *</Label>
                    <Select
                      value={product.unit}
                      onValueChange={(value) => setProduct({...product, unit: value})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="kg">Kg</SelectItem>
                        <SelectItem value="gam">Gam</SelectItem>
                        <SelectItem value="túi">Túi</SelectItem>
                        <SelectItem value="hộp">Hộp</SelectItem>
                        <SelectItem value="con">Con</SelectItem>
                        <SelectItem value="quả">Quả</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="quantity">Số lượng có sẵn *</Label>
                  <Input
                    id="quantity"
                    type="number"
                    placeholder="100"
                    value={product.quantity}
                    onChange={(e) => setProduct({...product, quantity: e.target.value})}
                    required
                  />
                </div>

                {/* Images */}
                <div>
                  <Label htmlFor="imageUrl">URL hình ảnh</Label>
                  <div className="relative">
                    <Image className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="imageUrl"
                      className="pl-10"
                      placeholder="https://example.com/image.jpg"
                      value={product.image_url}
                      onChange={(e) => setProduct({...product, image_url: e.target.value})}
                    />
                  </div>
                </div>

                {/* Additional Info */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Thông tin bổ sung</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="location">Khu vực</Label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="location"
                          className="pl-10"
                          placeholder="Đà Lạt, Lâm Đồng"
                          value={product.location}
                          onChange={(e) => setProduct({...product, location: e.target.value})}
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="origin">Nguồn gốc</Label>
                      <Input
                        id="origin"
                        placeholder="Nông trại ABC"
                        value={product.origin}
                        onChange={(e) => setProduct({...product, origin: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="certification">Chứng nhận</Label>
                      <div className="relative">
                        <Award className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="certification"
                          className="pl-10"
                          placeholder="VietGAP, Organic..."
                          value={product.certification}
                          onChange={(e) => setProduct({...product, certification: e.target.value})}
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="deliveryTime">Thời gian giao hàng</Label>
                      <div className="relative">
                        <Clock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="deliveryTime"
                          className="pl-10"
                          placeholder="1-2 ngày"
                          value={product.delivery_time}
                          onChange={(e) => setProduct({...product, delivery_time: e.target.value})}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4">
                  <Button 
                    type="submit" 
                    className="flex-1 bg-green-600 hover:bg-green-700"
                    disabled={loading}
                  >
                    {loading ? 'Đang đăng...' : 'Đăng sản phẩm'}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => navigate('/seller/products')}
                  >
                    Hủy
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AddProduct;
