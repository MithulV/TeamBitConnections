import React from "react";
import Avatar from '../assets/Avatar.png';

function Header() {
  return (
    <div className="p-8 pt-4 pb-3 shadow bg-white flex-shrink-0">
      <div className="flex items-center justify-between">
        {/* User Info */}
        <div className="flex items-center gap-4">
          <img
            src={Avatar}
            alt="user profile"
            className="w-14 h-14 rounded-full object-cover"
          />
          <div>
            <p className="text-xl font-semibold text-gray-800">
              user@gmail.com
            </p>
            <p className="text-sm text-gray-500">Welcome back!</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Header;
