import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import Header from "@/components/Header";

const EditProduct = () => {
  const { id } = useParams();
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
    fetchProduct();
    // eslint-disable-next-line
  }, [id]);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');
      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      toast.error('Lỗi khi tải danh mục');
    }
  };

  const fetchProduct = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();
      if (error) throw error;
      setProduct({
        name: data.name || '',
        description: data.description || '',
        price: data.price?.toString() || '',
        original_price: data.original_price?.toString() || '',
        unit: data.unit || 'kg',
        quantity: data.quantity?.toString() || '',
        category_id: data.category_id || '',
        image_url: data.image_url || '',
        location: data.location || '',
        origin: data.origin || '',
        certification: data.certification || '',
        delivery_time: data.delivery_time || ''
      });
    } catch (error) {
      toast.error('Không tìm thấy sản phẩm');
      navigate('/seller/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!product.category_id) {
      toast.error('Vui lòng chọn danh mục sản phẩm');
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase
        .from('products')
        .update({
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
          delivery_time: product.delivery_time
        })
        .eq('id', id);
      if (error) throw error;
      toast.success('Cập nhật sản phẩm thành công!');
      navigate('/seller/dashboard');
    } catch (error) {
      toast.error('Lỗi khi cập nhật sản phẩm');
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
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Chỉnh sửa sản phẩm</h1>
            <p className="text-gray-600">Cập nhật thông tin sản phẩm của bạn</p>
          </div>
          <Card>
            <CardHeader>
              <CardTitle>Thông tin sản phẩm</CardTitle>
              <CardDescription>
                Chỉnh sửa thông tin để khách hàng có thể hiểu rõ về sản phẩm của bạn
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Tên sản phẩm *</Label>
                    <Input
                      id="name"
                      value={product.name}
                      onChange={(e) => setProduct({ ...product, name: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="category">Danh mục *</Label>
                    <Select
                      value={product.category_id}
                      onValueChange={(value) => setProduct({ ...product, category_id: value })}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn danh mục" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
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
                    value={product.description}
                    onChange={(e) => setProduct({ ...product, description: e.target.value })}
                    rows={4}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="price">Giá bán *</Label>
                    <Input
                      id="price"
                      type="number"
                      value={product.price}
                      onChange={(e) => setProduct({ ...product, price: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="originalPrice">Giá gốc</Label>
                    <Input
                      id="originalPrice"
                      type="number"
                      value={product.original_price}
                      onChange={(e) => setProduct({ ...product, original_price: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="unit">Đơn vị *</Label>
                    <Select
                      value={product.unit}
                      onValueChange={(value) => setProduct({ ...product, unit: value })}
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
                    value={product.quantity}
                    onChange={(e) => setProduct({ ...product, quantity: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="imageUrl">URL hình ảnh</Label>
                  <Input
                    id="imageUrl"
                    value={product.image_url}
                    onChange={(e) => setProduct({ ...product, image_url: e.target.value })}
                  />
                </div>
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Thông tin bổ sung</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="location">Khu vực</Label>
                      <Input
                        id="location"
                        value={product.location}
                        onChange={(e) => setProduct({ ...product, location: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="origin">Nguồn gốc</Label>
                      <Input
                        id="origin"
                        value={product.origin}
                        onChange={(e) => setProduct({ ...product, origin: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="certification">Chứng nhận</Label>
                      <Input
                        id="certification"
                        value={product.certification}
                        onChange={(e) => setProduct({ ...product, certification: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="deliveryTime">Thời gian giao hàng</Label>
                      <Input
                        id="deliveryTime"
                        value={product.delivery_time}
                        onChange={(e) => setProduct({ ...product, delivery_time: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
                <div className="flex gap-4">
                  <Button 
                    type="submit" 
                    className="flex-1 bg-green-600 hover:bg-green-700"
                    disabled={loading}
                  >
                    {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => navigate('/seller/dashboard')}
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

export default EditProduct; 