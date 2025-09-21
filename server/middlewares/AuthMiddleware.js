// file: authMiddleware.js
import jwt from "jsonwebtoken";

  
export const verifyToken = (req, res, next) => {
  const token = req.cookies.token; // read JWT from httpOnly cookie

  if (!token) {
    console.log("No token provided in cookie");
    return res.status(401).json({ message: "No token provided" });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      console.log("Token verification error:", err.message);
      return res.status(403).json({
        message: "Invalid or expired token",
        error: err.message,
      });
    }

    req.user = decoded; // store decoded payload
    next();
  });
};


// Role-based authorization middleware
export const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Access forbidden: insufficient role" });
    }

    next();
  };
};
