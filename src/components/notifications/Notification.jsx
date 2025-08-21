import React from "react";
import { useEffect } from "react";
const Notification = ({ message, isVisible, onClose }) => {
            useEffect(() => {
                if (isVisible) {
                    const timer = setTimeout(() => {
                        onClose();
                    }, 3000);
                    return () => clearTimeout(timer);
                }
            }, [isVisible, onClose]);

            if (!isVisible) return null;

            return (
                <div className="fixed top-20 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-bounce">
                    <div className="flex items-center space-x-2">
                        <i className="fas fa-check-circle"></i>
                        <span>{message}</span>
                    </div>
                </div>
            );
        };
        export default Notification