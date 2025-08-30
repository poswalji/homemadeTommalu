import React, { useEffect, useState } from "react";

const Notification = ({ message, isVisible, onClose }) => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setShow(true);
      const timer = setTimeout(() => {
        setShow(false);
        setTimeout(() => onClose(), 500); // fade-out complete hone ke baad close
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  if (!isVisible && !show) return null;

  return (
    <div
      className={`fixed top-20 right-4 px-6 py-3 rounded-lg shadow-lg z-50 
        bg-green-500 text-white flex items-center space-x-2 transition-opacity duration-500
        ${show ? "opacity-100" : "opacity-0"}`}
    >
      <i className="fas fa-check-circle"></i>
      <span>{message}</span>
    </div>
  );
};

export default Notification;
