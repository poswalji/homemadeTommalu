'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowRight, ShoppingCart, TrendingUp, Sparkles, Shield, Zap } from 'lucide-react';

export function HeroSection() {
   return (
      <section className='relative overflow-hidden bg-gradient-to-br from-orange-50 via-white to-yellow-50 py-20 md:py-32'>
         {/* Animated Background Elements */}
         <div className="absolute inset-0 overflow-hidden">
            <motion.div
               animate={{
                  rotate: [0, 360],
                  scale: [1, 1.2, 1],
               }}
               transition={{
                  duration: 20,
                  repeat: Infinity,
                  ease: 'linear',
               }}
               className='absolute top-20 right-10 w-96 h-96 bg-gradient-to-br from-[#FF6B6B]/10 to-pink-200/10 rounded-full blur-3xl'
            />
            <motion.div
               animate={{
                  rotate: [360, 0],
                  scale: [1, 1.1, 1],
               }}
               transition={{
                  duration: 25,
                  repeat: Infinity,
                  ease: 'linear',
               }}
               className='absolute bottom-20 left-10 w-[500px] h-[500px] bg-gradient-to-br from-[#FECA57]/10 to-yellow-200/10 rounded-full blur-3xl'
            />
            <motion.div
               animate={{
                  rotate: [0, -360],
                  scale: [1, 1.15, 1],
               }}
               transition={{
                  duration: 30,
                  repeat: Infinity,
                  ease: 'linear',
               }}
               className='absolute top-1/2 right-1/4 w-80 h-80 bg-gradient-to-br from-purple-200/10 to-blue-200/10 rounded-full blur-3xl'
            />
         </div>

         {/* Grid Pattern Overlay */}
         <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23FF6B6B\' fill-opacity=\'0.02\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-40"></div>

         <div className='container px-4 md:px-20 relative z-10'>
            <div className='mx-auto'>
               <div className='grid lg:grid-cols-2 gap-12 items-center'>
                  {/* Left Content */}
                  <motion.div
                     initial={{ opacity: 0, x: -50 }}
                     animate={{ opacity: 1, x: 0 }}
                     transition={{ duration: 0.8 }}>
                     <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className='inline-flex items-center space-x-2 rounded-full bg-gradient-to-r from-[#FF6B6B]/10 to-[#FECA57]/10 px-6 py-3 text-sm font-semibold text-[#FF6B6B] mb-8 backdrop-blur-sm border border-[#FF6B6B]/20'>
                        <Sparkles className='h-4 w-4' />
                        <span className="flex items-center gap-2">
                           <span className="relative flex h-3 w-3">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FF6B6B] opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-3 w-3 bg-[#FF6B6B]"></span>
                           </span>
                           Fast Delivery • Fresh Products • Best Prices
                        </span>
                     </motion.div>

                     <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.3 }}
                        className='text-5xl md:text-7xl font-extrabold tracking-tight mb-6 leading-tight'>
                        <span className='bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent'>
                           Your Trusted
                        </span>
                        <br />
                        <span className='bg-gradient-to-r from-[#FF6B6B] via-orange-500 to-[#FECA57] bg-clip-text text-transparent'>
                           Food & Grocery
                        </span>
                        <br />
                        <span className='bg-gradient-to-r from-[#FF6B6B] to-[#FECA57] bg-clip-text text-transparent'>
                           Partner
                        </span>
                     </motion.h1>

                     <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.4 }}
                        className='text-xl md:text-2xl text-gray-600 mb-8 leading-relaxed'>
                        Fast delivery, fresh produce, and great prices. Order now and
                        get your groceries and favorite meals delivered in{' '}
                        <span className="font-bold text-[#FF6B6B]">20-30 minutes</span>.
                     </motion.p>

                     <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.5 }}
                        className='flex flex-col sm:flex-row gap-4 mb-8'>
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
                        transition={{ duration: 0.6, delay: 0.6 }}
                        className='flex flex-wrap items-center gap-6 text-sm text-gray-600'>
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

                  {/* Right Content - Visual Elements */}
                  <motion.div
                     initial={{ opacity: 0, x: 50 }}
                     animate={{ opacity: 1, x: 0 }}
                     transition={{ duration: 0.8, delay: 0.2 }}
                     className='relative hidden lg:block'>
                     <div className='relative'>
                        {/* Main Image Card */}
                        <div className='bg-gradient-to-br from-[#FF6B6B] to-[#FECA57] rounded-3xl p-8 shadow-2xl transform rotate-3 hover:rotate-0 transition-transform duration-500'>
                           <div className='bg-white rounded-2xl p-6 shadow-lg'>
                              <div className='grid grid-cols-2 gap-4'>
                                 {[1, 2, 3, 4].map((i) => (
                                    <motion.div
                                       key={i}
                                       initial={{ opacity: 0, scale: 0.8 }}
                                       animate={{ opacity: 1, scale: 1 }}
                                       transition={{ delay: 0.8 + i * 0.1 }}
                                       className='bg-gradient-to-br from-gray-50 to-white rounded-xl p-4 shadow-md'>
                                       <div className='w-full h-24 bg-gray-200 rounded-lg mb-2' />
                                       <div className='h-2 bg-gray-200 rounded-full w-3/4 mb-1' />
                                       <div className='h-2 bg-gray-200 rounded-full w-1/2' />
                                    </motion.div>
                                 ))}
                              </div>
                           </div>
                        </div>

                        {/* Floating Badge */}
                        <motion.div
                           initial={{ opacity: 0, y: -20 }}
                           animate={{ opacity: 1, y: 0 }}
                           transition={{ delay: 1 }}
                           className='absolute -top-6 -right-6 bg-white rounded-full p-4 shadow-xl border-2 border-[#FF6B6B]'>
                           <div className='text-center'>
                              <div className='text-2xl font-bold text-[#FF6B6B]'>4.9★</div>
                              <div className='text-xs text-gray-600'>50K+ Reviews</div>
                           </div>
                        </motion.div>
                     </div>
                  </motion.div>
               </div>
            </div>
         </div>
      </section>
   );
}
