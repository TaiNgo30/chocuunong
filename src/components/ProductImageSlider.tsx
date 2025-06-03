import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

interface ProductImageSliderProps {
    images: string[];
    alt?: string;
}

const ProductImageSlider = ({ images, alt }: ProductImageSliderProps) => {
    const sliderImages = images && images.length > 0 ? images : ["/placeholder.svg"];
    const settings = {
        dots: true,
        infinite: true,
        speed: 600,
        slidesToShow: 1,
        slidesToScroll: 1,
        autoplay: true,
        autoplaySpeed: 3500,
        arrows: true,
        pauseOnHover: true
    };
    return (
        <div className="relative w-full h-[400px] md:h-[500px] rounded-xl overflow-hidden shadow-xl">
            <Slider {...settings}>
                {sliderImages.map((img, idx) => (
                    <div key={idx} className="w-full h-[400px] md:h-[500px]">
                        <img
                            src={img}
                            alt={alt || `Ảnh sản phẩm ${idx + 1}`}
                            className="w-full h-[400px] md:h-[500px] object-cover object-center scale-100 hover:scale-105 transition-transform duration-700"
                        />
                    </div>
                ))}
            </Slider>
        </div>
    );
};

export default ProductImageSlider; 