import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Card, CardContent } from "@/components/ui/card";
import { Phone, Mail, MapPin, Clock } from "lucide-react";
import { appConfig } from "@/config/app.config";

export default function ContactPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-orange-50 via-white to-yellow-50 py-20 md:py-32">
          <div className="container px-4 md:px-20">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
                Get in <span className="bg-gradient-to-r from-[#FF6B6B] to-[#FECA57] bg-clip-text text-transparent">Touch</span>
              </h1>
              <p className="text-lg md:text-xl text-gray-600">
                We&apos;re here to help! Reach out to us with any questions or concerns.
              </p>
            </div>
          </div>
        </section>

        {/* Contact Info */}
        <section className="py-16 md:py-24 bg-white">
          <div className="container px-4 md:px-20">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto mb-12">
              <Card className="hover:shadow-xl transition-shadow">
                <CardContent className="p-6 text-center">
                  <div className="bg-blue-100 rounded-full p-4 w-16 h-16 flex items-center justify-center mx-auto mb-4">
                    <Phone className="h-8 w-8 text-blue-600" />
                  </div>
                  <h3 className="font-bold mb-2">Phone</h3>
                  <p className="text-gray-600">{appConfig.contact.phone}</p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-xl transition-shadow">
                <CardContent className="p-6 text-center">
                  <div className="bg-green-100 rounded-full p-4 w-16 h-16 flex items-center justify-center mx-auto mb-4">
                    <Mail className="h-8 w-8 text-green-600" />
                  </div>
                  <h3 className="font-bold mb-2">Email</h3>
                  <p className="text-gray-600">{appConfig.contact.email}</p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-xl transition-shadow">
                <CardContent className="p-6 text-center">
                  <div className="bg-orange-100 rounded-full p-4 w-16 h-16 flex items-center justify-center mx-auto mb-4">
                    <MapPin className="h-8 w-8 text-orange-600" />
                  </div>
                  <h3 className="font-bold mb-2">Address</h3>
                  <p className="text-gray-600">{appConfig.contact.address}</p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-xl transition-shadow">
                <CardContent className="p-6 text-center">
                  <div className="bg-purple-100 rounded-full p-4 w-16 h-16 flex items-center justify-center mx-auto mb-4">
                    <Clock className="h-8 w-8 text-purple-600" />
                  </div>
                  <h3 className="font-bold mb-2">Hours</h3>
                  <p className="text-gray-600">24/7 Available</p>
                </CardContent>
              </Card>
            </div>

            {/* Contact Form */}
            <div className=" mx-auto">
              <Card className="border-2 p-14 max-w-2xl mx-auto ">
                <CardContent className="  ">
                  <h2 className="text-3xl font-bold mb-6 text-center">Send Us a Message</h2>
                  <form className="space-y-6">
                    <div>
                      <label htmlFor="name" className="block text-sm font-semibold mb-2">Name</label>
                      <input
                        type="text"
                        id="name"
                        required
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#FF6B6B]"
                        placeholder="Your name"
                      />
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-sm font-semibold mb-2">Email</label>
                      <input
                        type="email"
                        id="email"
                        required
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#FF6B6B]"
                        placeholder="your.email@example.com"
                      />
                    </div>
                    <div>
                      <label htmlFor="message" className="block text-sm font-semibold mb-2">Message</label>
                      <textarea
                        id="message"
                        rows={6}
                        required
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#FF6B6B]"
                        placeholder="Your message..."
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full py-4 bg-gradient-to-r from-[#FF6B6B] to-[#FECA57] text-white rounded-lg font-semibold hover:shadow-lg transition-all"
                    >
                      Send Message
                    </button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

