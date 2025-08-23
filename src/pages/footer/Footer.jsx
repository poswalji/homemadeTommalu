import React from "react";
const Footer = () => {
            return (
                <footer className="bg-gray-900 text-white">
                    <div className="container mx-auto px-4 py-12">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                            {/* Company Info */}
                            <div>
                                <h3 className="text-2xl font-bold mb-4 text-purple-400">Tommalu</h3>
                                <p className="text-gray-300 mb-4">
                                    Your trusted partner for fast food delivery and fresh grocery shopping.
                                    Quality service, delivered with care.
                                </p>
                                <div className="flex space-x-4">
                                    <a href="#" className="text-gray-400 hover:text-purple-400 transition-colors">
                                        <i className="fab fa-facebook-f text-xl"></i>
                                    </a>
                                    <a href="#" className="text-gray-400 hover:text-purple-400 transition-colors">
                                        <i className="fab fa-twitter text-xl"></i>
                                    </a>
                                    <a href="#" className="text-gray-400 hover:text-purple-400 transition-colors">
                                        <i className="fab fa-instagram text-xl"></i>
                                    </a>
                                    <a href="#" className="text-gray-400 hover:text-purple-400 transition-colors">
                                        <i className="fab fa-linkedin-in text-xl"></i>
                                    </a>
                                </div>
                            </div>

                            {/* Quick Links */}
                            <div>
                                <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
                                <ul className="space-y-2">
                                    <li><a href="#" className="text-gray-300 hover:text-purple-400 transition-colors">About Us</a></li>
                                    <li><a href="#" className="text-gray-300 hover:text-purple-400 transition-colors">How It Works</a></li>
                                  
                                </ul>
                            </div>

                            {/* Support */}
                            <div>
                                <h4 className="text-lg font-semibold mb-4">Support</h4>
                                <ul className="space-y-2">
                                    <li><a href="" className="text-gray-300 hover:text-purple-400 transition-colors">Help Center</a></li>
                                    <li><a href="#" className="text-gray-300 hover:text-purple-400 transition-colors">Contact Us</a></li>
                                    <li><a href="#" className="text-gray-300 hover:text-purple-400 transition-colors">Safety</a></li>
                                    <li><a href="#" className="text-gray-300 hover:text-purple-400 transition-colors">Terms of Service</a></li>
                                    <li><a href="#" className="text-gray-300 hover:text-purple-400 transition-colors">Privacy Policy</a></li>
                                </ul>
                            </div>

                            {/* Contact Info */}
                            <div>
                                <h4 className="text-lg font-semibold mb-4">Contact Info</h4>
                                <div className="space-y-3">
                                    <div className="flex items-center space-x-3">
                                        <i className="fas fa-phone text-purple-400"></i>
                                        <span className="text-gray-300">+91 9358992352</span>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                        <i className="fas fa-envelope text-purple-400"></i>
                                        <span className="text-gray-300">support@tommalu.com</span>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                        <i className="fas fa-map-marker-alt text-purple-400"></i>
                                        <span className="text-gray-300">Talamod Jaipur,Rajasthan(303002)</span>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                        <i className="fas fa-clock text-purple-400"></i>
                                        <span className="text-gray-300">24/7 Customer Support</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        

                        {/* Bottom Bar */}
                        <div className="border-t border-gray-700 mt-8 pt-6 flex flex-col md:flex-row items-center justify-between">
                            <p className="text-gray-400 text-sm mb-4 md:mb-0">
                                © 2025 Tommalu. All rights reserved.
                            </p>
                            <div className="flex items-center space-x-6 text-sm text-gray-400">
                                <a href="#" className="hover:text-purple-400 transition-colors">Privacy Policy</a>
                                <a href="#" className="hover:text-purple-400 transition-colors">Terms of Service</a>
                                <a href="#" className="hover:text-purple-400 transition-colors">Cookie Policy</a>
                            </div>
                        </div>
                    </div>
                </footer>
            );
        };
        export default Footer;
        