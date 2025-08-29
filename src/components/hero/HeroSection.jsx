import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/autoplay";
import { Autoplay } from "swiper/modules";
import { Link } from "react-router-dom";

export default function HeroSection() {
  return (
   <section className="relative text-center mb-12 h-[350px] md:h-[450px] w-full overflow-hidden">
  {/* Background Slider */}
  <Swiper
    modules={[Autoplay]}
    autoplay={{ delay: 3000, disableOnInteraction: false }}
    loop={true}
    className="h-full w-full"
  >
    <SwiperSlide>
      <img
        src="public\header_img.png"
        alt="Food"
        className="h-full w-full object-cover"
      />
    </SwiperSlide>
    <SwiperSlide>
      <img
        src="public\happy-hard-working-handsome-male-driver-scooter-with-red-helmet-delivering-pizza.jpg"
        alt="Groceries"
        className="h-full w-full object-cover"
      />
    </SwiperSlide>
    <SwiperSlide>
      <img
        src="https://images.unsplash.com/photo-1504674900247-0877df9cc836"
        alt="Delivery"
        className="h-full w-full object-cover"
      />
    </SwiperSlide>
    <SwiperSlide>
      <img
        src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c"
        alt="Indian Cuisine"
        className="h-full w-full object-cover"
      />
    </SwiperSlide>
  </Swiper>

  {/* Dark Overlay */}
  <div className="absolute inset-0 bg-black/40 z-10"></div>

  {/* Hero Content (always above images + overlay) */}
  <div className="absolute inset-0 z-20 flex flex-col items-center justify-center px-4">
    <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
      Delicious Food & Fresh Groceries
    </h2>
    <p className="text-lg md:text-xl text-gray-200 mb-6">
      Delivered to your doorstep in minutes
    </p>

    <div className="flex flex-wrap justify-center gap-4 mb-4">
      <Link to='/food' className="px-6 py-2 rounded-full font-semibold bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg">
        🍕 Food Delivery
      </Link>
      <Link to='/grocery' className="px-6 py-2 rounded-full font-semibold bg-gradient-to-r from-green-500 to-blue-500 text-white shadow-lg">
        🛒 Grocery Shopping
      </Link>
    </div>
  </div>
</section>


  );
}
