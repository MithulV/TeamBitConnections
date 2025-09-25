import multer from "multer";
import fs from "fs";
import path from "path";
import db from "../src/config/db.js";
import { logContactModification } from "./ModificationHistoryControllers.js";
// Multer storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = "uploads/";
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    cb(null, `csv-${timestamp}-${file.originalname}`);
  },
});

// Multer upload configuration
const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (
      file.mimetype === "text/csv" ||
      file.mimetype === "application/vnd.ms-excel" ||
      path.extname(file.originalname).toLowerCase() === ".csv"
    ) {
      cb(null, true);
    } else {
      cb(new Error("Only CSV files are allowed"), false);
    }
  },
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});

// Main CSV Import Function
export const ImportContactsFromCSV = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        message: "CSV file is required",
        success: false,
      });
    }

    const { created_by } = req.body;
    const filePath = req.file.path;
    let fileRows = [];

    console.log(`Processing CSV file: ${req.file.originalname}`);

    // MANUAL CSV PARSING APPROACH
    let fileContent = fs.readFileSync(filePath, "utf8");

    // Remove BOM if present
    if (fileContent.charCodeAt(0) === 0xfeff) {
      fileContent = fileContent.substring(1);
      console.log("BOM detected and removed");
    }

    // Split into lines and parse manually
    const lines = fileContent
      .split("\n")
      .filter((line) => line.trim().length > 0);

    if (lines.length === 0) {
      fs.unlinkSync(filePath);
      return res.status(400).json({
        message: "CSV file is empty",
        success: false,
      });
    }

    // PROPER CSV PARSING FUNCTION
    const parseCSVLine = (line) => {
      const result = [];
      let current = "";
      let inQuotes = false;

      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        const nextChar = line[i + 1];

        if (char === '"') {
          if (inQuotes && nextChar === '"') {
            // Handle escaped quotes ("")
            current += '"';
            i++; // Skip next quote
          } else {
            // Toggle quote state
            inQuotes = !inQuotes;
          }
        } else if (char === "," && !inQuotes) {
          // Found unquoted comma - end of field
          result.push(current.trim());
          current = "";
        } else {
          current += char;
        }
      }

      // Add the last field
      result.push(current.trim());
      return result;
    };

    // PARSE HEADER AND DATA WITH PROPER CSV HANDLING
    const headerLine = lines[0].trim();
    const headers = parseCSVLine(headerLine).map((h) =>
      h.replace(/^"|"$/g, "")
    );

    console.log("Parsed headers:", headers);

    // Parse data rows
    for (let i = 1; i < lines.length; i++) {
      const dataLine = lines[i].trim();
      if (dataLine.length === 0) continue;

      const values = parseCSVLine(dataLine).map((v) => v.replace(/^"|"$/g, ""));

      // Ensure we have the right number of columns
      if (values.length !== headers.length) {
        console.warn(
          `⚠️ Row ${i + 1} has ${values.length} columns but expected ${
            headers.length
          }. Skipping.`
        );
        console.warn(`Row data: ${dataLine}`);
        continue;
      }

      // Create row object
      const row = {};
      headers.forEach((header, index) => {
        row[header] = values[index] || "";
      });

      fileRows.push(row);
    }

    console.log(`✅ Successfully parsed ${fileRows.length} rows`);
    console.log("📋 First row sample:", fileRows[0]);
    console.log("📋 Headers found:", headers);

    // Clean up uploaded file
    fs.unlinkSync(filePath);

    // 🔍 CHECK EXISTING GENDER VALUES IN DATABASE
    try {
      const existingGenders = await db`
        SELECT DISTINCT gender 
        FROM contact 
        WHERE gender IS NOT NULL 
        LIMIT 10
      `;
      console.log(
        "🔍 Existing gender values in database:",
        existingGenders.map((r) => r.gender)
      );
    } catch (genderCheckError) {
      console.log(
        "⚠️ Could not check existing gender values:",
        genderCheckError.message
      );
    }

    // Process CSV data with database transaction
    try {
      const result = await db.begin(async (t) => {
        const processedContacts = [];
        const errors = [];
        const duplicates = [];
        let successCount = 0;

        for (let i = 0; i < fileRows.length; i++) {
          const row = fileRows[i];
          const rowNumber = i + 2; // +2 because arrays start at 0 and CSV header is row 1

          try {
            console.log(`Processing row ${rowNumber}:`, {
              name: row.name,
              phone: row.phone || row.phone_number,
              email: row.email || row.email_address,
            });

            // ✅ MAP CSV FIELD NAMES TO DATABASE FIELD NAMES
            // Handle different possible CSV column names
            if (!row.phone_number && row.phone) {
              row.phone_number = row.phone;
            }
            if (!row.email_address && row.email) {
              row.email_address = row.email;
            }

            // Basic validation
            if (!row.name || !row.phone_number || !row.email_address) {
              errors.push({
                row: rowNumber,
                message:
                  "Missing required fields: name, phone_number (or phone), email_address (or email)",
                data: row,
              });
              continue;
            }

            // ✅ VALIDATE AND CLEAN GENDER FIELD
            let validGender = null;
            if (row.gender && row.gender.trim() !== "") {
              const inputGender = row.gender.toString().trim().toLowerCase();

              // Test common enum formats - we'll try the most likely ones
              if (inputGender === "m" || inputGender === "male") {
                // Try different possible enum values
                validGender = "Male"; // Title case - very common in enums
              } else if (inputGender === "f" || inputGender === "female") {
                validGender = "Female"; // Title case - very common in enums
              } else {
                // For any other value (including 'other', 'o', etc.), set to null
                console.log(
                  `ℹ️ Gender value "${row.gender}" in row ${rowNumber} set to null (only Male/Female accepted)`
                );
                validGender = null;
              }
            }
            row.gender = validGender;

            // ✅ VALIDATE FIELD LENGTHS TO PREVENT VARCHAR ERRORS
            // Based on the error "character varying(20)", some fields have a 20-character limit
            const fieldLimits = {
              phone_number: 20, // Likely the field causing the error
              category: 20,
              nationality: 50,
              marital_status: 20,
            };

            Object.keys(fieldLimits).forEach((field) => {
              if (row[field] && row[field].length > fieldLimits[field]) {
                console.warn(
                  `⚠️ Row ${rowNumber}: ${field} truncated from ${row[field].length} to ${fieldLimits[field]} chars`
                );
                row[field] = row[field].substring(0, fieldLimits[field]);
              }
            });

            // Check for existing contact (duplicate prevention)
            const existingContact = await t`
              SELECT contact_id, name FROM contact 
              WHERE (email_address = ${row.email_address} AND email_address IS NOT NULL)
                 OR (phone_number = ${row.phone_number} AND phone_number IS NOT NULL)
              LIMIT 1
            `;

            if (existingContact.length > 0) {
              duplicates.push({
                row: rowNumber,
                message: `Contact already exists: ${existingContact[0].name}`,
                existingContactId: existingContact[0].contact_id,
                data: row,
              });
              continue;
            }

            // ✅ INSERT NEW CONTACT - Main contact table
            const [newContact] = await t`
              INSERT INTO contact (
                created_by, name, phone_number, email_address, 
                dob, gender, nationality, marital_status, category,
                secondary_email, secondary_phone_number, 
                emergency_contact_name, emergency_contact_relationship, emergency_contact_phone_number,
                skills, linkedin_url, created_at, updated_at
              ) VALUES (
                ${created_by || null}, ${row.name}, ${row.phone_number}, ${row.email_address},
                ${row.dob || null}, ${row.gender || null}, ${row.nationality || null}, 
                ${row.marital_status || null}, ${row.category?.toUpperCase() || null},
                ${row.secondary_email || null}, ${row.secondary_phone_number || null},
                ${row.emergency_contact_name || null}, ${row.emergency_contact_relationship || null}, 
                ${row.emergency_contact_phone_number || null},
                ${row.skills || null}, ${row.linkedin_url || null}, NOW(), NOW()
              ) RETURNING *
            `;

            const contactId = newContact.contact_id;
            console.log(`✅ Inserted contact ${contactId}: ${row.name}`);

            // ✅ ADD CONTACT MODIFICATION LOGGING
            try {
              await logContactModification(db, contactId, created_by, "CREATE", t);
              console.log(`✅ Contact modification logged for contact ${contactId}`);
            } catch (err) {
              console.warn(
                "Contact modification logging failed, but continuing operation:",
                err.message
              );
              // Execution continues
            }


            // ✅ PARALLEL EXECUTION OF INDEPENDENT OPERATIONS USING PROMISE.ALL
            // Create array of promises for independent operations
            const parallelOperations = [];

            // ✅ INSERT ADDRESS DATA
            if (row.street || row.city || row.state || row.country || row.zipcode) {
              parallelOperations.push(
                t`
                  INSERT INTO contact_address (
                    contact_id, street, city, state, country, zipcode, created_at
                  ) VALUES (
                    ${contactId}, ${row.street || null}, ${row.city || null}, 
                    ${row.state || null}, ${row.country || null}, ${row.zipcode || null}, 
                    NOW()
                  )
                `.then(() => {
                  console.log(`✅ Inserted address for contact ${contactId}`);
                  return { type: 'address', contactId };
                }).catch((error) => {
                  console.error(`❌ Address insertion failed for contact ${contactId}:`, error);
                  throw error;
                })
              );
            }

            // ✅ INSERT EDUCATION DATA
            if (row.pg_course_name || row.pg_college_name || row.ug_course_name || row.ug_college_name) {
              parallelOperations.push(
                t`
                  INSERT INTO contact_education (
                    contact_id, pg_course_name, pg_college, pg_university, 
                    pg_from_date, pg_to_date, ug_course_name, ug_college, 
                    ug_university, ug_from_date, ug_to_date
                  ) VALUES (
                    ${contactId}, ${row.pg_course_name || null}, ${row.pg_college_name || null}, 
                    ${row.pg_university_type || null}, ${row.pg_start_date || null}, 
                    ${row.pg_end_date || null}, ${row.ug_course_name || null}, 
                    ${row.ug_college_name || null}, ${row.ug_university_type || null}, 
                    ${row.ug_start_date || null}, ${row.ug_end_date || null}
                  )
                `.then(() => {
                  console.log(`✅ Inserted education for contact ${contactId}`);
                  return { type: 'education', contactId };
                }).catch((error) => {
                  console.error(`❌ Education insertion failed for contact ${contactId}:`, error);
                  throw error;
                })
              );
            }

            // ✅ INSERT EXPERIENCE DATA
            if (row.job_title || row.company_name) {
              parallelOperations.push(
                t`
                  INSERT INTO contact_experience (
                    contact_id, job_title, company, department, 
                    from_date, to_date, created_at
                  ) VALUES (
                    ${contactId}, ${row.job_title || null}, ${row.company_name || null}, 
                    ${row.department_type || null}, ${row.from_date || null}, 
                    ${row.to_date || null}, NOW()
                  )
                `.then(() => {
                  console.log(`✅ Inserted experience for contact ${contactId}`);
                  return { type: 'experience', contactId };
                }).catch((error) => {
                  console.error(`❌ Experience insertion failed for contact ${contactId}:`, error);
                  throw error;
                })
              );
            }

            // ✅ INSERT EVENTS DATA
            if (row.event_name) {
              parallelOperations.push(
                t`
                  INSERT INTO event (
                    contact_id, event_name, event_role, event_held_organization, 
                    event_location, event_date, verified, contact_status, created_at, updated_at, created_by
                  ) VALUES (
                    ${contactId}, ${row.event_name}, ${row.event_role || null}, 
                    ${row.event_held_organization || null}, ${row.event_location || null}, 
                    ${row.event_date || null}, ${true}, ${"approved"}, NOW(), NOW(), ${created_by}
                  )
                `.then(() => {
                  console.log(`✅ Inserted event for contact ${contactId}`);
                  return { type: 'event', contactId };
                }).catch((error) => {
                  console.error(`❌ Event insertion failed for contact ${contactId}:`, error);
                  throw error;
                })
              );
            }

            // ✅ EXECUTE ALL PARALLEL OPERATIONS USING PROMISE.ALL
            if (parallelOperations.length > 0) {
              try {
                console.log(`🚀 Starting ${parallelOperations.length} parallel operations for contact ${contactId}`);
                const parallelResults = await Promise.all(parallelOperations);
                console.log(`✅ All ${parallelResults.length} parallel operations completed for contact ${contactId}`);
                
                // Log each completed operation
                parallelResults.forEach((result) => {
                  console.log(`   ✓ ${result.type} operation completed for contact ${result.contactId}`);
                });
              } catch (parallelError) {
                console.error(`❌ Error in parallel operations for contact ${contactId}:`, parallelError);
                throw parallelError; // Re-throw to trigger transaction rollback
              }
            } else {
              console.log(`ℹ️ No additional data to insert for contact ${contactId}`);
            }

            processedContacts.push({
              row: rowNumber,
              contactId: contactId,
              name: row.name,
              email: row.email_address,
            });
            successCount++;

          } catch (error) {
            console.error(`❌ Error processing row ${rowNumber}:`, error);
            errors.push({
              row: rowNumber,
              message: error.message,
              data: row,
            });
          }
        }

        return {
          totalRows: fileRows.length,
          successCount,
          errorCount: errors.length,
          duplicateCount: duplicates.length,
          processedContacts,
          errors: errors.slice(0, 10), // Limit errors in response
          duplicates: duplicates.slice(0, 10), // Limit duplicates in response
        };
      });

      console.log("🎉 CSV Import Transaction Completed Successfully");
      console.log(
        `📊 Final Results: ${result.successCount} success, ${result.errorCount} errors, ${result.duplicateCount} duplicates`
      );

      return res.status(200).json({
        message: "CSV import completed successfully",
        success: true,
        data: result,
      });

    } catch (error) {
      console.error("❌ Database transaction error:", error);
      return res.status(500).json({
        message: "Error processing CSV data",
        success: false,
        error: error.message,
      });
    }

  } catch (error) {
    console.error("❌ CSV import error:", error);

    // Clean up file if it exists
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    return res.status(500).json({
      message: "Server error during CSV import",
      success: false,
      error: error.message,
    });
  }
};

// ✅ EXPORT MULTER UPLOAD MIDDLEWARE
export const uploadCSV = upload.single("csv_file");

// ✅ HELPER FUNCTION TO VALIDATE CSV HEADERS
export const validateCSVHeaders = (headers) => {
  const requiredHeaders = ["name", "phone_number", "email_address"];
  const missingHeaders = requiredHeaders.filter(
    (required) =>
      !headers.some((header) => header.toLowerCase() === required.toLowerCase())
  );

  return {
    isValid: missingHeaders.length === 0,
    missingHeaders,
  };
};

// ✅ HELPER FUNCTION TO SANITIZE CSV DATA
export const sanitizeRowData = (row) => {
  const sanitized = {};

  Object.keys(row).forEach((key) => {
    let value = row[key];

    // Remove extra quotes and trim whitespace
    if (typeof value === "string") {
      value = value.replace(/^["']|["']$/g, "").trim();
    }

    // Convert empty strings to null
    sanitized[key] = value === "" ? null : value;
  });

  return sanitized;
};

console.log("🚀 CSV Import controller loaded with complete multi-table insert support and Promise.all optimization");
