import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Marquee from "react-fast-marquee";

const slides = [
    {
        image: "/slider/vietnam-ricefield.jpg",
        caption: "Chung tay giải cứu nông sản Việt!"
    },
    {
        image: "/slider/vietnam-farmer.jpg",
        caption: "Mua nông sản - Cứu trợ nông dân - Lan tỏa yêu thương!"
    },
    {
        image: "/slider/vietnam-market.jpg",
        caption: "Nông sản quê hương – Đừng để lãng phí!"
    },
    {
        image: "/slider/vietnam-fruit.jpg",
        caption: "Nông sản tươi ngon, giá tận gốc, hỗ trợ nông dân vượt khó!"
    },
    {
        image: "/slider/vietnam-vegetable.jpg",
        caption: "Cùng Chợ Cứu Nông giải cứu nông sản Việt!"
    }
];

const HeroSlider = () => {
    return (
        <div className="relative w-full h-[400px] md:h-[500px] rounded-2xl overflow-hidden shadow-xl">
            <img
                src="/slider/vietnam-market.jpg"
                alt="Chợ Cứu Nông - Giải cứu nông sản Việt"
                className="w-full h-[400px] md:h-[500px] object-cover object-center"
            />
            {/* Overlay trung tâm */}
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-t from-black/60 to-transparent">
                <img src="/logo.png" alt="Chợ Cứu Nông" className="w-20 h-20 rounded-full shadow-lg border-4 border-white mb-4 animate-bounce" />
                <div className="text-3xl md:text-5xl font-extrabold text-white drop-shadow-lg text-center mb-2 animate-pulse">
                    Chợ Cứu Nông
                </div>
                <div className="text-lg md:text-2xl text-yellow-300 font-bold drop-shadow text-center animate-bounce animate-infinite animate-duration-1000 animate-ease-in-out">
                    Chung tay giải cứu nông sản Việt!
                </div>
            </div>
        </div>
    );
};

export default HeroSlider; 