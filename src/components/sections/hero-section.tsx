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
                        onClick={() => router.push('/homemade')}
                     >
                        Order Homemade Food
                     </Button>
                     <Button
                        size="lg"
                        variant="outline"
                        className="border-2 border-white/20 bg-white/5 backdrop-blur-sm text-white h-14 px-8 text-lg font-medium hover:bg-white/10 hover:border-white/30 rounded-xl"
                        onClick={() => router.push('/browse')}
                     >
                        Browse All Categories
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

                  {/* Secondary Categories Strip */}
                  <div className="w-full mt-12 md:mt-10">
                     <p className="text-base md:text-sm font-bold md:font-semibold text-white mb-6 uppercase tracking-wider flex items-center gap-3">
                        <span className="w-12 h-[2px] bg-orange-500"></span>
                        Also Delivering From
                     </p>

                     <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
                        {[
                           { label: 'Grocery', icon: ShoppingBasket, color: 'text-green-500', bg: 'bg-green-500/10', border: 'border-green-500/20' },
                           { label: 'Restaurants', icon: Utensils, color: 'text-red-500', bg: 'bg-red-500/10', border: 'border-red-500/20' },
                           { label: 'Bakery', icon: Croissant, color: 'text-amber-500', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
                           { label: 'Local Shops', icon: Store, color: 'text-blue-500', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
                        ].map((cat, idx) => (
                           <button
                              key={idx}
                              onClick={() => router.push(
                                 cat.label === 'Local Shops'
                                    ? '/browse'
                                    : `/category/${cat.label === 'Grocery' ? 'Grocery Store' : cat.label === 'Restaurants' ? 'Restaurant' : cat.label}`
                              )}
                              className={`flex items-center gap-3 px-4 py-3 rounded-xl backdrop-blur-md border ${cat.bg} ${cat.border} hover:bg-white/10 transition-all group text-left`}
                           >
                              <div className={`p-2 rounded-full bg-black/20 ${cat.color} group-hover:scale-110 transition-transform`}>
                                 <cat.icon className="w-5 h-5" />
                              </div>
                              <span className="text-sm font-semibold text-white tracking-wide">{cat.label}</span>
                           </button>
                        ))}
                     </div>
                  </div>

               </motion.div>
            </div>
         </div>
      </section>
   );
}
