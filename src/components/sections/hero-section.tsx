'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowRight, ShoppingCart, TrendingUp, Sparkles, Shield, Zap } from 'lucide-react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, EffectFade, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/effect-fade';
import 'swiper/css/pagination';

export function HeroSection() {
   return (
      <section className='relative overflow-hidden  py-20'>
         <div className="fixed inset-0 -z-10">
            <Swiper
               modules={[Autoplay, EffectFade, Pagination]}
               effect="fade"
               autoplay={{ delay: 3000, disableOnInteraction: false }}
               speed={800}
               loop
               pagination={{ clickable: true }}
               className="h-full w-full"
            >
               {['bg1.jpg', 'bg2.jpg', 'bg3.jpg'].map((src, idx) => (
                  <SwiperSlide key={idx}>
                     <div
                        className="h-full w-full"
                        style={{
                           height: '100%',
                           backgroundImage: `url(${src})`,
                           backgroundSize: 'cover',
                           backgroundPosition: 'center',
                           backgroundRepeat: 'no-repeat',
                        }}
                     >
                        <div className="h-full w-full bg-black/40" />
                     </div>
                  </SwiperSlide>
               ))}
            </Swiper>
         </div>
         <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23FF6B6B\' fill-opacity=\'0.02\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-40"></div>

         <div className='container px-4 md:px-20 relative z-10'>
               <div className='grid lg:grid-cols-2 gap-12 items-center'>
                 <motion.div
                     initial={{ opacity: 0, x: -50 }}
                     animate={{ opacity: 1, x: 0 }}
                     transition={{ duration: 0.4 }}>
                     <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3, delay: 0.1 }}
                        className='inline-flex items-center space-x-2 rounded-full bg-[lab(66%_50.34_52.19)]/10 px-6 py-3 text-sm font-semibold text-[lab(66%_50.34_52.19)] mb-8 backdrop-blur-sm border border-[lab(66%_50.34_52.19)]/20'>
                        <Sparkles className='h-4 w-4' />
                        <span className="flex items-center gap-2">
                           <span className="relative flex h-3 w-3">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[lab(66%_50.34_52.19)] opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-3 w-3 bg-[lab(66%_50.34_52.19)]"></span>
                           </span>
                           Fast Delivery • Fresh Products • Best Prices
                        </span>
                     </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.15 }}
                        className='text-5xl md:text-7xl font-extrabold tracking-tight mb-6 leading-tight'>
                        <span className='text-white'>
                           Your Trusted
                        </span>
                        <br />
                        <span className='text-[lab(66%_50.34_52.19)]'>
                           Food & Grocery
                        </span>
                        <br />
                        <span className='text-[lab(66%_50.34_52.19)]'>
                           Partner
                        </span>
                     </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.2 }}
                        className='text-xl md:text-2xl text-white mb-8 leading-relaxed'>
                        Fast delivery, fresh produce, and great prices. Order now and
                        get your groceries and favorite meals delivered in{' '}
                        <span className="font-bold text-[lab(66%_50.34_52.19)]">20-30 minutes</span>.
                     </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.25 }}
                        className='flex flex-col sm:flex-row gap-4 mb-6'>
                        <Button size='lg' className='group text-base h-14 px-8 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all'>
                           <span className="font-semibold">Order Now</span>
                           <ArrowRight className='ml-2 h-5 w-5 transition-transform group-hover:translate-x-1' />
                        </Button>
                        <Button size='lg' variant='outline' className='h-14 px-8 border-2 hover:bg-gray-50 transform hover:scale-105 transition-all'>
                           <ShoppingCart className='mr-2 h-5 w-5' />
                           <span className="font-semibold">Browse Products</span>
                        </Button>
                     </motion.div>

                     {/* Trust Indicators */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3, delay: 0.3 }}
                        className='flex flex-wrap items-center gap-6 text-sm text-white'>
                        <div className="flex items-center gap-2">
                           <Shield className="h-5 w-5 text-green-600" />
                           <span className="font-medium">100% Secure</span>
                        </div>
                        <div className="flex items-center gap-2">
                           <Zap className="h-5 w-5 text-yellow-600" />
                           <span className="font-medium">Instant Delivery</span>
                        </div>
                        <div className="flex items-center gap-2">
                           <TrendingUp className="h-5 w-5 text-blue-600" />
                           <span className="font-medium">
                              Fresh Products
                               </span>
                        </div>
                     </motion.div>
                  </motion.div>

                 
            </div>
         </div>
      </section>
   );
}
