import express from "express";
import { loginUser } from "../controllers/auth/LoginAuth.js";
import { verifyToken, authorizeRoles } from "../middlewares/AuthMiddleware.js";

const router = express.Router();
// Get current user info
router.get("/me", verifyToken, async (req, res) => {
  try {
    // Import db here to avoid circular dependencies
    const { default: db } = await import("../src/config/db.js");

    // Fetch complete user data from database
    const userData = await db`
      SELECT id, email, role, first_name, last_name, username, profile_picture, provider 
      FROM login WHERE id = ${req.user.id}
    `;

    if (userData.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const user = userData[0];

    return res.json({
      id: user.id,
      email: user.email,
      role: user.role,
      name:
        user.username ||
        `${user.first_name || ""} ${user.last_name || ""}`.trim() ||
        user.email,
      profilePicture: user.profile_picture,
      provider: user.provider,
    });
  } catch (error) {
    console.error("Error fetching user data:", error);
    return res.status(500).json({ message: "Server error" });
  }
});

// Protected route testing

// router.get("/admin", verifyToken, authorizeRoles("admin"), (req, res) => {
//   return res.json({ message: `Hello Admin ${req.user.email}` });
// });

router.post("/logout", (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: true,
    sameSite: "Strict",
  });
  return res.json({ success: true, message: "Logged out" });
});

router.post("/login", loginUser);

export default router;
