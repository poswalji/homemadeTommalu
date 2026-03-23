'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowRight, ShoppingBasket, Store, Croissant, Utensils, Star, Clock, ShieldCheck } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function HeroSection() {
   const router = useRouter();

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

                  <div className="flex flex-col sm:flex-row gap-4 mb-16">
                     <Button
                        size="lg"
                        className="bg-orange-600 hover:bg-orange-700 text-white h-14 px-8 text-lg font-semibold shadow-lg hover:shadow-orange-500/20 transition-all rounded-xl"
                        onClick={() => document.getElementById('homemadefood')?.scrollIntoView({ behavior: 'smooth' })}
                     >
                        Order Homemade Food
                     </Button>
                     
                  </div>

                  {/* Trust Indicators */}
                  <div className="flex flex-wrap gap-8 text-white/90 mb-12">
                     <div className="flex items-center gap-3">
                        <div className="p-2 bg-white/10 rounded-full backdrop-blur-sm">
                           <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                        </div>
                        <div>
                           <p className="font-bold">4.9/5</p>
                           <p className="text-xs text-white/70">Customer Rating</p>
                        </div>
                     </div>
                     <div className="flex items-center gap-3">
                        <div className="p-2 bg-white/10 rounded-full backdrop-blur-sm">
                           <Clock className="w-5 h-5 text-orange-400" />
                        </div>
                        <div>
                           <p className="font-bold">30 Mins</p>
                           <p className="text-xs text-white/70">Average Delivery</p>
                        </div>
                     </div>
                     <div className="flex items-center gap-3">
                        <div className="p-2 bg-white/10 rounded-full backdrop-blur-sm">
                           <ShieldCheck className="w-5 h-5 text-green-400" />
                        </div>
                        <div>
                           <p className="font-bold">100% Hygienic</p>
                           <p className="text-xs text-white/70">Safety Checked</p>
                        </div>
                     </div>
                  </div>

               

               </motion.div>
            </div>
         </div>
      </section>
   );
}
