import React from "react";
 const FeaturesSection = () => {
            const features = [
                {
                    icon: 'fas fa-shipping-fast',
                    title: 'Fast Delivery',
                    description: 'Get your orders delivered in 30 minutes or less',
                    color: 'text-blue-500'
                },
                {
                    icon: 'fas fa-shield-alt',
                    title: 'Safe & Secure',
                    description: 'Your payments and data are completely secure',
                    color: 'text-green-500'
                },
                {
                    icon: 'fas fa-star',
                    title: 'Quality Assured',
                    description: 'Only the best restaurants and fresh groceries',
                    color: 'text-yellow-500'
                },
                {
                    icon: 'fas fa-headset',
                    title: '24/7 Support',
                    description: 'Round-the-clock customer support for you',
                    color: 'text-purple-500'
                }
            ];

            return (
                <section className="py-16 bg-white">
                    <div className="container mx-auto px-4">
                        <div className="text-center mb-12">
                            <h2 className="text-3xl font-bold text-gray-800 mb-4">Why Choose Tommalu?</h2>
                            <p className="text-xl text-gray-600">Experience the best in food delivery and grocery shopping</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                            {features.map((feature, index) => (
                                <div key={index} className="text-center p-6 rounded-xl hover:shadow-lg transition-shadow">
                                    <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4`}>
                                        <i className={`${feature.icon} text-2xl ${feature.color}`}></i>
                                    </div>
                                    <h3 className="text-xl font-semibold text-gray-800 mb-2">{feature.title}</h3>
                                    <p className="text-gray-600">{feature.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            );
        };
export default FeaturesSection;
