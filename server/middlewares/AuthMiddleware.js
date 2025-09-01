import jwt from "jsonwebtoken";

const verifyToken = (req, res, next) => {
  // Get token from "Authorization" header
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Bearer <token>

  console.log("Auth Header:", authHeader);
  console.log("Extracted Token:", token);
  console.log("JWT_SECRET:", process.env.JWT_SECRET);

  if (!token) {
    console.log("No token provided");
    return res.status(401).json({ message: "No token provided" });
  }

  // Verify token
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      console.log("Token verification error:", err.message);
      return res
        .status(403)
        .json({ message: "Invalid or expired token", error: err.message });
    }

    console.log("Token verified successfully. Decoded:", decoded);
    // Store decoded payload in req.user
    req.user = decoded;
    next();
  });
};

export default verifyToken;
