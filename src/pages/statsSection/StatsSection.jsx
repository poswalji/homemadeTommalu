import React from "react";
 const StatsSection = () => {
            const stats = [
                { number: '500+', label: 'Happy Customers', icon: 'fas fa-users' },
                { number: '20+', label: 'Restaurant Partners', icon: 'fas fa-store' },
                { number: '5+', label: 'Cities Covered', icon: 'fas fa-map-marked-alt' },
                { number: '99.9%', label: 'Uptime', icon: 'fas fa-clock' }
            ];

            return (
                <section className="py-16 gradient-bg text-white">
                    <div className="container mx-auto px-4">
                        <div className="text-center mb-12">
                            <h2 className="text-3xl font-bold mb-4">Our Impact</h2>
                            <p className="text-xl opacity-90">Numbers that speak for themselves</p>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                            {stats.map((stat, index) => (
                                <div key={index} className="text-center">
                                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/20   mb-4">
                                        <i className={`${stat.icon} text-2xl`}></i>
                                    </div>
                                    <div className="text-3xl font-bold mb-2">{stat.number}</div>
                                    <div className="text-lg opacity-90">{stat.label}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            );
        };

        export default StatsSection;
        