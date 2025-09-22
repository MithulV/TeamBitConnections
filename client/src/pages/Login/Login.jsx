import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, Lock } from "lucide-react";
import api from "../../utils/axios";
import { useAuthStore } from "../../store/AuthStore";
const campusImageUrl =
  "https://images.unsplash.com/photo-1562774053-701939374585?q=80&w=2072&auto=format&fit=crop";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { setAuth, isAuthenticated } = useAuthStore();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, navigate]);

  
  const handleLogin = async () => {
    if (!email || !password) {
      alert("Please enter both email and password");
      return;
    }

    setIsLoading(true);
    try {
      const res = await api.post("/auth/login", { email, password });

      if (res.data.success) {
        const { user } = res.data;
        console.log("Login successful:", user);

        // Update Zustand with user info (cookie is automatically set by server)
        setAuth(user);

        // Navigate to home page
        navigate("/");
      }
    } catch (error) {
      console.error("Login failed:", error);
      const errorMessage =
        error.response?.data?.message ||
        "Login failed. Please check your credentials and try again.";
      alert(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async (response) => {
    setIsLoading(true);
    try {
      const { credential } = response;
      const apiResponse = await api.post("/auth/google/verify", { credential });

      if (apiResponse.data.success) {
        const { user } = apiResponse.data;
        setAuth(user);

        // Navigate to home page (role-based routing handled in RoleBasedHome)
        navigate("/");
      } else {
        throw new Error(apiResponse.data.message || "Authentication failed");
      }
    } catch (error) {
      console.error("Google sign-in failed:", error);
      const errorMessage =
        error.response?.data?.message ||
        "Google sign-in failed. Please try again.";
      alert(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Initialize Google Sign-In when component mounts
  useEffect(() => {
    if (isAuthenticated) {
      return;
    }

    const initializeGoogleSignIn = () => {
      try {
        if (window.google) {
          window.google.accounts.id.initialize({
            client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
            callback: handleGoogleSignIn,
            auto_select: false,
            cancel_on_tap_outside: true,
            use_fedcm_for_prompt: false,
          });

          window.google.accounts.id.renderButton(
            document.getElementById("google-signin-div"),
            {
              theme: "outline",
              size: "large",
              text: "signin_with",
              shape: "rectangular",
            }
          );
        } else {
          console.warn("Google Identity Services not loaded");
        }
      } catch (error) {
        console.error("Failed to initialize Google Sign-In:", error);
      }
    };

    if (window.google) {
      initializeGoogleSignIn();
    } else {
      const checkGoogle = setInterval(() => {
        if (window.google) {
          clearInterval(checkGoogle);
          initializeGoogleSignIn();
        }
      }, 100);
      setTimeout(() => clearInterval(checkGoogle), 10000);
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="relative flex flex-col m-6 bg-white shadow-2xl rounded-2xl md:flex-row md:max-w-7xl w-full">
        {/* Left Side */}
        <div className="relative flex flex-col justify-center p-8 md:p-16 rounded-t-2xl text-white md:w-1/2 overflow-hidden sm:rounded-l-2xl">
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: `url(${campusImageUrl})` }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-black/60 to-black/40"></div>
          </div>
          <div className="relative z-10 flex flex-col h-full gap-12">
            <div>
              <p className="text-sm font-semibold tracking-widest text-blue-200 uppercase">
                BIT Connections
              </p>
            </div>
            <div className="transform transition-all duration-300 hover:scale-105">
              <h1 className="text-5xl font-bold leading-tight mb-6 text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-100">
                Your next connection awaits!
              </h1>
              <p className="text-lg font-light text-blue-50 leading-relaxed">
                Log in to access campus tools, collaborate with peers, and
                continue where you left off.
              </p>
            </div>
            <div /> {/* Spacer */}
          </div>
        </div>

        {/* Right Side */}
        <div className="flex flex-col justify-center p-8 md:p-16 md:w-1/2">
          <div className="max-w-md mx-auto w-full">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Welcome back!
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              Please sign in to your account
            </p>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <Mail className="h-4 w-4 text-gray-400" />
                  Email address
                </label>
                <input
                  onChange={(e) => setEmail(e.target.value)}
                  type="email"
                  placeholder="you@company.com"
                  className="w-full p-3 border border-gray-300 rounded-lg placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                />
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <Lock className="h-4 w-4 text-gray-400" />
                  Password
                </label>
                <input
                  onChange={(e) => setPassword(e.target.value)}
                  type="password"
                  placeholder="••••••••"
                  className="w-full p-3 border border-gray-300 rounded-lg placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                />
              </div>
              <button
                onClick={handleLogin}
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-500 text-white p-3 rounded-lg font-medium hover:from-blue-700 hover:to-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {isLoading ? "Signing in..." : "Sign in"}
              </button>

              <div className="relative flex items-center justify-center">
                <div className="absolute w-full border-t border-gray-300"></div>
                <span className="relative bg-white px-4 text-sm text-gray-500">
                  or continue with
                </span>
              </div>

              <div
                id="google-signin-div"
                className="w-full flex justify-center"
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
