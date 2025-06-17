import { useParams } from "react-router-dom";
import { useProduct } from "@/hooks/useProducts";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Star, ShoppingCart, Heart, Share2, ChevronLeft, MapPin, Phone, Mail, Truck, Shield, RefreshCw } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { toast } from "sonner";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate } from "react-router-dom";
import ProductImageSlider from "@/components/ProductImageSlider";

const ProductDetail = () => {
    const { id } = useParams();
    const { data: product, isLoading, error } = useProduct(id);
    const { addToCart } = useCart();
    const [quantity, setQuantity] = useState(1);
    const navigate = useNavigate();

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Header />
                <div className="container mx-auto px-4 py-8">
                    <div className="flex items-center justify-center h-64">
                        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600"></div>
                    </div>
                </div>
            </div>
        );
    }

    if (error || !product) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Header />
                <div className="container mx-auto px-4 py-8">
                    <div className="text-center py-12">
                        <p className="text-red-500 text-lg">Không tìm thấy sản phẩm</p>
                    </div>
                </div>
            </div>
        );
    }

    const handleAddToCart = () => {
        addToCart({ ...product, quantity });
        toast.success("Đã thêm vào giỏ hàng", {
            description: `${product.name} - ${quantity} ${product.unit}`,
            action: {
                label: "Xem giỏ hàng",
                onClick: () => navigate('/cart'),
            },
        });
    };

    const handleBuyNow = () => {
        addToCart({ ...product, quantity });
        navigate('/checkout');
    };

    const handleShare = () => {
        navigator.clipboard.writeText(window.location.href);
        toast.success("Đã sao chép link sản phẩm");
    };

    const handleWishlist = () => {
        toast.success("Đã thêm vào danh sách yêu thích");
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Header />
            <div className="container mx-auto px-4 py-8">
                {/* Breadcrumb */}
                <div className="flex items-center space-x-2 text-sm text-gray-500 mb-8">
                    <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="hover:text-green-600">
                        <ChevronLeft className="w-4 h-4 mr-1" />
                        Quay lại
                    </Button>
                    <span>/</span>
                    <span className="text-green-600">{product.categories?.name || "Nông sản"}</span>
                    <span>/</span>
                    <span className="text-gray-900">{product.name}</span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column - Product Images */}
                    <div className="lg:col-span-2 space-y-4">
                        <Card className="overflow-hidden shadow-lg hover:shadow-2xl transition-shadow duration-500">
                            <div className="relative">
                                <ProductImageSlider
                                    images={product.images && product.images.length > 0 ? product.images : [product.image_url || "/placeholder.svg"]}
                                    alt={product.name}
                                />
                                {product.original_price && (
                                    <Badge className="absolute top-4 left-4 bg-red-500 text-white text-lg px-4 py-2 animate-bounce shadow-xl">
                                        -{Math.round((1 - product.price / product.original_price) * 100)}%
                                    </Badge>
                                )}
                            </div>
                        </Card>

                        {/* Product Tabs */}
                        <Card className="shadow-lg">
                            <Tabs defaultValue="description" className="w-full">
                                <TabsList className="w-full justify-start border-b rounded-none">
                                    <TabsTrigger value="description">Mô tả sản phẩm</TabsTrigger>
                                    <TabsTrigger value="specifications">Thông tin sản phẩm</TabsTrigger>
                                    <TabsTrigger value="reviews">Đánh giá</TabsTrigger>
                                </TabsList>
                                <TabsContent value="description" className="p-6">
                                    <div className="prose max-w-none">
                                        <p className="text-gray-600">{product.description || "Chưa có mô tả"}</p>
                                    </div>
                                </TabsContent>
                                <TabsContent value="specifications" className="p-6">
                                    <div className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="text-gray-600">Danh mục</div>
                                            <div className="font-medium">{product.categories?.name || "Nông sản"}</div>
                                            <div className="text-gray-600">Đơn vị</div>
                                            <div className="font-medium">{product.unit}</div>
                                            <div className="text-gray-600">Vùng miền</div>
                                            <div className="font-medium">{product.location || "Việt Nam"}</div>
                                        </div>
                                    </div>
                                </TabsContent>
                                <TabsContent value="reviews" className="p-6">
                                    <div className="text-center py-8">
                                        <p className="text-gray-500">Chưa có đánh giá nào</p>
                                    </div>
                                </TabsContent>
                            </Tabs>
                        </Card>
                    </div>

                    {/* Right Column - Product Info */}
                    <div className="space-y-6">
                        <Card className="p-6 shadow-lg">
                            <div className="space-y-4">
                                <div>
                                    <h1 className="text-2xl font-bold text-gray-900">{product.name}</h1>
                                    <div className="flex items-center mt-2 space-x-2">
                                        <div className="flex items-center">
                                            <Star className="w-5 h-5 text-yellow-400 fill-current" />
                                            <span className="ml-1 text-gray-600">4.9</span>
                                        </div>
                                        <span className="text-gray-400">|</span>
                                        <span className="text-gray-600">100 đánh giá</span>
                                    </div>
                                </div>

                                <Separator />

                                <div className="space-y-2">
                                    <div className="flex items-baseline space-x-2">
                                        <span className="text-3xl font-bold text-green-600">
                                            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.price)}
                                        </span>
                                        {product.original_price && (
                                            <>
                                                <span className="text-xl text-gray-400 line-through">
                                                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.original_price)}
                                                </span>
                                            </>
                                        )}
                                    </div>
                                    <p className="text-gray-600">Đơn vị: {product.unit}</p>
                                </div>

                                <Separator />

                                {/* Quantity Selector */}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700">Số lượng</label>
                                    <div className="flex items-center space-x-4">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                            className="w-10 h-10"
                                        >
                                            -
                                        </Button>
                                        <span className="w-12 text-center font-medium">{quantity}</span>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setQuantity(quantity + 1)}
                                            className="w-10 h-10"
                                        >
                                            +
                                        </Button>
                                    </div>
                                </div>

                                <Separator />

                                {/* Action Buttons */}
                                <div className="space-y-3">
                                    <Button
                                        size="lg"
                                        className="w-full bg-green-600 hover:bg-green-700 h-12 text-lg transition-transform duration-300 hover:scale-105 shadow-md"
                                        onClick={handleAddToCart}
                                    >
                                        <ShoppingCart className="w-5 h-5 mr-2" />
                                        Thêm vào giỏ
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="lg"
                                        className="w-full border-green-600 text-green-600 hover:bg-green-50 h-12 text-lg transition-transform duration-300 hover:scale-105 shadow"
                                        onClick={handleBuyNow}
                                    >
                                        Mua ngay
                                    </Button>
                                    <div className="flex space-x-2">
                                        <Button
                                            variant="outline"
                                            size="lg"
                                            className="flex-1 hover:bg-pink-50 transition-transform duration-300 hover:scale-110"
                                            onClick={handleWishlist}
                                        >
                                            <Heart className="w-5 h-5" />
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="lg"
                                            className="flex-1 hover:bg-blue-50 transition-transform duration-300 hover:scale-110"
                                            onClick={handleShare}
                                        >
                                            <Share2 className="w-5 h-5" />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </Card>

                        {/* Seller Info */}
                        <Card className="p-6 shadow-lg">
                            <h3 className="font-medium text-lg mb-4">Thông tin người bán</h3>
                            <div className="space-y-4">
                                <div className="flex items-center space-x-3">
                                    <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                                        <span className="text-xl font-bold text-green-600">
                                            {product.profiles?.full_name?.[0] || "N"}
                                        </span>
                                    </div>
                                    <div>
                                        <p className="font-medium">{product.profiles?.full_name || "Nông dân"}</p>
                                        <p className="text-sm text-gray-500">Người bán uy tín</p>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex items-center text-gray-600">
                                        <MapPin className="w-4 h-4 mr-2" />
                                        <span>{product.location || "Việt Nam"}</span>
                                    </div>
                                    <div className="flex items-center text-gray-600">
                                        <Phone className="w-4 h-4 mr-2" />
                                        <span>{product.profiles?.phone || "Chưa có số điện thoại"}</span>
                                    </div>
                                </div>
                            </div>
                        </Card>

                        {/* Shipping Info */}
                        <Card className="p-6 shadow-lg">
                            <div className="space-y-4">
                                <div className="flex items-center space-x-3">
                                    <Truck className="w-5 h-5 text-green-600" />
                                    <div>
                                        <p className="font-medium">Giao hàng toàn quốc</p>
                                        <p className="text-sm text-gray-500">Miễn phí vận chuyển cho đơn từ 500.000đ</p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-3">
                                    <Shield className="w-5 h-5 text-green-600" />
                                    <div>
                                        <p className="font-medium">Bảo hành chất lượng</p>
                                        <p className="text-sm text-gray-500">Đổi trả trong 7 ngày nếu không hài lòng</p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-3">
                                    <RefreshCw className="w-5 h-5 text-green-600" />
                                    <div>
                                        <p className="font-medium">Đổi trả dễ dàng</p>
                                        <p className="text-sm text-gray-500">Hỗ trợ đổi trả nhanh chóng</p>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetail; 