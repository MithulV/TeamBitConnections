import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, Lock } from "lucide-react";
import api from "../../utils/axios";
import { useAuthStore } from "../../store/AuthStore";
const campusImageUrl =
  "https://images.unsplash.com/photo-1562774053-701939374585?q=80&w=2072&auto=format&fit=crop";

const GoogleIcon = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 48 48"
    width="24px"
    height="24px"
    {...props}
  >
    <path
      fill="#FFC107"
      d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12s5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"
    />
    <path
      fill="#FF3D00"
      d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"
    />
    <path
      fill="#4CAF50"
      d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.222,0-9.651-3.358-11.303-7.962H6.389c3.279,6.463,9.932,11,17.611,11z"
    />
    <path
      fill="#1976D2"
      d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.574l6.19,5.238C42.012,35.197,44,30.024,44,24C44,22.659,43.862,21.35,43.611,20.083z"
    />
  </svg>
);

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const { setAuth, role } = useAuthStore();

  useEffect(() => {
    // If a role exists, the user is logged in, so redirect them.
    if (role) {
      navigate("/");
    }
  }, []);

  const handleLogin = async () => {
    try {
      const res = await api.post("/auth/login", {
        email,
        password,
      });
      if (res.data.success) {
        const { token, user } = res.data;
        setAuth(
          token,
          user.email,
          user.role,
          user.id,
          user.name,
          user.firstName,
          user.lastName,
          user.profilePicture
        ); // Update the zustand store
        localStorage.setItem("token", token); // Persist token
        navigate("/"); // Redirect on successful login
      }
    } catch (error) {
      console.error("Login failed:", error);
      alert("Login failed. Please check your credentials and try again.");
    }
  };

  const handleGoogleSignIn = async (response) => {
    try {
      const { credential } = response;

      // Send the credential to your backend
      const apiResponse = await api.post("/auth/google/verify", { credential });

      if (apiResponse.data.success) {
        const { token, user } = apiResponse.data;

        // Store the token and user data with enhanced profile information
        localStorage.setItem("token", token);
        setAuth(
          token,
          user.email,
          user.role,
          user.id,
          user.name,
          user.firstName,
          user.lastName,
          user.profilePicture
        );

        // Redirect based on user role
        if (user.role === "admin") {
          navigate("/admin");
        } else if (user.role === "middleman") {
          navigate("/middleman");
        } else {
          navigate("/user");
        }
      } else {
        throw new Error(apiResponse.data.message || "Authentication failed");
      }
    } catch (error) {
      console.error("Google sign-in failed:", error);

      // More specific error handling
      if (error.response?.status === 400) {
        alert("Invalid Google token. Please try again.");
      } else if (error.response?.status === 500) {
        alert("Server error. Please try again later.");
      } else {
        alert("Google sign-in failed. Please try again.");
      }
    }
  };

  // Initialize Google Sign-In when component mounts
  useEffect(() => {
    if (role) {
      navigate("/");
      return;
    }

    // Initialize Google Sign-In with error handling
    const initializeGoogleSignIn = () => {
      try {
        if (window.google) {
          window.google.accounts.id.initialize({
            client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
            callback: handleGoogleSignIn,
            auto_select: false,
            cancel_on_tap_outside: true,
            use_fedcm_for_prompt: false, // Disable FedCM
          });

          // Render the Google Sign-In button
          window.google.accounts.id.renderButton(
            document.getElementById("google-signin-div"),
            {
              theme: "outline",
              size: "large",
              width: "100%", // Use full width to match container
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

    // Check if Google script is loaded, if not wait for it
    if (window.google) {
      initializeGoogleSignIn();
    } else {
      // Wait for Google script to load
      const checkGoogle = setInterval(() => {
        if (window.google) {
          clearInterval(checkGoogle);
          initializeGoogleSignIn();
        }
      }, 100);

      // Clean up interval after 10 seconds
      setTimeout(() => clearInterval(checkGoogle), 10000);
    }
  }, [role, navigate]);

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
                className="w-full bg-gradient-to-r from-blue-600 to-blue-500 text-white p-3 rounded-lg font-medium hover:from-blue-700 hover:to-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
              >
                Sign in
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
