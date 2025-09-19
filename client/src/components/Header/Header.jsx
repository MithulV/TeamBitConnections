import React, { useState, useEffect } from "react";
import Avatar from "../../assets/Avatar.png";
import { useAuthStore } from "../../store/AuthStore";

function Header() {
  const { email, name, profilePicture } = useAuthStore();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [imgSrc, setImgSrc] = useState(Avatar); // Default to Avatar

  // Set image source with fallback logic
  useEffect(() => {
    if (profilePicture && !imageError) {
      // Reset error state when we get a new profile picture
      setImageError(false);
      setImgSrc(profilePicture);
    } else {
      setImgSrc(Avatar);
    }
  }, [profilePicture, imageError]);

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
    <div className="relative md:sticky top-0 z-50 px-8 py-5 bg-white">
      <div className="flex justify-end w-full">
        {/* User Info - Hidden on mobile, visible on desktop - Always positioned on the right */}
        <div className="hidden md:flex items-center gap-4">
          <div className="text-right">
            <p className="text-lg font-semibold text-gray-800 whitespace-nowrap">
              {name || email || "user@gmail.com"}
            </p>
            <p className="text-sm text-gray-500 whitespace-nowrap">
              Welcome back !
            </p>
          </div>
          <div className="w-12 h-12 flex-shrink-0">
            <img
              src={imgSrc}
              alt="user profile"
              className="w-full h-full rounded-full object-cover shadow-sm"
              onLoad={() => {
                setImageError(false);
              }}
              onError={(e) => {
                setImageError(true);
                if (e.target.src !== Avatar) {
                  e.target.src = Avatar; // Fallback to default avatar
                }
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Header;
