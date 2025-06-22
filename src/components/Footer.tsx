import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white py-12 mt-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="flex flex-col items-start">
            <div className="flex items-center mb-3">
              <img
                src="/logo.png"
                alt="Chợ Cứu Nông"
                className="w-12 h-12 rounded-full shadow border-2 border-yellow-400 mr-3 animate-bounce"
              />
              <div>
                <h3 className="text-2xl font-extrabold text-yellow-300 mb-1">
                  Chợ Cứu Nông
                </h3>
                <div className="text-sm text-yellow-100 font-semibold">
                  Nông sản sạch - Giá Việt - Giao tận nơi
                </div>
              </div>
            </div>
            <p className="text-gray-400 mb-2">
              Nền tảng kết nối nông dân và người tiêu dùng, hướng tới nền nông
              nghiệp bền vững.
            </p>
            {
              /* <a href="https://chocuunong.liteease.com" target="_blank" rel="noopener noreferrer" className="mt-2 px-3 py-1 rounded-full bg-yellow-300 text-green-900 font-bold text-xs shadow hover:bg-yellow-400 transition animate-pulse">
                Website mới: chocuunong.liteease.com
              </a> */
            }
          </div>
          <div>
            <h4 className="font-semibold mb-4">Liên kết nhanh</h4>
            <ul className="space-y-2 text-gray-400">
              <li>
                <Link to="/products" className="hover:text-white">
                  Sản phẩm
                </Link>
              </li>
              <li>
                <Link to="/auth" className="hover:text-white">Đăng ký</Link>
              </li>
              <li>
                <Link to="/auth" className="hover:text-white">Đăng nhập</Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Hỗ trợ</h4>
            <ul className="space-y-2 text-gray-400">
              <li>
                <a href="#" className="hover:text-white">Trung tâm trợ giúp</a>
              </li>
              <li>
                <a href="#" className="hover:text-white">Liên hệ</a>
              </li>
              <li>
                <a href="/chinh-sach" className="hover:text-white">Chính sách</a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Liên hệ</h4>
            <ul className="space-y-2 text-gray-400">
              <li>Email: ngocdb0704@gmail.com</li>
              <li>Hotline: 0886799110</li>
              <li>
                Địa chỉ: Hà Nội, Việt Nam <span className="ml-1">🇻🇳</span>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; 2025 Chợ Cứu Nông. Tất cả quyền được bảo lưu.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
