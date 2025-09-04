import React from "react";
import { Link } from "react-router-dom";
const CookiePolicy = () => {
  return (
    <div className="bg-gray-50 text-gray-800 py-12 px-6 md:px-20">
      <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-2xl p-8">
        <h1 className="text-3xl font-bold text-purple-600 mb-6">Cookie Policy</h1>
        <p className="text-sm text-gray-500 mb-8">Effective Date: 04 September 2025</p>

        <p className="mb-6">
          At <span className="font-semibold">Tommalu</span>, we use cookies and
          similar technologies to improve your browsing experience, provide
          personalized services, and analyze site traffic. This Cookie Policy
          explains how and why we use cookies.
        </p>

        <h2 className="text-xl font-semibold text-purple-500 mb-3">1. What Are Cookies?</h2>
        <p className="mb-6">
          Cookies are small text files stored on your device when you visit a
          website or use an app. They help us recognize your device, remember
          your preferences, and improve your overall experience.
        </p>

        <h2 className="text-xl font-semibold text-purple-500 mb-3">2. Types of Cookies We Use</h2>
        <ul className="list-disc pl-6 mb-6 space-y-2">
          <li>
            <strong>Essential Cookies</strong> – Required for core functionality
            like login, checkout, and secure browsing.
          </li>
          <li>
            <strong>Performance Cookies</strong> – Help us understand how users
            interact with Tommalu (analytics & error tracking).
          </li>
          <li>
            <strong>Functional Cookies</strong> – Store your preferences (like
            location, saved cart, or language).
          </li>
          <li>
            <strong>Advertising Cookies</strong> – Used to show relevant ads and
            offers (if enabled).
          </li>
        </ul>

        <h2 className="text-xl font-semibold text-purple-500 mb-3">3. How We Use Cookies</h2>
        <p className="mb-6">
          We use cookies to:
        </p>
        <ul className="list-disc pl-6 mb-6 space-y-2">
          <li>Keep you logged in securely.</li>
          <li>Remember your cart and preferences.</li>
          <li>Analyze usage patterns to improve our services.</li>
          <li>Show promotions tailored to your interests.</li>
        </ul>

        <h2 className="text-xl font-semibold text-purple-500 mb-3">4. Managing Cookies</h2>
        <p className="mb-6">
          You can manage or disable cookies anytime from your browser settings.
          However, some features of Tommalu may not work properly if cookies are
          disabled.
        </p>

        <h2 className="text-xl font-semibold text-purple-500 mb-3">5. Changes to This Policy</h2>
        <p className="mb-6">
          We may update this Cookie Policy from time to time. Changes will be
          posted here with a new effective date.
        </p>

        <h2 className="text-xl font-semibold text-purple-500 mb-3">6. Contact Us</h2>
        <p className="mb-2">For questions about our Cookie Policy, contact us:</p>
        <p className="mb-1">📧 <strong>support@tommalu.com</strong></p>
        <p className="mb-1">📞 <strong>+91 9358992352</strong></p>
        <p>📍 <strong>Talamod, Jaipur, Rajasthan (303002)</strong></p>
         {/* Back to Home Button */}
      <Link
        to="/"
        className="inline-block mt-6 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
      >
        ⬅ Back to Home
      </Link>
      </div>
    </div>
  );
};

export default CookiePolicy;
