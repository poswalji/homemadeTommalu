import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Heart, Target, Users, Award, Truck, Shield } from "lucide-react";
import Link from "next/link";

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-orange-50 via-white to-yellow-50 py-20 md:py-32">
          <div className="container px-4 md:px-20">
            <div className="max-w-3xl mx-auto text-center">
              <Badge className="mb-4">Our Story</Badge>
              <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
                About <span className="bg-gradient-to-r from-[#FF6B6B] to-[#FECA57] bg-clip-text text-transparent">Tommalu</span>
              </h1>
              <p className="text-lg md:text-xl text-gray-600">
                Delivering fresh groceries and delicious food to your doorstep in Jaipur since day one.
              </p>
            </div>
          </div>
        </section>

        <section className="py-16 md:py-24 bg-white">
          <div className="container px-4 md:px-20">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-4xl mx-auto">
              <Card className="border-2 hover:shadow-xl transition-shadow">
                <CardContent className="p-8">
                  <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-full p-4 w-16 h-16 flex items-center justify-center mb-6">
                    <Target className="h-8 w-8 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold mb-4">Our Mission</h2>
                  <p className="text-gray-600">
                    To make fresh groceries and quality food accessible to everyone in Jaipur, delivered with care and convenience right to their doorstep.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-2 hover:shadow-xl transition-shadow">
                <CardContent className="p-8">
                  <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-full p-4 w-16 h-16 flex items-center justify-center mb-6">
                    <Heart className="h-8 w-8 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold mb-4">Our Vision</h2>
                  <p className="text-gray-600">
                    To become Jaipur&apos;s most trusted delivery partner, known for exceptional quality, fast service, and customer satisfaction.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="py-16 md:py-24 bg-gray-50">
          <div className="container px-4 md:px-20">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Our Core Values</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                What drives us every day
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {[
                { icon: <Shield className="h-8 w-8" />, title: "Trust & Quality", description: "We ensure every product meets our high standards before delivery" },
                { icon: <Truck className="h-8 w-8" />, title: "Fast Delivery", description: "Prompt service with real-time tracking for your peace of mind" },
                { icon: <Users className="h-8 w-8" />, title: "Customer First", description: "Your satisfaction is our priority, always listening and improving" },
              ].map((value, index) => (
                <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="bg-gradient-to-br from-[#FF6B6B] to-[#FECA57] rounded-full p-4 w-16 h-16 flex items-center justify-center mx-auto mb-4 text-white">
                      {value.icon}
                    </div>
                    <h3 className="text-xl font-bold mb-2">{value.title}</h3>
                    <p className="text-gray-600">{value.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Why Choose Us */}
        <section className="py-16 md:py-24 bg-white">
          <div className="container px-4 md:px-20">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Choose TomMalu?</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Discover what makes us different
              </p>
            </div>

            <div className="max-w-4xl mx-auto space-y-6">
              {[
                { title: "Fresh & Quality Products", content: "We source directly from trusted suppliers and ensure all products are fresh and of the highest quality." },
                { title: "Wide Selection", content: "Choose from over 1000+ products including fresh groceries, restaurant meals, and everyday essentials." },
                { title: "Fast & Reliable Delivery", content: "Our delivery team ensures your order reaches you within 20-30 minutes, guaranteed." },
                { title: "24/7 Customer Support", content: "Round-the-clock customer support to help you with any queries or concerns." },
              ].map((item, index) => (
                <Card key={index} className="border-l-4 border-l-[#FF6B6B] hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                    <p className="text-gray-600">{item.content}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 md:py-24 bg-gradient-to-r from-[#FF6B6B] to-[#FECA57] text-white">
          <div className="container px-4 md:px-20 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Get Started?</h2>
            <p className="text-white/90 text-lg mb-8 max-w-2xl mx-auto">
              Join thousands of satisfied customers and experience the best delivery service in Jaipur
            </p>
            <Link href="/" className="inline-block bg-white text-[#FF6B6B] px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
              Start Shopping Now
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

