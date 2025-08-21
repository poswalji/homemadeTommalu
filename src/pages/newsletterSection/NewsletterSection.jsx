import React from "react";
import { useState } from "react";
  const NewsletterSection = () => {
            const [email, setEmail] = useState('');
            const [isSubscribed, setIsSubscribed] = useState(false);

            const handleSubscribe = (e) => {
                e.preventDefault();
                if (email) {
                    setIsSubscribed(true);
                    setEmail('');
                    setTimeout(() => setIsSubscribed(false), 3000);
                }
            };

            return (
                <section className="py-16 bg-gradient-to-r from-purple-600 to-pink-600 text-white">
                    <div className="container mx-auto px-4 text-center">
                        <h2 className="text-3xl font-bold mb-4">Stay Updated</h2>
                        <p className="text-xl mb-8 opacity-90">Get the latest deals and offers delivered to your inbox</p>

                        {isSubscribed ? (
                            <div className="bg-green-500 text-white px-6 py-3 rounded-lg inline-block">
                                <i className="fas fa-check-circle mr-2"></i>
                                Thank you for subscribing!
                            </div>
                        ) : (
                            <form onSubmit={handleSubscribe} className="max-w-md mx-auto flex gap-4">
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="Enter your email address"
                                    className="flex-1 px-4 py-3 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-yellow-300"
                                    required
                                />
                                <button
                                    type="submit"
                                    className="bg-yellow-400 text-purple-800 px-6 py-3 rounded-lg font-semibold hover:bg-yellow-300 transition-colors"
                                >
                                    Subscribe
                                </button>
                            </form>
                        )}
                    </div>
                </section>
            );
        };
        export default NewsletterSection