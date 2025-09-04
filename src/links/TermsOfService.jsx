import React from "react";
import { Link } from "react-router-dom";
const TermsOfService = () => {
  return (
    <div className="bg-gray-50 text-gray-800 py-12 px-6 md:px-20">
      <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-2xl p-8">
        <h1 className="text-3xl font-bold text-purple-600 mb-6">
          Terms of Service
        </h1>
        <p className="text-sm text-gray-500 mb-8">Effective Date: 04 September 2025</p>

        <p className="mb-6">
          Welcome to <span className="font-semibold">Tommalu</span>! These Terms of
          Service (“Terms”) govern your use of our website, mobile app, and
          related services. By accessing or using Tommalu, you agree to these
          Terms.
        </p>

        <h2 className="text-xl font-semibold text-purple-500 mb-3">1. Use of Services</h2>
        <p className="mb-6">
          You agree to use Tommalu only for lawful purposes and in accordance
          with these Terms. Misuse, fraudulent activity, or violation of
          applicable laws is strictly prohibited.
        </p>

        <h2 className="text-xl font-semibold text-purple-500 mb-3">2. Accounts</h2>
        <p className="mb-6">
          To place orders, you may need to create an account. You are
          responsible for maintaining the confidentiality of your account
          information and for all activities under your account.
        </p>

        <h2 className="text-xl font-semibold text-purple-500 mb-3">3. Orders & Payments</h2>
        <ul className="list-disc pl-6 mb-6 space-y-2">
          <li>All orders are subject to acceptance and availability.</li>
          <li>Payments are processed through secure third-party gateways.</li>
          <li>We reserve the right to cancel or refuse orders in case of fraud or misuse.</li>
        </ul>

        <h2 className="text-xl font-semibold text-purple-500 mb-3">4. Delivery</h2>
        <p className="mb-6">
          We strive to deliver orders on time, but delivery times may vary due
          to location, traffic, or restaurant availability. Tommalu is not
          liable for delays caused by unforeseen circumstances.
        </p>

        <h2 className="text-xl font-semibold text-purple-500 mb-3">5. Cancellations & Refunds</h2>
        <p className="mb-6">
          Once an order is placed, cancellations may not always be possible.
          Refunds (if applicable) are processed according to restaurant and
          payment partner policies.
        </p>

        <h2 className="text-xl font-semibold text-purple-500 mb-3">6. User Responsibilities</h2>
        <ul className="list-disc pl-6 mb-6 space-y-2">
          <li>Provide accurate delivery details.</li>
          <li>Do not use Tommalu for illegal activities.</li>
          <li>Respect restaurants, delivery partners, and support staff.</li>
        </ul>

        <h2 className="text-xl font-semibold text-purple-500 mb-3">7. Limitation of Liability</h2>
        <p className="mb-6">
          Tommalu shall not be held liable for indirect, incidental, or
          consequential damages arising from your use of our services.
        </p>

        <h2 className="text-xl font-semibold text-purple-500 mb-3">8. Changes to Terms</h2>
        <p className="mb-6">
          We may update these Terms from time to time. Updates will be posted
          here with a new effective date. Continued use of Tommalu means you
          accept the updated Terms.
        </p>

        <h2 className="text-xl font-semibold text-purple-500 mb-3">9. Contact Us</h2>
        <p className="mb-2">If you have questions about these Terms, contact us:</p>
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

export default TermsOfService;
