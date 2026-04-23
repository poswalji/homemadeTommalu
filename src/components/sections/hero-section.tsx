'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Clock, Timer, Flame, IndianRupee, ArrowRight } from 'lucide-react';
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
            <div className="max-w-3xl">
               <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
               >
                  {/* Pre-order Alert */}
                  <div className="inline-flex items-center gap-2 px-4 py-2 mb-8 bg-amber-500 text-black font-bold text-sm md:text-base rounded-lg shadow-lg animate-pulse">
                     <Clock className="w-5 h-5" />
                     <span>Homemade meals are prepared fresh daily. Pre-order by 11AM for Lunch / 7PM for Dinner.</span>
                  </div>
                  <br />

                  <span className="inline-block px-4 py-1.5 mb-6 text-sm font-semibold tracking-wide text-orange-100 bg-orange-600/20 backdrop-blur-md border border-orange-500/30 rounded-full">
                     Authentic • Homemade • Local
                  </span>

                  <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-white leading-[1.1] mb-6 drop-shadow-sm">
                     Authentic <span className="text-orange-500">Homemade Food</span>, Delivered.
                  </h1>

                  <p className="text-xl md:text-2xl text-gray-200 mb-8 max-w-2xl leading-relaxed font-light">
                     Enjoy wholesome, home-cooked meals prepared by local moms and kitchens. From piping hot Thalis to fresh Tiffin services.
                  </p>

                  <div className="flex flex-col sm:flex-row gap-4 mb-12">
                     <Button
                        size="lg"
                        className="bg-orange-600 hover:bg-orange-700 text-white h-14 px-8 text-lg font-semibold shadow-[0_0_20px_rgba(234,88,12,0.4)] hover:shadow-[0_0_30px_rgba(234,88,12,0.6)] transition-all rounded-xl relative overflow-hidden group border border-orange-500/50"
                        onClick={() => document.getElementById('homemadefood')?.scrollIntoView({ behavior: 'smooth' })}
                     >
                        <span className="relative z-10 flex items-center gap-2">
                           {mounted ? ctaText : 'Order Lunch @ ₹99'} <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </span>
                     </Button>
                  </div>

                  {/* Urgency & Trust Indicators */}
                  <div className="flex flex-wrap gap-4 sm:gap-6 text-white/90 mb-12">
                     <div className="flex items-center gap-3 bg-red-600/20 border border-red-500/30 px-4 py-2.5 rounded-xl backdrop-blur-sm shadow-lg">
                        <div className="p-1.5 bg-red-500/20 rounded-full animate-pulse">
                           <Flame className="w-5 h-5 text-red-500" />
                        </div>
                        <div>
                           <p className="font-bold text-red-400">Only {mounted ? platesLeft : 12} Plates Left</p>
                           <p className="text-xs text-red-300/80">Selling fast</p>
                        </div>
                     </div>
                     <div className="flex items-center gap-3 bg-green-600/20 border border-green-500/30 px-4 py-2.5 rounded-xl backdrop-blur-sm shadow-lg">
                        <div className="p-1.5 bg-green-500/20 rounded-full">
                           <IndianRupee className="w-5 h-5 text-green-400" />
                        </div>
                        <div>
                           <p className="font-bold text-green-400">₹99 {mounted ? mealType : 'Lunch'}</p>
                           <p className="text-xs text-green-300/80">Today's Special</p>
                        </div>
                     </div>
                     <div className="flex items-center gap-3 bg-orange-600/20 border border-orange-500/30 px-4 py-2.5 rounded-xl backdrop-blur-sm shadow-lg">
                        <div className="p-1.5 bg-orange-500/20 rounded-full">
                           <Timer className="w-5 h-5 text-orange-400" />
                        </div>
                        <div>
                           <p className="font-bold text-orange-400">{mounted ? timeMessage : 'Ends in 45 min'}</p>
                           <p className="text-xs text-orange-300/80">{mounted && isActive ? 'Order Now' : 'Upcoming'}</p>
                        </div>
                     </div>
                  </div>

               </motion.div>
            </div>
         </div>
      </section>
   );
}

