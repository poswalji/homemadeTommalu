'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Clock, Timer, Flame, IndianRupee, ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function HeroSection() {
   const router = useRouter();
   const [mounted, setMounted] = useState(false);
   const [currentTime, setCurrentTime] = useState(new Date());

   useEffect(() => {
      setMounted(true);
      const timer = setInterval(() => setCurrentTime(new Date()), 60000);
      return () => clearInterval(timer);
   }, []);

   // Default values for SSR
   let mealType = 'Lunch';
   let timeMessage = 'Ends in 45 min';
   let ctaText = 'Order Lunch @ ₹99';
   let isActive = true;
   let platesLeft = 12;

   if (mounted) {
      const hours = currentTime.getHours();
      const minutes = currentTime.getMinutes();
      const totalMinutes = hours * 60 + minutes;

      if (totalMinutes >= 10 * 60 && totalMinutes < 15 * 60) {
         isActive = true;
         mealType = 'Lunch';
         timeMessage = `Ends in ${15 * 60 - totalMinutes} min`;
         ctaText = 'Order Lunch @ ₹99';
         platesLeft = Math.max(3, 25 - Math.floor((totalMinutes - 10 * 60) / 15)); 
      } else if (totalMinutes >= 17 * 60 && totalMinutes < 22 * 60) {
         isActive = true;
         mealType = 'Dinner';
         timeMessage = `Ends in ${22 * 60 - totalMinutes} min`;
         ctaText = 'Order Dinner @ ₹99';
         platesLeft = Math.max(3, 25 - Math.floor((totalMinutes - 17 * 60) / 15));
      } else if (totalMinutes < 10 * 60) {
         isActive = false;
         mealType = 'Lunch';
         timeMessage = 'Starts at 10 AM';
         ctaText = 'Order Lunch @ ₹99';
         platesLeft = 25;
      } else if (totalMinutes >= 15 * 60 && totalMinutes < 17 * 60) {
         isActive = false;
         mealType = 'Dinner';
         timeMessage = 'Starts at 5 PM';
         ctaText = 'Order Dinner @ ₹99';
         platesLeft = 25;
      } else {
         // after 10 PM
         isActive = false;
         mealType = 'Lunch';
         timeMessage = 'Starts at 10 AM';
         ctaText = 'Order Lunch @ ₹99';
         platesLeft = 25;
      }
   }

   return (
      <section className="relative min-h-screen py-16 md:py-24 flex items-center overflow-hidden">
         {/* Background Image & Overlay */}
         <div className="absolute inset-0 z-0">
            <div
               className="w-full h-full bg-cover bg-center bg-no-repeat absolute"
               style={{ backgroundImage: "url('/bg1.jpg')" }}
            />
            {/* Dark Overlay for Text Readability */}
            <div className="absolute inset-0 bg-black/60 bg-gradient-to-r from-black/90 via-black/60 to-black/30" />
         </div>

         {/* Content Container */}
         <div className="container px-4 md:px-8 mx-auto relative z-10 w-full pt-12 md:pt-0">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
               
               {/* Left Column (Headline, Details, CTA) */}
               <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                  className="lg:col-span-7"
               >
                  {/* Pre-order Alert */}
                  <div className="inline-flex items-center gap-2 px-4 py-2 mb-6 bg-amber-500 text-black font-bold text-xs sm:text-sm md:text-base rounded-lg shadow-lg animate-pulse">
                     <Clock className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
                     <span>Pre-order before 1:00 PM (Lunch) / 9:00 PM (Dinner) for Free Delivery!</span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 mb-4">
                     <span className="inline-block px-3.5 py-1 text-xs sm:text-sm font-semibold tracking-wide text-orange-200 bg-orange-600/30 backdrop-blur-md border border-orange-500/40 rounded-full">
                        ✨ 100% Ghar Ka Swaad • Pure Veg
                     </span>
                     <span className="inline-block px-3 py-1 text-xs font-semibold tracking-wide text-green-300 bg-green-900/40 border border-green-500/30 rounded-full">
                        🧈 Desi Ghee
                     </span>
                  </div>

                  <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight text-white leading-[1.1] mb-6 drop-shadow-md">
                     Authentic <span className="text-orange-500">Homemade Food</span>, Delivered Fresh.
                  </h1>

                  <p className="text-base sm:text-lg md:text-xl text-stone-200 mb-8 max-w-xl leading-relaxed font-light">
                     Wholesome, piping hot home-cooked meals prepared with love & hygiene. Soft Desi Ghee rotis, rich dal tadka, fresh daily sabji & chilled chach delivered to your doorstep.
                  </p>

                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 mb-8">
                     <Button
                        size="lg"
                        className="bg-orange-600 hover:bg-orange-700 text-white h-14 px-8 text-lg font-bold shadow-[0_0_25px_rgba(234,88,12,0.5)] hover:shadow-[0_0_35px_rgba(234,88,12,0.7)] transition-all rounded-xl relative overflow-hidden group border border-orange-500/50 cursor-pointer"
                        onClick={() => document.getElementById('homemadefood')?.scrollIntoView({ behavior: 'smooth' })}
                     >
                        <span className="relative z-10 flex items-center justify-center gap-2">
                           {mounted ? ctaText : 'Order Lunch @ ₹99'} <ArrowRight className="w-5 h-5 group-hover:translate-x-1.5 transition-transform" />
                        </span>
                     </Button>
                     <Button
                        variant="outline"
                        size="lg"
                        className="border-white/20 hover:border-white/40 bg-white/10 hover:bg-white/20 text-white h-14 px-6 text-base font-semibold backdrop-blur-md rounded-xl cursor-pointer"
                        onClick={() => document.getElementById('homemadefood')?.scrollIntoView({ behavior: 'smooth' })}
                     >
                        View Today's Menu
                     </Button>
                  </div>

                  {/* Urgency & Trust Indicators */}
                  <div className="grid grid-cols-3 gap-2 sm:gap-4 text-white/90">
                     <div className="flex items-center gap-2 sm:gap-3 bg-red-600/20 border border-red-500/30 p-2.5 sm:px-4 sm:py-2.5 rounded-xl backdrop-blur-sm shadow-md">
                        <div className="p-1 sm:p-1.5 bg-red-500/30 rounded-full shrink-0">
                           <Flame className="w-4 h-4 sm:w-5 sm:h-5 text-red-400" />
                        </div>
                        <div className="min-w-0">
                           <p className="font-bold text-red-300 text-xs sm:text-sm truncate">Only {mounted ? platesLeft : 12} Left</p>
                           <p className="text-[10px] sm:text-xs text-red-200/70 hidden sm:block">Selling fast</p>
                        </div>
                     </div>
                     <div className="flex items-center gap-2 sm:gap-3 bg-green-600/20 border border-green-500/30 p-2.5 sm:px-4 sm:py-2.5 rounded-xl backdrop-blur-sm shadow-md">
                        <div className="p-1 sm:p-1.5 bg-green-500/30 rounded-full shrink-0">
                           <IndianRupee className="w-4 h-4 sm:w-5 sm:h-5 text-green-400" />
                        </div>
                        <div className="min-w-0">
                           <p className="font-bold text-green-300 text-xs sm:text-sm">₹99 Special</p>
                           <p className="text-[10px] sm:text-xs text-green-200/70 hidden sm:block">{mounted ? mealType : 'Lunch'}</p>
                        </div>
                     </div>
                     <div className="flex items-center gap-2 sm:gap-3 bg-orange-600/20 border border-orange-500/30 p-2.5 sm:px-4 sm:py-2.5 rounded-xl backdrop-blur-sm shadow-md">
                        <div className="p-1 sm:p-1.5 bg-orange-500/30 rounded-full shrink-0">
                           <Timer className="w-4 h-4 sm:w-5 sm:h-5 text-orange-400" />
                        </div>
                        <div className="min-w-0">
                           <p className="font-bold text-orange-300 text-xs sm:text-sm truncate">{mounted ? timeMessage : 'Ends 45m'}</p>
                           <p className="text-[10px] sm:text-xs text-orange-200/70 hidden sm:block">Fresh & Hot</p>
                        </div>
                     </div>
                  </div>
               </motion.div>

               {/* Right Column (Real Thali Photo Showcase Card) */}
               <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.7, delay: 0.2 }}
                  className="lg:col-span-5 relative mt-4 lg:mt-0"
               >
                  {/* Decorative Glow */}
                  <div className="absolute -inset-1.5 bg-gradient-to-r from-orange-500 via-amber-500 to-red-500 rounded-3xl blur-xl opacity-40 group-hover:opacity-60 transition duration-1000" />

                  {/* Glassmorphism Card Wrapper */}
                  <div className="relative bg-stone-900/90 backdrop-blur-xl border border-white/20 rounded-3xl p-3 sm:p-4 shadow-2xl overflow-hidden">
                     
                     {/* Badge on top */}
                     <div className="flex items-center justify-between pb-3 px-2">
                        <div className="flex items-center gap-1.5">
                           <span className="relative flex h-2.5 w-2.5">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
                           </span>
                           <span className="text-xs font-bold text-white tracking-wide uppercase">Real Thali Plate</span>
                        </div>
                        <span className="text-[11px] font-semibold text-orange-300 bg-orange-500/20 border border-orange-500/40 px-2.5 py-0.5 rounded-full">
                           Tommalu Kitchen
                        </span>
                     </div>

                     {/* Main Real Image */}
                     <div className="relative aspect-square rounded-2xl overflow-hidden border border-white/10 group shadow-inner">
                        <Image
                           src="/thali-enhanced.jpg"
                           alt="Tommalu Authentic Homemade Thali Meal"
                           fill
                           priority
                           className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                        />
                        
                        {/* Overlay Gradient at bottom */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent pointer-events-none" />

                        {/* Floating Badges over the photo */}
                        <div className="absolute top-3 left-3 bg-black/70 backdrop-blur-md border border-white/20 text-white text-[11px] font-bold px-2.5 py-1 rounded-lg flex items-center gap-1 shadow-lg">
                           🧈 Desi Ghee Roti
                        </div>

                        <div className="absolute top-3 right-3 bg-black/70 backdrop-blur-md border border-white/20 text-white text-[11px] font-bold px-2.5 py-1 rounded-lg flex items-center gap-1 shadow-lg">
                           🥛 Chilled Chach
                        </div>

                        <div className="absolute bottom-3 left-3 right-3 text-white">
                           <p className="text-sm sm:text-base font-extrabold drop-shadow leading-tight">
                              4 Roti • Dal Tadka • Sabji • Salad • Chach
                           </p>
                           <p className="text-[11px] text-stone-300 mt-1 font-medium flex items-center justify-between">
                              <span className="text-emerald-400 font-semibold">✓ Exact Meal Served</span>
                              <span className="text-orange-400 font-extrabold text-sm">₹99 Only</span>
                           </p>
                        </div>
                     </div>

                     {/* Card Bottom Subtext */}
                     <div className="mt-3 px-2 pt-1 flex items-center justify-between text-xs text-stone-400 font-medium border-t border-white/10">
                        <span className="flex items-center gap-1 text-emerald-400">
                           <CheckCircle2 className="w-3.5 h-3.5" /> 100% Homemade Taste
                        </span>
                        <span>FSSAI Lic. #22226043000221</span>
                     </div>
                  </div>
               </motion.div>

            </div>
         </div>
      </section>
   );
}

