import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, ShoppingCart, User, Menu, X, Leaf, LogOut, Plus, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { useCart } from "@/hooks/useCart";
import { supabase } from "@/integrations/supabase/client";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { cartItems } = useCart();
  const [userType, setUserType] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      if (user) {
        const { data } = await supabase
          .from("profiles")
          .select("user_type")
          .eq("id", user.id)
          .single();
        setUserType(data?.user_type || null);
      } else {
        setUserType(null);
      }
    };
    fetchProfile();
  }, [user]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <img src="/logo.png" alt="Chợ Cứu Nông" className="w-10 h-10 rounded-full shadow border-2 border-green-600" />
            <div className="flex flex-col">
              <span className="text-2xl font-extrabold text-green-800 group-hover:text-green-600 transition">Chợ Cứu Nông</span>
              <span className="text-xs text-yellow-600 font-semibold tracking-wide">Nông sản sạch - Giá Việt - Giao tận nơi</span>
            </div>
          </Link>
          <a href="https://chocuunong.liteease.com" target="_blank" rel="noopener noreferrer" className="ml-4 px-3 py-1 rounded-full bg-yellow-300 text-green-900 font-bold text-xs shadow hover:bg-yellow-400 transition hidden md:inline-block animate-pulse">
            Website mới: chocuunong.liteease.com
          </a>

          {/* Search bar */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-lg mx-8">
            <div className="relative w-full">
              <Input
                type="text"
                placeholder="Tìm kiếm nông sản..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pr-10"
              />
              <Button
                type="submit"
                size="sm"
                className="absolute right-1 top-1/2 transform -translate-y-1/2 bg-green-600 hover:bg-green-700"
              >
                <Search className="h-4 w-4" />
              </Button>
            </div>
          </form>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link to="/" className="text-gray-700 hover:text-green-600 transition-colors">
              Trang chủ
            </Link>
            <Link to="/products" className="text-gray-700 hover:text-green-600 transition-colors">
              Sản phẩm
            </Link>

            {user ? (
              <>
                <Link to="/cart">
                  <Button variant="ghost" size="sm" className="relative">
                    <ShoppingCart className="h-5 w-5" />
                    <Badge className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {cartItems.length}
                    </Badge>
                  </Button>
                </Link>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <User className="h-5 w-5 mr-2" />
                      Tài khoản
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuItem asChild>
                      <Link to="/profile" className="cursor-pointer">
                        <User className="h-4 w-4 mr-2" />
                        Hồ sơ cá nhân
                      </Link>
                    </DropdownMenuItem>

                    <DropdownMenuItem asChild>
                      <Link to="/orders" className="cursor-pointer">
                        <ShoppingCart className="h-4 w-4 mr-2" />
                        Đơn hàng
                      </Link>
                    </DropdownMenuItem>

                    <DropdownMenuSeparator />

                    {userType === 'seller' && <>
                      <DropdownMenuItem asChild>
                        <Link to="/seller/dashboard" className="cursor-pointer">
                          <Package className="h-4 w-4 mr-2" />
                          Quản lý bán hàng
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to="/seller/add-product" className="cursor-pointer">
                          <Plus className="h-4 w-4 mr-2" />
                          Đăng sản phẩm
                        </Link>
                      </DropdownMenuItem>
                    </>}

                    <DropdownMenuSeparator />

                    <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer">
                      <LogOut className="h-4 w-4 mr-2" />
                      Đăng xuất
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <Link to="/auth">
                <Button className="bg-green-600 hover:bg-green-700">
                  Đăng nhập
                </Button>
              </Link>
            )}
          </nav>

          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden border-t bg-white py-4">
            <div className="space-y-4">
              <form onSubmit={handleSearch} className="px-4">
                <div className="relative">
                  <Input
                    type="text"
                    placeholder="Tìm kiếm nông sản..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pr-10"
                  />
                  <Button
                    type="submit"
                    size="sm"
                    className="absolute right-1 top-1/2 transform -translate-y-1/2 bg-green-600 hover:bg-green-700"
                  >
                    <Search className="h-4 w-4" />
                  </Button>
                </div>
              </form>

              <nav className="space-y-2 px-4">
                <Link
                  to="/"
                  className="block py-2 text-gray-700 hover:text-green-600 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Trang chủ
                </Link>
                <Link
                  to="/products"
                  className="block py-2 text-gray-700 hover:text-green-600 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Sản phẩm
                </Link>

                {user ? (
                  <>
                    <Link
                      to="/cart"
                      className="block py-2 text-gray-700 hover:text-green-600 transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Giỏ hàng
                    </Link>
                    <Link
                      to="/profile"
                      className="block py-2 text-gray-700 hover:text-green-600 transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Hồ sơ
                    </Link>
                    {userType === 'seller' && <>
                      <Link
                        to="/seller/dashboard"
                        className="block py-2 text-gray-700 hover:text-green-600 transition-colors"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Quản lý bán hàng
                      </Link>
                      <button
                        onClick={() => {
                          handleSignOut();
                          setIsMenuOpen(false);
                        }}
                        className="block py-2 text-gray-700 hover:text-green-600 transition-colors w-full text-left"
                      >
                        Đăng xuất
                      </button>
                    </>}
                  </>
                ) : (
                  <Link
                    to="/auth"
                    className="block py-2"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Button className="w-full bg-green-600 hover:bg-green-700">
                      Đăng nhập
                    </Button>
                  </Link>
                )}
              </nav>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
