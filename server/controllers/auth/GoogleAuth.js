import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";
import db from "../../src/config/db.js";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export const verifyGoogleToken = async (req, res) => {
  try {
    const { credential } = req.body;

    // Verify the Google ID token
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const {
      sub: googleId,
      email,
      name,
      given_name: firstName,
      family_name: lastName,
      picture,
    } = payload;

    // Use the original picture URL without modification for better compatibility
    const profilePictureUrl = picture;

    // Check if user exists with Google ID
    const existingUser = await db`
      SELECT * FROM login WHERE google_id = ${googleId}
    `;

    let user;

    if (existingUser.length > 0) {
      // User exists, update profile info and login time
      user = existingUser[0];
      await db`
        UPDATE login 
        SET profile_picture = ${profilePictureUrl}, first_name = ${firstName}, last_name = ${lastName}, 
            username = ${name}, last_seen = NOW(), is_online = true 
        WHERE google_id = ${googleId}
      `;

      // Get updated user data
      const updatedUser = await db`
        SELECT * FROM login WHERE google_id = ${googleId}
      `;
      user = updatedUser[0];
    } else {
      // Check if user exists with same email
      const emailUser = await db`
        SELECT * FROM login WHERE email = ${email}
      `;

      if (emailUser.length > 0) {
        // Link Google account to existing user and update profile
        user = emailUser[0];
        await db`
          UPDATE login 
          SET google_id = ${googleId}, provider = 'google', profile_picture = ${profilePictureUrl}, 
              first_name = ${firstName}, last_name = ${lastName}, username = ${name},
              last_seen = NOW(), is_online = true 
          WHERE email = ${email}
        `;

        // Get updated user data
        const updatedUser = await db`
          SELECT * FROM login WHERE email = ${email}
        `;
        user = updatedUser[0];
      } else {
        // Create new user with complete profile information
        const result = await db`
          INSERT INTO login (google_id, email, first_name, last_name, provider, profile_picture, username, created_at, updated_at, last_seen, is_online) 
          VALUES (${googleId}, ${email}, ${firstName}, ${lastName}, 'google', ${profilePictureUrl}, ${name}, NOW(), NOW(), NOW(), true)
          RETURNING *
        `;
        user = result[0];
      }
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role || "user",
      },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.username || `${user.first_name} ${user.last_name}`.trim(),
        firstName: user.first_name,
        lastName: user.last_name,
        profilePicture: user.profile_picture,
        provider: user.provider,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Google token verification failed:", error);
    res.status(400).json({
      success: false,
      message: "Invalid Google token",
    });
  }
};
