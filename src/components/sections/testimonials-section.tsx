"use client";

import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Star } from "lucide-react";

const testimonials = [
  {
    name: "Priya Sharma",
    role: "Regular Customer",
    content: "TomMalu has made grocery shopping so easy! Fresh produce delivered right to my door. Highly recommend!",
    rating: 5,
    image: "👩‍💼",
  },
  {
    name: "Rajesh Kumar",
    role: "Food Lover",
    content: "Amazing service! Fast delivery and the food quality is always excellent. My go-to app for everything.",
    rating: 5,
    image: "👨‍🍳",
  },
  {
    name: "Anjali Mehta",
    role: "Busy Professional",
    content: "As a working professional, TomMalu saves me so much time. Quick orders and reliable delivery every time!",
    rating: 5,
    image: "👩‍💻",
  },
];

export function TestimonialsSection() {
  return (
    <section className="py-16 md:py-24 bg-gradient-to-b from-gray-50 via-white to-gray-50 relative overflow-hidden">
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-1/4 left-0 w-96 h-96 bg-[#FF6B6B] rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-0 w-96 h-96 bg-[#FECA57] rounded-full blur-3xl"></div>
      </div>
      
      <div className="container px-4 md:px-20 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-gray-900 via-gray-700 to-gray-900 bg-clip-text text-transparent">
            What Our Customers Say
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Don&apos;t just take our word for it - hear from our satisfied customers
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <Card className="h-full hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border-none shadow-lg">
                <CardContent className="p-8">
                  <div className="flex items-center gap-1 mb-6">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-6 w-6 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-gray-700 mb-6 text-lg italic leading-relaxed">&quot;{testimonial.content}&quot;</p>
                  <div className="flex items-center gap-4 pt-4 border-t border-gray-100">
                    <div className="text-5xl">{testimonial.image}</div>
                    <div>
                      <h4 className="font-bold text-lg text-gray-900">{testimonial.name}</h4>
                      <p className="text-sm text-gray-600">{testimonial.role}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

