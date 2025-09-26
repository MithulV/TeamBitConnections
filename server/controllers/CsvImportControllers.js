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

// Main CSV Import Function with Event-Specific Validation
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

    // Process CSV data with database transaction - ENHANCED WITH EVENT VALIDATION
    try {
      const result = await db.begin(async (t) => {
        const processedContacts = [];
        const errors = [];
        let successCount = 0;
        let updatedCount = 0;
        let insertedCount = 0;
        let eventsCreated = 0;
        let eventsUpdated = 0;

        for (let i = 0; i < fileRows.length; i++) {
          const row = fileRows[i];
          const rowNumber = i + 2; // +2 because arrays start at 0 and CSV header is row 1

          try {
            console.log(`Processing row ${rowNumber}:`, {
              name: row.name,
              phone: row.phone || row.phone_number,
              email: row.email || row.email_address,
              event: row.event_name,
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

              if (inputGender === "m" || inputGender === "male") {
                validGender = "Male";
              } else if (inputGender === "f" || inputGender === "female") {
                validGender = "Female";
              } else {
                console.log(
                  `ℹ️ Gender value "${row.gender}" in row ${rowNumber} set to null (only Male/Female accepted)`
                );
                validGender = null;
              }
            }
            row.gender = validGender;

            // ✅ VALIDATE FIELD LENGTHS TO PREVENT VARCHAR ERRORS
            const fieldLimits = {
              phone_number: 20,
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

            // ✅ ENHANCED CONTACT DETECTION WITH EVENT VALIDATION
            let existingContact = null;
            let contactId = null;
            let wasContactInserted = false;
            let existingEventForContact = null;

            try {
              // 🔍 STEP 1: Check for existing contact by email address
              const existingContactResult = await t`
                SELECT contact_id, name FROM contact 
                WHERE email_address = ${row.email_address}
                LIMIT 1
              `;

              if (existingContactResult.length > 0) {
                // ✅ CONTACT EXISTS - Now check if this specific event exists for this contact
                existingContact = existingContactResult[0];
                contactId = existingContact.contact_id;

                console.log(`🔍 Found existing contact ${contactId} for email ${row.email_address}`);

                // 🔍 STEP 2: Check if the specific event exists for this contact
                if (row.event_name && row.event_name.trim() !== "") {
                  const existingEventResult = await t`
                    SELECT event_id, event_name, event_role, event_held_organization, event_location, event_date
                    FROM event 
                    WHERE contact_id = ${contactId} AND event_name = ${row.event_name.trim()}
                    LIMIT 1
                  `;

                  if (existingEventResult.length > 0) {
                    existingEventForContact = existingEventResult[0];
                    console.log(`🔍 Found existing event "${row.event_name}" for contact ${contactId}`);
                  } else {
                    console.log(`ℹ️ Event "${row.event_name}" does not exist for contact ${contactId}, will create new event`);
                  }
                }

                // ✅ UPDATE EXISTING CONTACT (only basic contact info, not event-specific)
                const [updatedContact] = await t`
                  UPDATE contact SET
                    name = ${row.name},
                    phone_number = ${row.phone_number},
                    dob = ${row.dob || null},
                    gender = ${row.gender || null},
                    nationality = ${row.nationality || null},
                    marital_status = ${row.marital_status || null},
                    category = ${row.category?.toUpperCase() || null},
                    secondary_email = ${row.secondary_email || null},
                    secondary_phone_number = ${row.secondary_phone_number || null},
                    emergency_contact_name = ${row.emergency_contact_name || null},
                    emergency_contact_relationship = ${row.emergency_contact_relationship || null},
                    emergency_contact_phone_number = ${row.emergency_contact_phone_number || null},
                    skills = ${row.skills || null},
                    linkedin_url = ${row.linkedin_url || null},
                    updated_at = NOW()
                  WHERE contact_id = ${contactId}
                  RETURNING contact_id, name
                `;

                console.log(`✅ Updated existing contact ${contactId}: ${row.name}`);
                updatedCount++;
                wasContactInserted = false;

              } else {
                // ✅ INSERT NEW CONTACT
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
                  ) 
                  RETURNING contact_id, name
                `;

                contactId = newContact.contact_id;
                console.log(`✅ Inserted new contact ${contactId}: ${row.name}`);
                insertedCount++;
                wasContactInserted = true;
              }

            } catch (contactError) {
              console.error(`❌ Error in contact upsert for row ${rowNumber}:`, contactError);
              throw contactError;
            }

            // ✅ ADD CONTACT MODIFICATION LOGGING
            try {
              const actionType = wasContactInserted ? "CREATE" : "UPDATE";
              await logContactModification(db, contactId, created_by, actionType, t);
              console.log(`✅ Contact modification logged for contact ${contactId} (${actionType})`);
            } catch (err) {
              console.warn(
                "Contact modification logging failed, but continuing operation:",
                err.message
              );
            }

            // ✅ PARALLEL EXECUTION OF INDEPENDENT OPERATIONS WITH ENHANCED EVENT HANDLING
            const parallelOperations = [];

            // ✅ HANDLE ADDRESS DATA WITH MANUAL UPSERT
            if (row.street || row.city || row.state || row.country || row.zipcode) {
              parallelOperations.push(
                (async () => {
                  try {
                    const existingAddress = await t`
                      SELECT contact_id FROM contact_address 
                      WHERE contact_id = ${contactId}
                      LIMIT 1
                    `;

                    if (existingAddress.length > 0) {
                      await t`
                        UPDATE contact_address SET
                          street = ${row.street || null},
                          city = ${row.city || null},
                          state = ${row.state || null},
                          country = ${row.country || null},
                          zipcode = ${row.zipcode || null}
                        WHERE contact_id = ${contactId}
                      `;
                      console.log(`✅ Updated address for contact ${contactId}`);
                    } else {
                      await t`
                        INSERT INTO contact_address (
                          contact_id, street, city, state, country, zipcode, created_at
                        ) VALUES (
                          ${contactId}, ${row.street || null}, ${row.city || null}, 
                          ${row.state || null}, ${row.country || null}, ${row.zipcode || null}, 
                          NOW()
                        )
                      `;
                      console.log(`✅ Inserted address for contact ${contactId}`);
                    }
                    return { type: 'address', contactId };
                  } catch (error) {
                    console.error(`❌ Address operation failed for contact ${contactId}:`, error);
                    throw error;
                  }
                })()
              );
            }

            // ✅ HANDLE EDUCATION DATA WITH MANUAL UPSERT
            if (row.pg_course_name || row.pg_college_name || row.ug_course_name || row.ug_college_name) {
              parallelOperations.push(
                (async () => {
                  try {
                    const existingEducation = await t`
                      SELECT contact_id FROM contact_education 
                      WHERE contact_id = ${contactId}
                      LIMIT 1
                    `;

                    if (existingEducation.length > 0) {
                      await t`
                        UPDATE contact_education SET
                          pg_course_name = ${row.pg_course_name || null},
                          pg_college = ${row.pg_college_name || null},
                          pg_university = ${row.pg_university_type || null},
                          pg_from_date = ${row.pg_start_date || null},
                          pg_to_date = ${row.pg_end_date || null},
                          ug_course_name = ${row.ug_course_name || null},
                          ug_college = ${row.ug_college_name || null},
                          ug_university = ${row.ug_university_type || null},
                          ug_from_date = ${row.ug_start_date || null},
                          ug_to_date = ${row.ug_end_date || null}
                        WHERE contact_id = ${contactId}
                      `;
                      console.log(`✅ Updated education for contact ${contactId}`);
                    } else {
                      await t`
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
                      `;
                      console.log(`✅ Inserted education for contact ${contactId}`);
                    }
                    return { type: 'education', contactId };
                  } catch (error) {
                    console.error(`❌ Education operation failed for contact ${contactId}:`, error);
                    throw error;
                  }
                })()
              );
            }

            // ✅ HANDLE EXPERIENCE DATA WITH MANUAL UPSERT
            if (row.job_title || row.company_name) {
              parallelOperations.push(
                (async () => {
                  try {
                    const existingExperience = await t`
                      SELECT contact_id FROM contact_experience 
                      WHERE contact_id = ${contactId}
                      LIMIT 1
                    `;

                    if (existingExperience.length > 0) {
                      await t`
                        UPDATE contact_experience SET
                          job_title = ${row.job_title || null},
                          company = ${row.company_name || null},
                          department = ${row.department_type || null},
                          from_date = ${row.from_date || null},
                          to_date = ${row.to_date || null}
                        WHERE contact_id = ${contactId}
                      `;
                      console.log(`✅ Updated experience for contact ${contactId}`);
                    } else {
                      await t`
                        INSERT INTO contact_experience (
                          contact_id, job_title, company, department, 
                          from_date, to_date, created_at
                        ) VALUES (
                          ${contactId}, ${row.job_title || null}, ${row.company_name || null}, 
                          ${row.department_type || null}, ${row.from_date || null}, 
                          ${row.to_date || null}, NOW()
                        )
                      `;
                      console.log(`✅ Inserted experience for contact ${contactId}`);
                    }
                    return { type: 'experience', contactId };
                  } catch (error) {
                    console.error(`❌ Experience operation failed for contact ${contactId}:`, error);
                    throw error;
                  }
                })()
              );
            }

            // ✅ ENHANCED EVENT HANDLING WITH PROPER VALIDATION
            if (row.event_name && row.event_name.trim() !== "") {
              parallelOperations.push(
                (async () => {
                  try {
                    let eventWasUpdated = false;

                    if (existingEventForContact) {
                      // ✅ UPDATE EXISTING EVENT (same contact + same event name)
                      const [updatedEvent] = await t`
                        UPDATE event SET
                          event_role = ${row.event_role || null},
                          event_held_organization = ${row.event_held_organization || null},
                          event_location = ${row.event_location || null},
                          event_date = ${row.event_date || null},
                          updated_at = NOW()
                        WHERE contact_id = ${contactId} AND event_name = ${row.event_name.trim()}
                        RETURNING event_id, event_name
                      `;
                      
                      console.log(`✅ Updated existing event "${row.event_name}" for contact ${contactId}`);
                      eventWasUpdated = true;
                      eventsUpdated++;

                    } else {
                      // ✅ CREATE NEW EVENT (either new contact OR existing contact with new event)
                      const [newEvent] = await t`
                        INSERT INTO event (
                          contact_id, event_name, event_role, event_held_organization, 
                          event_location, event_date, verified, contact_status, created_at, updated_at, created_by
                        ) VALUES (
                          ${contactId}, ${row.event_name.trim()}, ${row.event_role || null}, 
                          ${row.event_held_organization || null}, ${row.event_location || null}, 
                          ${row.event_date || null}, ${true}, ${"approved"}, NOW(), NOW(), ${created_by}
                        )
                        RETURNING event_id, event_name
                      `;
                      
                      console.log(`✅ Created new event "${row.event_name}" for contact ${contactId}`);
                      eventWasUpdated = false;
                      eventsCreated++;
                    }

                    return { 
                      type: 'event', 
                      contactId, 
                      eventName: row.event_name,
                      operation: eventWasUpdated ? 'updated' : 'created'
                    };
                  } catch (error) {
                    console.error(`❌ Event operation failed for contact ${contactId}:`, error);
                    throw error;
                  }
                })()
              );
            }

            // ✅ EXECUTE ALL PARALLEL OPERATIONS
            if (parallelOperations.length > 0) {
              try {
                console.log(`🚀 Starting ${parallelOperations.length} parallel operations for contact ${contactId}`);
                const parallelResults = await Promise.all(parallelOperations);
                console.log(`✅ All ${parallelResults.length} parallel operations completed for contact ${contactId}`);
                
                // Log each completed operation with details
                parallelResults.forEach((result) => {
                  if (result.type === 'event') {
                    console.log(`   ✓ ${result.type} operation: ${result.operation} event "${result.eventName}" for contact ${result.contactId}`);
                  } else {
                    console.log(`   ✓ ${result.type} operation completed for contact ${result.contactId}`);
                  }
                });
              } catch (parallelError) {
                console.error(`❌ Error in parallel operations for contact ${contactId}:`, parallelError);
                throw parallelError;
              }
            } else {
              console.log(`ℹ️ No additional data to process for contact ${contactId}`);
            }

            // ✅ ADD TO PROCESSED CONTACTS WITH EVENT INFO
            const eventInfo = row.event_name ? 
              (existingEventForContact ? 'event updated' : 'event created') : 
              'no event data';

            processedContacts.push({
              row: rowNumber,
              contactId: contactId,
              name: row.name,
              email: row.email_address,
              event_name: row.event_name || null,
              contact_operation: wasContactInserted ? 'inserted' : 'updated',
              event_operation: eventInfo
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
          insertedCount,
          updatedCount,
          eventsCreated,
          eventsUpdated,
          errorCount: errors.length,
          processedContacts,
          errors: errors.slice(0, 10),
        };
      });

      console.log("🎉 CSV Import Transaction Completed Successfully");
      console.log(`📊 Final Results: 
        - ${result.successCount} total success 
        - Contacts: ${result.insertedCount} inserted, ${result.updatedCount} updated
        - Events: ${result.eventsCreated} created, ${result.eventsUpdated} updated
        - ${result.errorCount} errors`
      );

      return res.status(200).json({
        message: "CSV import completed successfully with enhanced event validation",
        success: true,
        data: result,
        summary: {
          contacts: {
            inserted: result.insertedCount,
            updated: result.updatedCount
          },
          events: {
            created: result.eventsCreated,
            updated: result.eventsUpdated
          },
          errors: result.errorCount
        }
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

// ✅ HELPER FUNCTION TO CHECK EVENT CONFLICTS
export const checkEventConflicts = async (t, contactId, eventName) => {
  try {
    const existingEvents = await t`
      SELECT event_id, event_name, event_date, event_location
      FROM event 
      WHERE contact_id = ${contactId}
      ORDER BY created_at DESC
    `;

    const conflictingEvent = existingEvents.find(
      event => event.event_name.toLowerCase() === eventName.toLowerCase()
    );

    return {
      hasConflict: !!conflictingEvent,
      conflictingEvent: conflictingEvent,
      allEvents: existingEvents
    };
  } catch (error) {
    console.error("Error checking event conflicts:", error);
    return {
      hasConflict: false,
      conflictingEvent: null,
      allEvents: []
    };
  }
};

console.log("🚀 CSV Import controller loaded with enhanced event validation (contact-event relationship properly handled)");
