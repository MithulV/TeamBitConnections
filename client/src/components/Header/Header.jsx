import React, { useState, useEffect } from "react";
import Avatar from "../../assets/Avatar.png";
import { useAuthStore } from "../../store/AuthStore";

function Header() {
  const { email, name, profilePicture } = useAuthStore();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [imgSrc, setImgSrc] = useState(Avatar);
  const [hasImageError, setHasImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  console.log("name:", name);
  // Handle image source logic
  useEffect(() => {
    setHasImageError(false);
    setIsLoading(true);

    if (profilePicture && profilePicture !== "null") {
      setImgSrc(profilePicture);
    } else {
      setImgSrc(Avatar);
      setIsLoading(false);
    }
  }, [profilePicture]);

  // Handle image load success
  const handleImageLoad = () => {
    setIsLoading(false);
    setHasImageError(false);
  };

  // Handle image load error
  const handleImageError = () => {
    setIsLoading(false);
    setHasImageError(true);
    setImgSrc(Avatar);
  };

  // Check for mobile menu state
  useEffect(() => {
    const checkMobileMenuState = () => {
      setIsMobileMenuOpen(document.body.classList.contains("mobile-menu-open"));
    };

    checkMobileMenuState();
    const observer = new MutationObserver(checkMobileMenuState);
    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

  if (isMobileMenuOpen) {
    return null;
  }

  return (
    <div className="relative md:sticky top-0 z-50 px-8 py-5 bg-white">
      <div className="flex justify-end w-full">
        <div className="hidden md:flex items-center gap-4">
          <div className="text-right">
            <p className="text-lg font-semibold text-gray-800 whitespace-nowrap">
              {name || email || "user@gmail.com"}
            </p>
            <p className="text-sm text-gray-500 whitespace-nowrap">
              Welcome back!
            </p>
          </div>
          <div className="w-12 h-12 flex-shrink-0 relative">
            {isLoading && (
              <div className="absolute inset-0 bg-gray-200 rounded-full animate-pulse" />
            )}
            
            {/* Use SVG with foreignObject for Google profile pictures */}
            <svg 
              width="48" 
              height="48" 
              className="rounded-full overflow-hidden shadow-sm"
              style={{ display: 'block' }}
            >
              <defs>
                <clipPath id="avatar-clip">
                  <circle cx="24" cy="24" r="24" />
                </clipPath>
              </defs>
              <foreignObject 
                x="0" 
                y="0" 
                width="48" 
                height="48"
                clipPath="url(#avatar-clip)"
              >
                <img
                  xmlns="http://www.w3.org/1999/xhtml"
                  src={imgSrc}
                  alt="user profile"
                  style={{
                    width: '48px',
                    height: '48px',
                    objectFit: 'cover',
                    display: 'block',
                    opacity: isLoading ? 0 : 1,
                    transition: 'opacity 200ms'
                  }}
                  onLoad={handleImageLoad}
                  onError={handleImageError}
                />
              </foreignObject>
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Header;
