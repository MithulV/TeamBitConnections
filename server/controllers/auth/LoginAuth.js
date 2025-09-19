import db from "../../src/config/db.js";
import jwt from "jsonwebtoken";

export const loginUser = async (req, res) => {
  const { email, password } = req.body;
  console.log("Login attempt with email:", email, "password:", password);

  try {
    // Query the login table
    const rows = await db`
            SELECT * FROM login 
            WHERE email = ${email} AND password = ${password}
        `;

    if (rows.length > 0) {
      const user = rows[0];
      // JWT payload
      const payload = {
        id: user.id,
        email: user.email,
        role: user.role,
      };
      const token = jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: "24h",
      });

      // Send both token & user details
      res.status(200).json({
        success: true,
        token,
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
        },
      });
    } else {
      res
        .status(401)
        .json({ success: false, message: "Invalid email or password" });
    }
  } catch (error) {
    console.error("Database query error:", error);
    res
      .status(500)
      .json({ success: false, message: "Server error during login" });
  }
};
