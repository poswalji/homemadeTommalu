import React, { useState } from "react";
import { GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";

// OTP Verification Overlay
const VerifyMobileOverlay = ({ isOpen, onClose, onVerify }) => {
  const [otp, setOtp] = useState("");

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]">
      <div className="bg-white rounded-2xl shadow-lg w-96 p-6 relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
        >
          ✖
        </button>

        <h2 className="text-2xl font-bold text-center mb-4 text-purple-600">
          Verify Mobile Number
        </h2>
        <p className="text-gray-600 text-center mb-6">
          We’ve sent an OTP to your registered mobile number.
        </p>

        {/* OTP Input */}
        <input
          type="text"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          maxLength={6}
          placeholder="Enter 6-digit OTP"
          className="w-full px-4 py-2 border rounded-lg text-center text-lg tracking-widest focus:outline-none focus:ring-2 focus:ring-purple-500"
        />

        {/* Buttons */}
        <div className="flex justify-between mt-6">
          <button
            onClick={() => alert("OTP Resent")}
            className="text-sm text-purple-600 hover:underline"
          >
            Resend OTP
          </button>
          <button
            onClick={() => onVerify(otp)}
            className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            Verify
          </button>
        </div>
      </div>
    </div>
  );
};

const SignInModal = ({ isOpen, onClose, onSignIn }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showVerifyOverlay, setShowVerifyOverlay] = useState(false);
  const [tempUser, setTempUser] = useState(null); // store signup response

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const endpoint = isSignUp ? "/api/auth/register" : "/api/auth/login";
      const res = await fetch(
        `https://backend-tommalu.onrender.com${endpoint}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(formData),
        }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Something went wrong");

      if (isSignUp) {
        // Signup ke baad OTP verification dikhana hai
        setTempUser(data.user);
        setShowVerifyOverlay(true);
      } else {
        // Login ke liye direct signIn
        onSignIn(data.user);
        setFormData({ name: "", email: "", phone: "", address: "", password: "" });
        onClose();
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify = (otp) => {
    if (otp === "123456") {
      // TODO: Backend OTP verify API call
      alert("✅ Mobile Verified Successfully!");
      onSignIn(tempUser); // sign in user after verify
      setShowVerifyOverlay(false);
      setFormData({ name: "", email: "", phone: "", address: "", password: "" });
      onClose();
    } else {
      alert("❌ Invalid OTP, try again.");
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Main SignIn / SignUp Modal */}
      <div className="fixed inset-0 bg-black/50 z-[5000] flex items-center justify-center p-4">
        <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between p-6 border-b">
            <h3 className="text-2xl font-bold text-gray-800">
              {isSignUp ? "Create Account" : "Welcome Back"}
            </h3>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <i className="fas fa-times text-xl"></i>
            </button>
          </div>

          <div className="p-6">
            {error && <p className="text-red-500 mb-4">{error}</p>}
            <form onSubmit={handleSubmit} className="space-y-4">
              {isSignUp && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="Enter your full name"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="Enter your phone number"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Address
                    </label>
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="Enter your address"
                      required
                    />
                  </div>
                </>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Enter your email"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Enter your password"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 rounded-lg font-semibold hover:from-purple-600 hover:to-pink-600 transition-colors disabled:opacity-50"
              >
                {isLoading
                  ? isSignUp
                    ? "Creating Account..."
                    : "Signing In..."
                  : isSignUp
                  ? "Create Account"
                  : "Sign In"}
              </button>
            </form>

            <div className="mt-6">
              <GoogleLogin
                onSuccess={(credentialResponse) => {
                  const decoded = jwtDecode(credentialResponse.credential);
                  console.log("Google User:", decoded);

                  fetch("https://backend-tommalu.onrender.com/api/auth/google", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    credentials: "include",
                    body: JSON.stringify({ token: credentialResponse.credential }),
                  })
                    .then((res) => res.json())
                    .then((data) => {
                      onSignIn(data.user);
                      onClose();
                    })
                    .catch((err) => console.error(err));
                }}
                onError={() => {
                  console.log("Google Login Failed");
                }}
              />
            </div>

            <div className="mt-6 text-center">
              <p className="text-gray-600">
                {isSignUp
                  ? "Already have an account?"
                  : "Don't have an account?"}
                <button
                  onClick={() => setIsSignUp(!isSignUp)}
                  className="ml-2 text-purple-600 hover:text-purple-800 font-medium"
                >
                  {isSignUp ? "Sign In" : "Sign Up"}
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Verification Overlay */}
      <VerifyMobileOverlay
        isOpen={showVerifyOverlay}
        onClose={() => setShowVerifyOverlay(false)}
        onVerify={handleVerify}
      />
    </>
  );
};

export default SignInModal;
