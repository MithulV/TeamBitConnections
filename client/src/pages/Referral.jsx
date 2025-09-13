import { useState } from "react";
import axios from "axios";
import Alert from "../components/Alert";
import Header from "../components/Header";
import { useAuthStore } from "../store/AuthStore";

function Referral() {
  const { role, email, id } = useAuthStore();
  const [inviteeEmail, setInviteeEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({
    isOpen: false,
    severity: "success",
    message: "",
  });

  const handleSendInvitation = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Basic email validation
    if (!inviteeEmail) {
      setAlert({
        isOpen: true,
        severity: "error",
        message: "Friend's email address is required",
      });
      setLoading(false);
      return;
    }

    if (email === inviteeEmail) {
      setAlert({
        isOpen: true,
        severity: "error",
        message: "You cannot refer yourself",
      });
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:8000/api/send-referral",
        {
          referrerEmail: email,
          inviteeEmail: inviteeEmail,
        }
      );

      if (response.data.success) {
        setAlert({
          isOpen: true,
          severity: "success",
          message: "Referral invitation sent successfully! 🎉",
        });

        // Clear form
        setInviteeEmail("");
      }
    } catch (error) {
      setAlert({
        isOpen: true,
        severity: "error",
        message:
          error.response?.data?.message ||
          "Failed to send invitation. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  // Show loading if user data is not yet available
  if (!email) {
    return (
      <div className="h-screen bg-slate-50 overflow-hidden">
        <Header />
        <div className="flex items-center justify-center h-3/4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent mx-auto mb-4"></div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">
              Loading...
            </h3>
            <p className="text-gray-500">
              Please wait while we load your profile...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <Header />

      {/* Main Container - Responsive Layout */}
      <div className="flex items-center justify-center min-h-[calc(100vh-80px)] px-4 py-8 overflow-y-auto">
        <div className="flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-12 w-full max-w-6xl">
          {/* Left Section - Visual/Info */}
          <div className="flex-1 max-w-lg w-full">
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center justify-center w-16 h-16 lg:w-20 lg:h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full mb-4 lg:mb-6 shadow-lg">
                <svg
                  className="w-8 h-8 lg:w-10 lg:h-10 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                  />
                </svg>
              </div>

              <h1 className="text-2xl lg:text-4xl font-bold text-gray-800 mb-3 lg:mb-4">
                Invite Your Friends
              </h1>

              <p className="text-lg lg:text-xl text-gray-600 mb-4 lg:mb-6">
                Share our platform with people you know and help them discover
                something amazing.
              </p>

              {/* Benefits List */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 lg:p-6 mb-4 lg:mb-6">
                <h3 className="text-lg font-semibold text-green-800 mb-4">
                  After successfully sending Invitation
                </h3>
                {/* Steps */}
                <div className="mt-3">
                  <h3 className="text-sm font-medium text-gray-900 mb-4">
                    What happens next?
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center text-sm text-gray-600">
                      <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                        <span className="text-xs font-medium text-blue-600">
                          1
                        </span>
                      </div>
                      Your friend receives an invitation email
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                        <span className="text-xs font-medium text-blue-600">
                          2
                        </span>
                      </div>
                      They click the link to create their account
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                        <span className="text-xs font-medium text-blue-600">
                          3
                        </span>
                      </div>
                      They set their password and join the platform
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Section - Form */}
          <div className="flex-1 max-w-lg w-full">
            <div className="bg-white rounded-xl shadow-lg p-6 lg:p-8">
              <div className="text-center mb-6 lg:mb-8">
                <h2 className="text-xl lg:text-2xl font-bold text-gray-800 mb-2">
                  Send Invitation
                </h2>
                <p className="text-gray-600 text-sm lg:text-base">
                  Enter your friend's email to get started
                </p>
              </div>

              {/* How it Works Info Box */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 lg:p-4 mb-4 lg:mb-6">
                <div className="flex items-start">
                  <svg
                    className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <p className="ml-3 text-sm text-blue-800">
                    <strong>How it works:</strong> They'll receive an email with
                    a secure link to create their account and set their
                    password.
                  </p>
                </div>
              </div>

              <form
                onSubmit={handleSendInvitation}
                className="space-y-4 lg:space-y-6"
              >
                {/* Your Email Display */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Your Email Address
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      value={email}
                      disabled
                      readOnly
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed text-sm lg:text-base"
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                      <svg
                        className="w-5 h-5 text-green-500"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  </div>
                  <p className="mt-1 text-xs text-green-600">
                    ✓ Logged in as {email} ({role})
                  </p>
                </div>

                {/* Friend's Email Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Friend's Email Address
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      value={inviteeEmail}
                      onChange={(e) => setInviteeEmail(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 text-sm lg:text-base"
                      placeholder="friend.email@example.com"
                      required
                      disabled={loading}
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                      <svg
                        className="w-5 h-5 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"
                        />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading || !inviteeEmail}
                  className={`w-full py-3 lg:py-4 px-6 rounded-lg font-semibold text-white transition duration-200 transform text-sm lg:text-base ${
                    loading || !inviteeEmail
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl"
                  }`}
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <svg
                        className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Sending Invitation...
                    </div>
                  ) : (
                    <div className="flex items-center justify-center">
                      <svg
                        className="w-5 h-5 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                        />
                      </svg>
                      Send Invitation
                    </div>
                  )}
                </button>
              </form>

              {/* Footer */}
              <div className="text-center mt-6 lg:mt-8 pt-4 lg:pt-6 border-t border-gray-200">
                <p className="text-xs text-gray-500">
                  The invitation link expires in 24 hours and can only be used
                  once.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Alert Component */}
      <Alert
        isOpen={alert.isOpen}
        severity={alert.severity}
        message={alert.message}
        onClose={() => setAlert({ ...alert, isOpen: false })}
      />
    </div>
  );
}

export default Referral;
