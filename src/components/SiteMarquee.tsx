import Marquee from "react-fast-marquee";

const SiteMarquee = () => (
    <Marquee speed={70} gradient={false} className="bg-gradient-to-r from-green-700 via-yellow-500 to-red-500 text-white py-3 font-extrabold text-xl shadow-lg tracking-wide animate-pulse uppercase">
        <span className="mx-10 flex items-center">🚜 <span className="ml-2">Cùng Chợ Cứu Nông giải cứu nông sản Việt – Mua là giúp nông dân vượt khó!</span></span>
        <span className="mx-10 flex items-center">🌾 <span className="ml-2">Đặt hàng ngay – Nông sản tươi ngon, giá tận gốc, hỗ trợ nông dân!</span></span>
        <span className="mx-10 flex items-center">🔥 <span className="ml-2">Truy cập <a href="https://chocuunong.liteease.com" target="_blank" rel="noopener noreferrer" className="underline text-yellow-300 hover:text-yellow-400 transition">chocuunong.liteease.com</a> – Chung tay giải cứu nông sản!</span></span>
        <span className="mx-10 flex items-center">❤️ <span className="ml-2">Lan tỏa yêu thương – Hỗ trợ nông dân Việt Nam!</span></span>
    </Marquee>
);

export default SiteMarquee; 