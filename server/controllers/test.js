const db = require("../src/config/db");
const crypto = require("crypto");
const fs = require("fs");
const getFileHash = (filePath) => {
  const fileBuffer = fs.readFileSync(filePath);
  const hashSum = crypto.createHash("sha256");
  hashSum.update(fileBuffer);
  return hashSum.digest("hex");
};
const upload_datas = async (req, res) => {
  try {
    let query, value;

    if (req.file) {
      const imageHash = getFileHash(req.file.path);
      const [existing] = await db.query(
        "SELECT * FROM raw_photos WHERE hash_image = ? AND user = ?",
        [imageHash, req.body.user]
      );

      if (existing.length > 0) {
        return res
          .status(200)
          .send({ message: "Duplicate photo detected for this Contact." });
      }

      query =
        "INSERT INTO raw_photos (image, user, hash_image) VALUES (?, ?, ?)";
      value = [req.file.path, req.body.user, imageHash];
    } else {
      const [existing] = await db.query(
        "SELECT * FROM raw_data WHERE phone_no = ? AND event_name = ?",
        [req.body.phone, req.body.event]
      );

      if (existing.length > 0) {
        return res
          .status(200)
          .send({
            message: "Data already exists for this phone number and event",
          });
      }

      query = `
        INSERT INTO raw_data (name, phone_no, event_name, role, user)
        VALUES (?, ?, ?, ?, ?)
      `;
      value = [
        req.body.name,
        req.body.phone,
        req.body.event,
        req.body.role,
        req.body.user,
      ];
    }

    const [results] = await db.query(query, value);
    console.log("DB insert successful, sending response...");

    if (req.file) {
      return res.status(200).send({
        message: "Photo uploaded successfully",
        path: req.file.path,
      });
    } else {
      return res.status(200).send({
        message: "Data inserted successfully",
        name: req.body.name,
        phone_no: req.body.phone,
        event_name: req.body.event,
        role: req.body.role,
        user: req.body.user,
      });
    }
  } catch (err) {
    console.error("DB error:", err);
    return res.status(500).send({ message: "Error in database" });
  }
};

const get_data = async (req, res) => {
  try {
    const user = req.body.user;
    
    // Prepare queries based on user parameter
    const dataQuery = user 
      ? ["SELECT * FROM raw_data WHERE user = ?", [user]]
      : ["SELECT * FROM raw_data"];
    
    const photosQuery = user 
      ? ["SELECT * FROM raw_photos WHERE user = ?", [user]]
      : ["SELECT * FROM raw_photos"];
    
    // Execute both queries concurrently
    const [[raw_data], [raw_photos]] = await Promise.all([
      db.query(...dataQuery),
      db.query(...photosQuery)
    ]);
    
    res.status(200).json({
      forms: raw_data,
      images: raw_photos,
    });
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).json({ message: "Server error fetching data" });
  }
};

module.exports = { upload_datas, get_data };
