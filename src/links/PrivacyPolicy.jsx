import React from "react";
import { Link } from "react-router-dom";
const PrivacyPolicy = () => {
  return (

    <div className="bg-gray-50 text-gray-800 py-12 px-6 md:px-20">
      <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-2xl p-8">
        <h1 className="text-3xl font-bold text-purple-600 mb-6">
          Privacy Policy
        </h1>
        <p className="text-sm text-gray-500 mb-8">Effective Date: 04 September 2025</p>

        <p className="mb-6">
          At <span className="font-semibold">Tommalu</span>, we value your trust and are committed to protecting
          your personal information. This Privacy Policy explains how we collect,
          use, and safeguard your data when you use our website, mobile app, or
          related services.
        </p>

        <h2 className="text-xl font-semibold text-purple-500 mb-3">1. Information We Collect</h2>
        <ul className="list-disc pl-6 mb-6 space-y-2">
          <li>Personal Information: Name, email, phone number, delivery address.</li>
          <li>Order Information: Items you purchase, payment details (processed securely).</li>
          <li>Usage Data: IP address, browser type, device info, location (if enabled).</li>
        </ul>

        <h2 className="text-xl font-semibold text-purple-500 mb-3">2. How We Use Your Information</h2>
        <ul className="list-disc pl-6 mb-6 space-y-2">
          <li>Process and deliver your food & grocery orders.</li>
          <li>Provide customer support.</li>
          <li>Improve our services and user experience.</li>
          <li>Send updates, offers, and promotions (optional).</li>
          <li>Ensure safety, fraud prevention, and compliance with law.</li>
        </ul>

        <h2 className="text-xl font-semibold text-purple-500 mb-3">3. Sharing of Information</h2>
        <p className="mb-6">
          We <strong>do not sell</strong> your personal data. We may share your
          information only with:
        </p>
        <ul className="list-disc pl-6 mb-6 space-y-2">
          <li>Delivery Partners & Restaurants – to fulfill your order.</li>
          <li>Payment Gateways – to process payments securely.</li>
          <li>Legal Authorities – if required by law or for fraud prevention.</li>
        </ul>

        <h2 className="text-xl font-semibold text-purple-500 mb-3">4. Data Security</h2>
        <p className="mb-6">
          We use encryption, secure servers, and strict access controls to protect your personal
          information. However, no online transmission is 100% secure, and we cannot
          guarantee absolute security.
        </p>

        <h2 className="text-xl font-semibold text-purple-500 mb-3">5. Cookies & Tracking</h2>
        <p className="mb-6">
          We may use cookies and similar technologies to improve your browsing experience,
          personalize offers, and analyze site traffic. You can disable cookies in
          your browser settings.
        </p>

        <h2 className="text-xl font-semibold text-purple-500 mb-3">6. Your Rights</h2>
        <ul className="list-disc pl-6 mb-6 space-y-2">
          <li>Access, update, or delete your personal data.</li>
          <li>Opt-out of promotional emails/messages.</li>
          <li>Withdraw location permissions anytime.</li>
        </ul>
        <p className="mb-6">To request changes, email us at <strong>support@tommalu.com</strong>.</p>

        <h2 className="text-xl font-semibold text-purple-500 mb-3">7. Third-Party Links</h2>
        <p className="mb-6">
          Our app/website may contain links to third-party sites. We are not responsible for
          their privacy practices, so please review their policies separately.
        </p>

        <h2 className="text-xl font-semibold text-purple-500 mb-3">8. Updates to Privacy Policy</h2>
        <p className="mb-6">
          We may update this Privacy Policy from time to time. Changes will be posted here
          with a new effective date.
        </p>

        <h2 className="text-xl font-semibold text-purple-500 mb-3">9. Contact Us</h2>
        <p className="mb-2">If you have any questions or concerns, please contact us:</p>
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

export default PrivacyPolicy;
