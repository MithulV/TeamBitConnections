import React, { useState, useEffect } from "react";
import Avatar from "../../assets/Avatar.png";
import { useAuthStore } from "../../store/AuthStore";

function Header() {
  const { email, name, profilePicture } = useAuthStore();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [imgSrc, setImgSrc] = useState(Avatar); // Default to Avatar
  const [failedUrls, setFailedUrls] = useState(new Set()); // Track URLs that have failed

  // Set image source with fallback logic
  useEffect(() => {
    if (
      profilePicture &&
      profilePicture !== "null" &&
      !failedUrls.has(profilePicture)
    ) {
      setImgSrc(profilePicture);
    } else {
      setImgSrc(Avatar);
    }
  }, [profilePicture, failedUrls]);

  // Clear failed URLs when profile picture URL changes to a different one
  useEffect(() => {
    if (profilePicture && profilePicture !== "null") {
      // Only clear if this is a genuinely new URL
      setFailedUrls((prev) => {
        if (prev.has(profilePicture)) {
          return prev; // Keep the failed URLs if this is the same failing URL
        }
        // Clear failed URLs for new profile picture
        return new Set();
      });
    }
  }, [profilePicture]);

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
                // Profile image loaded successfully
              }}
              onError={(e) => {
                const failedUrl = e.target.src;

                // Add this URL to the failed URLs set to prevent future retries
                if (
                  failedUrl !== Avatar &&
                  profilePicture &&
                  failedUrl.includes(profilePicture)
                ) {
                  setFailedUrls((prev) => new Set([...prev, profilePicture]));
                }

                // Switch to default avatar immediately
                if (e.target.src !== Avatar) {
                  e.target.src = Avatar;
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
