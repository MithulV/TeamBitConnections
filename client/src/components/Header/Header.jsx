import React, { useState, useEffect } from "react";
import Avatar from "../../assets/Avatar.png";
import { useAuthStore } from "../../store/AuthStore";

function Header() {
  const { email } = useAuthStore();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Check for mobile menu state by observing body class
  useEffect(() => {
    const checkMobileMenuState = () => {
      setIsMobileMenuOpen(document.body.classList.contains("mobile-menu-open"));
    };

    // Initial check
    checkMobileMenuState();

    // Create observer to watch for class changes
    const observer = new MutationObserver(checkMobileMenuState);
    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

  // Hide header when mobile menu is open
  if (isMobileMenuOpen) {
    return null;
  }

  return (
    <div className="relative md:sticky border-b-2 border-b-gray-200  top-0 z-50 px-8 py-5 bg-white">
      <div className="flex items-center justify-end mx-auto">
        {/* User Info - Hidden on mobile, visible on desktop */}
        <div className="hidden md:flex items-center gap-4 min-w-0 flex-shrink-0">
          <div className="text-right min-w-0 flex-shrink-0">
            <p className="text-lg font-semibold text-gray-800 whitespace-nowrap overflow-hidden text-ellipsis">
              {email || "user@gmail.com"}
            </p>
            <p className="text-sm text-gray-500 whitespace-nowrap">Welcome back! 👋</p>
          </div>
          <div className="w-12 h-12 flex-shrink-0">
            <img
              src={Avatar}
              alt="user profile"
              className="w-full h-full rounded-full object-cover shadow-sm"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Header;
