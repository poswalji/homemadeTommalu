"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Mail } from "lucide-react";

export function NewsletterSection() {
  return (
    <section className="py-16 md:py-24 bg-gradient-to-r from-[#FF6B6B] to-[#FECA57] text-white">
      <div className="container px-4 md:px-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl mx-auto text-center"
        >
          <div className="flex justify-center mb-6">
            <div className="bg-white/20 rounded-full p-4">
              <Mail className="h-12 w-12" />
            </div>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Stay Updated
          </h2>
          <p className="text-white/90 mb-8 text-lg">
            Subscribe to our newsletter and get exclusive deals, new product announcements, and special offers delivered right to your inbox!
          </p>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-col sm:flex-row gap-4 max-w-xl mx-auto"
          >
            <input
              type="email"
              placeholder="Enter your email address"
              className="flex-1 px-6 h-10 py-4 bg-white rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-white/50"
            />
            <Button 
              size="lg" 
              className="bg-white h-10 text-[#FF6B6B] hover:bg-gray-100 font-semibold"
            >
              Subscribe
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

