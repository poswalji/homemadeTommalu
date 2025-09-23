import React from "react";
import { Link } from "react-router-dom";
const Footer = () => {
            return (
                <footer className="bg-gray-900 text-white">
                    <div className="container mx-auto px-4 py-12">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-20">
                            {/* Company Info */}
                            <div className="lg:justify-self-start">
                                <h3 className="text-2xl font-bold mb-4 text-purple-400">Tommalu</h3>
                                <p className="text-gray-300 mb-4">
                                    Your trusted partner for fast food delivery and fresh grocery shopping.
                                    Quality service, delivered with care.
                                </p>
                                <div className="flex space-x-4">
                                    <a href="https://www.facebook.com/share/18qRHC9V9m/" className="text-gray-400 hover:text-purple-400 transition-colors">
                                        <i className="fab fa-facebook-f text-xl"></i>
                                    </a>
                                    
                                    <a href="https://www.instagram.com/tommalu_delivery?igsh=b3ZhZXV4eGd2YTRr" className="text-gray-400 hover:text-purple-400 transition-colors">
                                        <i className="fab fa-instagram text-xl"></i>
                                    </a>
                                   
                                </div>
                            </div>

                           

                            {/* Contact Info */}
                            <div className="lg:justify-self-end">
                                <h4 className="text-lg font-semibold mb-4">Contact Info</h4>
                                <div className="space-y-3">
                                    <div className="flex items-center space-x-3">
                                        <i className="fas fa-phone text-purple-400"></i>
                                        <span className="text-gray-300">+91 7742894471</span>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                        <i className="fas fa-envelope text-purple-400"></i>
                                        <span className="text-gray-300">tommaludelivery@gmail.com</span>
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
                                <Link to="/privacy-policy" className="hover:text-purple-400 transition-colors">Privacy Policy</Link>
                                 <Link to="/terms-of-service" className="hover:text-purple-400 transition-colors">
    Terms of Service
  </Link>
  <Link to="/cookie-policy" className="hover:text-purple-400 transition-colors">
    Cookie Policy
  </Link>
                            </div>
                        </div>
                    </div>
                </footer>
            );
        };
        export default Footer;
        