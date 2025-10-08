import React, { useState } from "react";
import { GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";
import { authService, setAuthData } from '../../services/api';

const SignInModal = ({ isOpen, onClose, onSignIn, onRegister }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    password: "",
    confirmPassword: ""
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError("");
  };

  const validateForm = () => {
    if (isSignUp) {
      if (!formData.name.trim()) {
        setError("Please enter your full name");
        return false;
      }
      if (!formData.phone.trim()) {
        setError("Please enter your phone number");
        return false;
      }
      if (formData.phone.length < 10) {
        setError("Please enter a valid phone number");
        return false;
      }
      if (!formData.address.trim()) {
        setError("Please enter your address");
        return false;
      }
      if (formData.password.length < 6) {
        setError("Password must be at least 6 characters long");
        return false;
      }
      if (formData.password !== formData.confirmPassword) {
        setError("Passwords do not match");
        return false;
      }
    } else {
      if (!formData.email.trim()) {
        setError("Please enter your email");
        return false;
      }
      if (!formData.password) {
        setError("Please enter your password");
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      if (isSignUp) {
        // ✅ REGISTRATION using authService
        const userData = {
          name: formData.name.trim(),
          email: formData.email.trim().toLowerCase(),
          phone: formData.phone.trim(),
          address: formData.address.trim(),
          password: formData.password
        };

        console.log('📝 Registering user:', userData);

        const response = await authService.register(userData);
        console.log('📝 Registration response:', response);
        
        // ✅ SUPPORT BOTH RESPONSE FORMATS
        if (response.status === 'success' || response.success) {
          // ✅ AUTOMATIC LOGIN AFTER REGISTRATION
          console.log('🔄 Attempting login after registration');
          const loginResponse = await authService.login({
            email: userData.email,
            password: userData.password
          });

          console.log('🔐 Login after registration response:', loginResponse);

          // ✅ SUPPORT BOTH RESPONSE FORMATS
          if (loginResponse.status === 'success' || loginResponse.success || loginResponse.token) {
            const userDataFromLogin = loginResponse.data?.user || loginResponse.user || loginResponse;
            const token = loginResponse.data?.token || loginResponse.token;
            
            console.log('✅ Extracted user data:', userDataFromLogin);
            console.log('✅ Extracted token:', token ? 'YES' : 'NO');
            
            // Store authentication data
            if (token && userDataFromLogin) {
              setAuthData(token, userDataFromLogin);
              console.log('✅ Auth data stored in localStorage');
            }
            
            setSuccess(`Welcome to Tommalu, ${userDataFromLogin?.name || userDataFromLogin?.email || 'User'}!`);
            
            // Reset form
            setFormData({
              name: "",
              email: "",
              phone: "",
              address: "",
              password: "",
              confirmPassword: ""
            });
            
            // ✅ Close modal and trigger signin
            console.log('🚀 Calling onSignIn with:', userDataFromLogin);
            if (onSignIn && typeof onSignIn === 'function') {
              onSignIn(userDataFromLogin);
            } else {
              console.error('❌ onSignIn is not a function');
            }
            onClose();
          } else {
            throw new Error("Auto-login failed after registration");
          }
        } else {
          throw new Error(response.message || "Registration failed");
        }
      } else {
        // ✅ LOGIN using authService
        const credentials = {
          email: formData.email.trim().toLowerCase(),
          password: formData.password
        };

        console.log('🔐 Logging in with:', credentials);

        const response = await authService.login(credentials);
        console.log('🔐 Login response:', response);
        
        // ✅ SUPPORT BOTH RESPONSE FORMATS
        if (response.status === 'success' || response.success || response.token) {
          const userData = response.data?.user || response.user || response;
          const token = response.data?.token || response.token;
          
          console.log('✅ Extracted user data:', userData);
          console.log('✅ Extracted token:', token ? 'YES' : 'NO');
          
          // Store authentication data
          if (token && userData) {
            setAuthData(token, userData);
            console.log('✅ Auth data stored in localStorage');
          }
          
          setSuccess(`Welcome back, ${userData?.name || userData?.email || 'User'}!`);
          
          // Reset form
          setFormData({
            name: "",
            email: "",
            phone: "",
            address: "",
            password: "",
            confirmPassword: ""
          });
          
          // ✅ Close modal and trigger signin
          console.log('🚀 Calling onSignIn with:', userData);
          if (onSignIn && typeof onSignIn === 'function') {
            onSignIn(userData);
          } else {
            console.error('❌ onSignIn is not a function');
          }
          onClose();
        } else {
          throw new Error(response.message || "Login failed");
        }
      }
    } catch (error) {
      console.error('❌ Authentication error:', error);
      setError(error.message || `Failed to ${isSignUp ? 'create account' : 'sign in'}. Please try again.`);
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ UPDATED: Google Login using authService.googleLogin
  const handleGoogleLogin = async (credentialResponse) => {
    try {
      setIsLoading(true);
      setError("");
      
      console.log("🔐 Google credential received:", credentialResponse);

      if (!credentialResponse.credential) {
        throw new Error("No Google credential received");
      }

      const decoded = jwtDecode(credentialResponse.credential);
      console.log("🔐 Decoded Google User:", decoded);

      // ✅ USE authService.googleLogin instead of direct fetch
      const response = await authService.googleLogin(credentialResponse.credential);
      console.log('✅ Google login response:', response);

      // ✅ SUPPORT BOTH RESPONSE FORMATS
      if (response.status === 'success' || response.success) {
        const userData = response.data?.user || response.user || response;
        const token = response.data?.token || response.token;
        
        console.log('✅ Extracted user data:', userData);
        console.log('✅ Extracted token:', token ? 'YES' : 'NO');
        
        // Store authentication data
        if (token && userData) {
          setAuthData(token, userData);
          console.log('✅ Google auth data stored');
        }
        
        console.log('✅ Google login successful:', userData);
        
        // ✅ Trigger signin and close modal
        console.log('🚀 Calling onSignIn with Google user:', userData);
        if (onSignIn && typeof onSignIn === 'function') {
          onSignIn(userData);
        } else {
          console.error('❌ onSignIn is not a function');
        }
        onClose();
      } else {
        throw new Error(response.message || "Google authentication failed");
      }
    } catch (error) {
      console.error('❌ Google login error:', error);
      setError(error.message || "Google login failed. Please try email sign in.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleError = () => {
    setError("Google login failed. Please try another method.");
  };

  const switchMode = () => {
    setIsSignUp(!isSignUp);
    setError("");
    setSuccess("");
    setFormData({
      name: "",
      email: "",
      phone: "",
      address: "",
      password: "",
      confirmPassword: ""
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-5000 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h3 className="text-2xl font-bold text-gray-800">
            {isSignUp ? "Create Account" : "Welcome Back"}
          </h3>
          <button 
            onClick={onClose} 
            className="text-gray-500 hover:text-gray-700 transition-colors"
            disabled={isLoading}
          >
            <i className="fas fa-times text-xl"></i>
          </button>
        </div>

        <div className="p-6">
          {/* Success Message */}
          {success && (
            <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded-lg">
              <i className="fas fa-check-circle mr-2"></i>
              {success}
            </div>
          )}
          
          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
              <i className="fas fa-exclamation-circle mr-2"></i>
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    placeholder="Enter your full name"
                    disabled={isLoading}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    placeholder="Enter your phone number"
                    disabled={isLoading}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Delivery Address *
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    placeholder="Enter your delivery address"
                    disabled={isLoading}
                  />
                </div>
              </>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                placeholder="Enter your email"
                disabled={isLoading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password *
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                placeholder={isSignUp ? "Create a password (min. 6 characters)" : "Enter your password"}
                disabled={isLoading}
              />
            </div>

            {isSignUp && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm Password *
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  placeholder="Confirm your password"
                  disabled={isLoading}
                />
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 rounded-lg font-semibold hover:from-purple-600 hover:to-pink-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98]"
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <i className="fas fa-spinner fa-spin mr-2"></i>
                  {isSignUp ? "Creating Account..." : "Signing In..."}
                </span>
              ) : (
                isSignUp ? "Create Account & Sign In" : "Sign In"
              )}
            </button>
          </form>

          {/* Google Login */}
          <div className="mt-6">
            <div className="relative mb-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or continue with</span>
              </div>
            </div>
            
            <div className="flex justify-center">
              <GoogleLogin
                onSuccess={handleGoogleLogin}
                onError={handleGoogleError}
                theme="filled_blue"
                size="large"
                text="continue_with"
                shape="rectangular"
                width="300"
              />
            </div>
          </div>

          {/* Switch between Sign In and Sign Up */}
          <div className="mt-6 text-center">
            <p className="text-gray-600">
              {isSignUp ? "Already have an account?" : "Don't have an account?"}
              <button
                onClick={switchMode}
                disabled={isLoading}
                className="ml-2 text-purple-600 hover:text-purple-800 font-medium transition-colors disabled:opacity-50"
              >
                {isSignUp ? "Sign In" : "Sign Up"}
              </button>
            </p>
          </div>

          {/* Additional Info for Delivery Service */}
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-700 text-center">
              <i className="fas fa-shipping-fast mr-1"></i>
              {isSignUp 
                ? "Create account for faster checkout & order tracking!"
                : "Sign in to access your order history & saved addresses!"
              }
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignInModal;