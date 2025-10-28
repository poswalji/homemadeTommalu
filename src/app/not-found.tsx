"use client";

import { motion } from "framer-motion";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Badge } from "@/components/ui/badge";
import { Bell, Mail, Sparkles } from "lucide-react";
import { useState } from "react";

export default function Page() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle email subscription logic here
    setSubscribed(true);
    setTimeout(() => {
      setSubscribed(false);
      setEmail("");
    }, 3000);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-orange-50 via-white to-yellow-50">
      <Header />
      
      <main className="flex-1 flex items-center justify-center py-12 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Badge className="mb-6">
              <Sparkles className="h-4 w-4 mr-2" />
              Coming Soon
            </Badge>

            <h1 className="text-5xl md:text-7xl font-bold mb-6">
              Something{" "}
              <span className="bg-gradient-to-r from-[#FF6B6B] to-[#FECA57] bg-clip-text text-transparent">
                Amazing
              </span>{" "}
              is Coming!
            </h1>

            <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-2xl mx-auto">
              We&apos;re working hard to bring you an incredible new experience. 
              Be the first to know when we launch!
            </p>

            <div className="bg-white rounded-2xl shadow-md p-8 md:p-12 max-w-xl mx-auto mb-12">
              {!subscribed ? (
                <>
                  <div className="flex justify-center mb-6">
                    <div className="bg-gradient-to-br from-[#FF6B6B] to-[#FECA57] rounded-full p-4">
                      <Bell className="h-8 w-8 text-white" />
                    </div>
                  </div>
                  <h2 className="text-2xl font-bold mb-4">Notify Me When It&apos;s Live</h2>
                  <p className="text-gray-600 mb-6">
                    Enter your email and we&apos;ll send you a notification as soon as we launch
                  </p>
                  <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email"
                      required
                      className="flex-1 px-6 py-4 bg-white rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#FF6B6B]"
                    />
                    <button
                      type="submit"
                      className="px-8 py-4 bg-gradient-to-r from-[#FF6B6B] to-[#FECA57] text-white rounded-lg font-semibold hover:shadow-lg transition-shadow"
                    >
                      Notify Me
                    </button>
                  </form>
                </>
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center"
                >
                  <div className="bg-green-100 rounded-full p-4 w-20 h-20 flex items-center justify-center mx-auto mb-4">
                    <Mail className="h-10 w-10 text-green-600" />
                  </div>
                  <h2 className="text-2xl font-bold mb-2">You&apos;re All Set! 🎉</h2>
                  <p className="text-gray-600">
                    We&apos;ve added you to our notification list. We&apos;ll reach out soon!
                  </p>
                </motion.div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-2xl mx-auto">
              {[
                { icon: "✨", title: "Innovative Features", description: "The latest and greatest" },
                { icon: "🚀", title: "Fast Performance", description: "Blazing fast experience" },
                { icon: "💎", title: "Premium Quality", description: "Built with excellence" },
              ].map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 + 0.3 }}
                  className="bg-white/50 backdrop-blur-sm rounded-xl p-6"
                >
                  <div className="text-4xl mb-3">{item.icon}</div>
                  <h3 className="font-bold mb-2">{item.title}</h3>
                  <p className="text-sm text-gray-600">{item.description}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

