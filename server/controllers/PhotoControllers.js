import multer from "multer";
import path from "path";
import db from "../src/config/db.js";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

export const upload = multer({ storage: storage });

export const UploadImage = async (req, res) => {
  try {
    const {
      user_id,
      eventName,
      eventRole,
      eventDate,
      eventHeldOrganization,
      eventLocation,
    } = req.body;

    const result = await db.begin(async (t) => {
      // Insert photo first
      const [photo] = await t`
        INSERT INTO photos (created_by, file_path) 
        VALUES (${user_id}, ${req.file?.path || null})
        RETURNING *
      `;

      console.log(req.body.eventName);
      const [newEvent] = await t`
          INSERT INTO event (
            photo_id, 
            event_name, 
            event_role, 
            event_date, 
            event_held_organization, 
            event_location, 
            verified, 
            created_by
          ) VALUES (
            ${photo.id}, 
            ${eventName}, 
            ${eventRole || null}, 
            ${eventDate || null}, 
            ${eventHeldOrganization || null}, 
            ${eventLocation || null}, 
            false, 
            ${user_id}
          )
          RETURNING *
        `;

      return { photo, event: newEvent };
    });

    return res.status(200).json({
      success: true,
      message: "Photo and event inserted successfully",
      file: req.file,
      photo: result.photo,
      event: result.event,
    });
  } catch (err) {
    console.error("UploadImage error:", err);
    return res.status(500).json({
      success: false,
      error: `Error inserting photo/event: ${err.message}`,
    });
  }
};

export const GetPicturesByUserId = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res
        .status(400)
        .json({ success: false, error: "User ID is required." });
    }

    const pictures = await db`
      SELECT 
        p.*,
        COALESCE(
          (
            SELECT json_agg(to_jsonb(e))
            FROM event e
            WHERE e.photo_id = p.id
          ), '[]'::json
        ) AS events
      FROM photos p
      WHERE p.created_by = ${userId};
    `;

    return res.status(200).json({ success: true, data: pictures });
  } catch (err) {
    console.error("Error fetching pictures:", err); // Use console.error for logging errors
    return res
      .status(500)
      .json({ success: false, error: "An internal server error occurred." });
  }
};

export const GetUnVerifiedImages = async (req, res) => {
  try {
    const pictures = await db`
      SELECT 
        p.*,
        COALESCE(
          (
            SELECT json_agg(to_jsonb(e))
            FROM event e
            WHERE e.photo_id = p.id
          ), '[]'::json
        ) AS events
      FROM photos p
      WHERE p.verified IS NULL OR p.verified = FALSE;
    `;

    return res.status(200).json({ success: true, data: pictures });
  } catch (err) {
    console.error("Error fetching pictures:", err); // Use console.error for logging errors
    return res
      .status(500)
      .json({ success: false, error: "An internal server error occurred." });
  }
};

export const DeleteImage = async (req, res) => {
  const { id } = req.params;
  const { userType = null } = req.query;
  console.log(id, userType);
  
  try {
    await db.begin(async (t) => {
      const [image] = await t`
        SELECT id, status, verified 
        FROM photos 
        WHERE id = ${id}
      `;

      if (!image) {
        throw new Error("Image not found");
      }

      if (userType === "user") {
        if (
          (image.status === "pending" && image.verified === false) || 
          (image.status === "rejected" && image.verified === true)
        ) {
          await performCompleteImageDeletion(t, id);

          return res.status(200).json({
            success: true,
            message: "Image deleted successfully!",
            action: "deleted",
          });
        } else if (image.status === "approved" && image.verified === true) {
          return res.status(403).json({
            success: false,
            message: "Cannot delete approved and verified images. Contact support if needed.",
            action: "denied",
            reason: "Image is approved and verified",
            status: image.status,
            verified: image.verified,
          });
        } else {
          return res.status(403).json({
            success: false,
            message: "You don't have permission to delete this image as it is approved.",
            action: "denied",
            reason: "Insufficient permissions for current image state",
            status: image.status,
            verified: image.verified,
          });
        }
      } else if (["cata", "catb", "catc", "admin"].includes(userType)) {
        await t`
          UPDATE photos 
          SET status = 'rejected', verified = ${true}
          WHERE id = ${id}
        `;

        return res.status(200).json({
          success: true,
          message: "Image status updated to rejected successfully!",
          action: "rejected",
          previousStatus: image.status,
        });
      } else {
        throw new Error("Invalid user type");
      }
    });
  } catch (err) {
    console.error("DeleteImage error:", err);

    if (err.message === "Image not found") {
      return res.status(404).json({
        success: false,
        message: "Image not found.",
      });
    } else if (err.message === "Invalid user type") {
      return res.status(400).json({
        success: false,
        message: "Invalid user type provided.",
      });
    } else {
      return res.status(500).json({
        success: false,
        message: "Server Error!",
        error: err.message,
      });
    }
  }
};

const performCompleteImageDeletion = async (transaction, imageId) => {
  await transaction`DELETE FROM photos WHERE id = ${imageId}`;
};


export const VerifyImages = async (req, res) => {
  try {
    const { id } = req.params;
    const pictures =
      await db`UPDATE photos SET verified=TRUE, status='approved' WHERE id = ${id} RETURNING *`;

    if (!pictures || pictures.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "No pictures found for this user." });
    }

    return res.status(200).json({ success: true, data: pictures });
  } catch (err) {
    console.error("Error fetching pictures:", err); // Use console.error for logging errors
    return res
      .status(500)
      .json({ success: false, error: "An internal server error occurred." });
  }
};
