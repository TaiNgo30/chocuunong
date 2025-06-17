import { useState } from "react";
import { Search, Filter, Grid, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Header from "@/components/Header";
import ProductCard from "@/components/ProductCard";
import { useProducts } from "@/hooks/useProducts";

const categories = ["Tất cả", "Rau củ", "Trái cây", "Thảo mộc", "Gạo & ngũ cốc", "Thịt & hải sản", "Đặc sản vùng miền"];
const locations = ["Tất cả", "Hà Nội", "Đà Lạt", "Tiền Giang", "Hà Giang", "Lâm Đồng", "Bình Thuận"];

const Products = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Tất cả");
  const [selectedLocation, setSelectedLocation] = useState("Tất cả");
  const [priceRange, setPriceRange] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [viewMode, setViewMode] = useState("grid");

  const { data: products = [], isLoading, error } = useProducts();

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "Tất cả" || product.categories?.name === selectedCategory;
    const matchesLocation = selectedLocation === "Tất cả" || product.location?.includes(selectedLocation);
    
    let matchesPrice = true;
    const price = Number(product.price);
    if (priceRange === "under20k") matchesPrice = price < 20000;
    else if (priceRange === "20k-40k") matchesPrice = price >= 20000 && price <= 40000;
    else if (priceRange === "over40k") matchesPrice = price > 40000;

    return matchesSearch && matchesCategory && matchesLocation && matchesPrice;
  });

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

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <p className="text-red-500 text-lg">Có lỗi xảy ra khi tải sản phẩm</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex gap-8">
          {/* Sidebar Filters */}
          <div className="w-1/4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Filter className="w-5 h-5 mr-2" />
                  Lọc sản phẩm
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Search */}
                <div>
                  <Label className="text-sm font-medium mb-2 block">Tìm kiếm</Label>
                  <Input
                    placeholder="Tên sản phẩm..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                {/* Category */}
                <div>
                  <Label className="text-sm font-medium mb-2 block">Danh mục</Label>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(category => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Location */}
                <div>
                  <Label className="text-sm font-medium mb-2 block">Vùng miền</Label>
                  <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {locations.map(location => (
                        <SelectItem key={location} value={location}>
                          {location}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Price Range */}
                <div>
                  <Label className="text-sm font-medium mb-3 block">Khoảng giá</Label>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="all" 
                        checked={priceRange === "all"}
                        onCheckedChange={() => setPriceRange("all")}
                      />
                      <Label htmlFor="all">Tất cả</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="under20k" 
                        checked={priceRange === "under20k"}
                        onCheckedChange={() => setPriceRange("under20k")}
                      />
                      <Label htmlFor="under20k">Dưới 20.000đ</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="20k-40k" 
                        checked={priceRange === "20k-40k"}
                        onCheckedChange={() => setPriceRange("20k-40k")}
                      />
                      <Label htmlFor="20k-40k">20.000đ - 40.000đ</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="over40k" 
                        checked={priceRange === "over40k"}
                        onCheckedChange={() => setPriceRange("over40k")}
                      />
                      <Label htmlFor="over40k">Trên 40.000đ</Label>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Header with sort and view options */}
            <div className="flex justify-between items-center mb-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-800">
                  Tất cả sản phẩm
                </h1>
                <p className="text-gray-600">
                  Tìm thấy {filteredProducts.length} sản phẩm
                </p>
              </div>

              <div className="flex items-center space-x-4">
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Mới nhất</SelectItem>
                    <SelectItem value="price-low">Giá thấp đến cao</SelectItem>
                    <SelectItem value="price-high">Giá cao đến thấp</SelectItem>
                    <SelectItem value="rating">Đánh giá cao nhất</SelectItem>
                  </SelectContent>
                </Select>

                <div className="flex border rounded-lg">
                  <Button 
                    variant={viewMode === "grid" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("grid")}
                  >
                    <Grid className="w-4 h-4" />
                  </Button>
                  <Button 
                    variant={viewMode === "list" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("list")}
                  >
                    <List className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Products Grid */}
            <div className={`grid gap-6 ${viewMode === "grid" ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"}`}>
              {filteredProducts.map(product => (
                <ProductCard key={product.id} product={{
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
                }} />
              ))}
            </div>

            {filteredProducts.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">Không tìm thấy sản phẩm nào phù hợp</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Products;
