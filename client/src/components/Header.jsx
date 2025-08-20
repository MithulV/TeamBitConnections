import React from "react";
import Avatar from "../assets/Avatar.png";
import { useAuthStore } from "../store/AuthStore";

function Header() {
  const { email } = useAuthStore();
  return (
    <div className="sticky top-0 z-50 px-8 py-2.5 shadow-sm bg-white border-b border-gray-200">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        {/* User Info */}
        <div className="flex items-center gap-4">
          <img
            src={Avatar}
            alt="user profile"
            className="w-12 h-12 rounded-full object-cover shadow-sm"
          />
          <div>
            <p className="text-lg font-semibold text-gray-800 ">
              {email || "user@gmail.com"}
            </p>
            <p className="text-sm text-gray-500">Welcome back!</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Header;
