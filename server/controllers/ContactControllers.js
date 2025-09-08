import db from "../src/config/db.js";

// CREATE: A contact and their core information (address, education, experiences, events)
export const CreateContact = async (req, res) => {
  const {
    // --- Contact Fields ---
    name,
    phone_number,
    email_address,
    verified,
    contact_status,
    dob,
    gender,
    nationality,
    marital_status,
    category,
    secondary_email,
    secondary_phone_number,
    created_by,
    emergency_contact_name,
    emergency_contact_relationship,
    emergency_contact_phone_number,
    skills,
    logger,
    linkedin_url,

    // --- SINGLE OBJECTS ---
    address,
    education,

    // --- ARRAYS of OBJECTS ---
    experiences,
    events,
  } = req.body;

  console.log(req.body);

  // --- Core Validation ---
  if (!name || !phone_number || !email_address) {
    return res.status(400).json({
      message:
        "Required fields are missing (name, phone_number, email_address).",
    });
  }

  try {
    const result = await db.begin(async (t) => {
      // 1. Insert the main contact record
      const [contact] = await t`
                INSERT INTO contact (
                    name, phone_number, email_address, dob, gender, nationality, marital_status, category,
                    secondary_email, secondary_phone_number, created_by, emergency_contact_name,
                    emergency_contact_relationship, emergency_contact_phone_number, skills, logger, linkedin_url
                ) VALUES (
                    ${name}, ${phone_number}, ${email_address}, ${
        dob || null
      }, ${gender || null},
                    ${nationality || null}, ${marital_status || null}, ${
        category || null
      }, ${secondary_email || null},
                    ${secondary_phone_number || null}, ${created_by || null}, ${
        emergency_contact_name || null
      },
                    ${emergency_contact_relationship || null}, ${
        emergency_contact_phone_number || null
      }, ${skills || null},
                    ${logger || null}, ${linkedin_url || null}
                ) RETURNING *
            `;
      const contactId = contact.contact_id;
      console.log(contactId);
      let createdAddress = null,
        createdEducation = null;
      let createdExperiences = [],
        createdEvents = [];

      // 2. Insert Address (if provided)
      if (address) {
        [createdAddress] =
          await t`INSERT INTO contact_address (contact_id, street, city, state, country, zipcode) VALUES (${contactId}, ${address.street}, ${address.city}, ${address.state}, ${address.country}, ${address.zipcode}) RETURNING *`;
      }

      // 3. Insert Education (if provided)
      // 3. Insert Education (if provided)
      if (education) {
        [createdEducation] = await t`INSERT INTO contact_education (
            contact_id, 
            pg_course_name, pg_college, pg_university, pg_from_date, pg_to_date,
            ug_course_name, ug_college, ug_university, ug_from_date, ug_to_date
        ) VALUES (
            ${contactId}, 
            ${education.pg_course_name || null}, ${
          education.pg_college || null
        }, ${education.pg_university || null}, ${
          education.pg_from_date || null
        }, ${education.pg_to_date || null},
            ${education.ug_course_name || null}, ${
          education.ug_college || null
        }, ${education.ug_university || null}, ${
          education.ug_from_date || null
        }, ${education.ug_to_date || null}
        ) RETURNING *`;
      }

      // 4. Insert Experiences Array (if provided)
      // 4. Insert Experiences Array (if provided)
      if (experiences && experiences.length > 0) {
        for (const exp of experiences) {
          const [newExp] = await t`INSERT INTO contact_experience (
                contact_id, job_title, company, department, from_date, to_date
            ) VALUES (
                ${contactId}, ${exp.job_title}, ${exp.company}, ${
            exp.department || null
          }, ${exp.from_date}, ${exp.to_date}
            ) RETURNING *`;
          createdExperiences.push(newExp);
        }
      }
      // 5. Insert Events Array (if provided)
      if (events && events.length > 0) {
        for (const event of events) {
          const [newEvent] =
            await t`INSERT INTO event (contact_id, event_name, event_role, event_date, event_held_organization, event_location, verified) VALUES (${contactId}, ${
              event.event_name
            }, ${event.event_role}, ${event.event_date}, ${
              event.event_held_organization
            }, ${event.event_location}, ${
              event.verified || false
            }) RETURNING *`;
          createdEvents.push(newEvent);
        }
      }

      return {
        contact,
        address: createdAddress,
        education: createdEducation,
        experiences: createdExperiences,
        events: createdEvents,
      };
    });

    return res
      .status(201)
      .json({ message: "Contact created successfully!", data: result });
  } catch (err) {
    console.error(err);
    if (err.code === "23505") {
      return res
        .status(409)
        .json({ message: "A contact with this email already exists." });
    }
    return res
      .status(500)
      .json({ message: "Server Error!", error: err.message });
  }
};

// READ: Get all contacts with their related data
export const GetContacts = async (req, res) => {
  try {
    const { userId } = req.params;
    const contacts = await db`
            SELECT
                c.*,
                (SELECT row_to_json(ca) FROM contact_address ca WHERE ca.contact_id = c.contact_id LIMIT 1) as address,
                (SELECT row_to_json(ce) FROM contact_education ce WHERE ce.contact_id = c.contact_id LIMIT 1) as education,
                (SELECT json_agg(cx) FROM contact_experience cx WHERE cx.contact_id = c.contact_id) as experiences,
                (SELECT json_agg(e) FROM event e WHERE e.contact_id = c.contact_id) as events
            FROM
                contact c
            WHERE
                created_by = ${userId}
            ORDER BY
                c.contact_id DESC
        `;

    return res.status(200).json(contacts);
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ message: "Server Error!", error: err.message });
  }
};

export const GetContactsByCategory = async (req, res) => {
  try {
    const { category } = req.query;
    const contacts = await db`
            SELECT
                c.*,
                (SELECT row_to_json(ca) FROM contact_address ca WHERE ca.contact_id = c.contact_id LIMIT 1) as address,
                (SELECT row_to_json(ce) FROM contact_education ce WHERE ce.contact_id = c.contact_id LIMIT 1) as education,
                (SELECT json_agg(cx) FROM contact_experience cx WHERE cx.contact_id = c.contact_id) as experiences,
                (SELECT json_agg(e) FROM event e WHERE e.contact_id = c.contact_id) as events
            FROM
                contact c
            WHERE
                category = ${category}
            ORDER BY
                c.contact_id DESC
        `;

    return res.status(200).json(contacts);
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ message: "Server Error!", error: err.message });
  }
};

export const GetUnVerifiedContacts = async (req, res) => {
  try {
    const { userId } = req.params;

    const contactsWithEvents = await db`
        SELECT c.*, 
              (SELECT row_to_json(ca) FROM contact_address ca WHERE ca.contact_id = c.contact_id) as address,
              (SELECT row_to_json(ce) FROM contact_education ce WHERE ce.contact_id = c.contact_id) as education,
              (SELECT json_agg(cx) FROM contact_experience cx WHERE cx.contact_id = c.contact_id) as experiences,
              json_build_array(row_to_json(e)) as events
        FROM event e 
        INNER JOIN contact c ON e.contact_id = c.contact_id 
        WHERE e.verified = FALSE
          AND NOT EXISTS (
            SELECT 1 FROM user_assignments ua 
            WHERE ua.event_id = e.event_id 
              AND ua.completed = FALSE
          )
        ORDER BY c.contact_id DESC, e.event_id DESC;
        `;

    return res.status(200).json(contactsWithEvents);
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      message: "Server Error!",
      error: err.message,
    });
  }
};

export const UpdateContactAndEvents = async (req, res) => {
  const { id } = req.params;
  const {
    // Contact Fields
    name,
    phone_number,
    email_address,
    // Events Array
    events,
  } = req.body;

  // --- 1. Strict Validation ---
  if (!id) {
    return res
      .status(400)
      .json({ message: "Contact ID is required in the URL." });
  }
  if (!name || !phone_number || !email_address) {
    return res.status(400).json({
      message:
        "Required fields are missing (name, phone_number, email_address).",
    });
  }
  if (!events || !Array.isArray(events) || events.length === 0) {
    return res
      .status(400)
      .json({ message: "The 'events' field must be a non-empty array." });
  }

  // Validate each object in the events array
  for (const event of events) {
    if (
      event.event_id === undefined ||
      event.event_name === undefined ||
      event.event_role === undefined ||
      event.event_date === undefined ||
      event.event_held_organization === undefined ||
      event.event_location === undefined
    ) {
      return res.status(400).json({
        message:
          "Each event object must contain all required fields (event_id, event_name, etc.).",
        invalid_event: event,
      });
    }
  }

  try {
    // --- 2. Use a Transaction ---
    // The `sql.begin` or `sql.transaction` block automatically handles BEGIN, COMMIT, and ROLLBACK.
    const result = await db.begin(async (t) => {
      // --- 3. Update the Contact Record ---
      // The template literal `t` is the transactional version of `sql`
      const contactResults = await t`
                UPDATE contact
                SET
                    name = ${name},
                    phone_number = ${phone_number},
                    email_address = ${email_address}
                WHERE contact_id = ${id}
                RETURNING *
            `;

      // If the query returns no rows, the contact wasn't found.
      if (contactResults.length === 0) {
        // Throwing an error here will automatically trigger a ROLLBACK.
        throw new Error("ContactNotFound");
      }
      const updatedContact = contactResults[0];

      // --- 4. Update Each Event Record ---
      const updatedEvents = [];
      for (const event of events) {
        const eventResults = await t`
                    UPDATE event
                    SET
                        event_name = ${event.event_name},
                        event_role = ${event.event_role},
                        event_date = ${event.event_date},
                        event_held_organization = ${event.event_held_organization},
                        event_location = ${event.event_location}
                    WHERE
                        event_id = ${event.event_id}
                        AND contact_id = ${id} -- Security check: Ensures the event belongs to the contact
                    RETURNING *
                `;

        // If an event update returns no rows, the event_id was invalid or didn't belong to the contact.
        if (eventResults.length === 0) {
          throw new Error("EventNotFound");
        }
        updatedEvents.push(eventResults[0]);
      }

      // Return the final data structure from the transaction block
      return {
        contact: updatedContact,
        events: updatedEvents,
      };
    });

    // --- 5. Send Success Response ---
    return res.status(200).json({
      message: "Contact and events updated successfully!",
      data: result,
    });
  } catch (err) {
    console.error("Update Transaction Failed:", err);

    // --- 6. Handle Specific Errors ---
    if (err.message === "ContactNotFound" || err.message === "EventNotFound") {
      return res.status(404).json({
        message:
          "Contact or one of the specified events not found for the given contact ID.",
      });
    }
    // PostgreSQL unique_violation error code
    if (err.code === "23505") {
      return res
        .status(409)
        .json({ message: "A contact with this email address already exists." });
    }

    // Generic server error for all other cases
    return res
      .status(500)
      .json({ message: "Server Error!", error: err.message });
  }
};

// UPDATE: A contact's core details
export const UpdateContact = async (req, res) => {
    console.log("=== UpdateContact Function Called ===");
    console.log("Contact ID:", req.params.contact_id);
    console.log("Query params:", req.query);
    console.log("Request body:", JSON.stringify(req.body, null, 2));

    const { contact_id } = req.params;
    const {event_verified,contact_status}=req.query;
    const isVerified = event_verified === 'true';
    const {
        // --- Contact Fields ---
        assignment_id,
        name,
        phone_number,
        email_address,
        dob,
        gender,
        nationality,
        marital_status,
        category,
        secondary_email,
        secondary_phone_number,
        emergency_contact_name,
        emergency_contact_relationship,
        emergency_contact_phone_number,
        skills,
        logger,
        linkedin_url,

        // --- SINGLE OBJECTS ---
        address,
        education,

        // --- EVENTS ---
        event_id,
        event_name,
        event_role,
        event_date,
        event_held_organization,
        event_location,
        // --- ARRAYS of OBJECTS ---
        experiences,
    } = req.body;
    try {
        const result = await db.begin(async (t) => {
            // 1. Update the main contact record
            const [updatedContact] = await t`
                UPDATE contact SET
                    name = ${name || null},
                    phone_number = ${phone_number || null},
                    email_address = ${email_address || null},
                    dob = ${dob || null},
                    gender = ${gender || null},
                    nationality = ${nationality || null},
                    marital_status = ${marital_status || null},
                    category = ${category || null},
                    secondary_email = ${secondary_email || null},
                    secondary_phone_number = ${secondary_phone_number || null},
                    emergency_contact_name = ${emergency_contact_name || null},
                    emergency_contact_relationship = ${
                      emergency_contact_relationship || null
                    },
                    emergency_contact_phone_number = ${
                      emergency_contact_phone_number || null
                    },
                    skills = ${skills || null},
                    logger = ${logger || null},
                    linkedin_url = ${linkedin_url || null}
                WHERE contact_id = ${contact_id}
                RETURNING *
            `;

      let updatedAddress = null,
        updatedEducation = null;
      let updatedExperiences = [],
        updatedEvents = [];

      // 2. Update Address (if provided)
      if (address) {
        [updatedAddress] = await t`
                    INSERT INTO contact_address (contact_id, street, city, state, country, zipcode)
                    VALUES (${contact_id}, ${address.street}, ${address.city}, ${address.state}, ${address.country}, ${address.zipcode})
                    ON CONFLICT (contact_id) DO UPDATE SET
                        street = EXCLUDED.street,
                        city = EXCLUDED.city,
                        state = EXCLUDED.state,
                        country = EXCLUDED.country,
                        zipcode = EXCLUDED.zipcode
                    RETURNING *
                `;
      }

      // 3. Update Education (if provided)
      if (education) {
        [updatedEducation] = await t`
                    INSERT INTO contact_education (
                        contact_id, pg_course_name, pg_college, pg_university, pg_from_date, pg_to_date,
                        ug_course_name, ug_college, ug_university, ug_from_date, ug_to_date
                    ) VALUES (
                        ${contact_id},
                        ${education.pg_course_name || null}, ${
          education.pg_college || null
        }, ${education.pg_university || null}, ${
          education.pg_from_date || null
        }, ${education.pg_to_date || null},
                        ${education.ug_course_name || null}, ${
          education.ug_college || null
        }, ${education.ug_university || null}, ${
          education.ug_from_date || null
        }, ${education.ug_to_date || null}
                    )
                    ON CONFLICT (contact_id) DO UPDATE SET
                        pg_course_name = EXCLUDED.pg_course_name,
                        pg_college = EXCLUDED.pg_college,
                        pg_university = EXCLUDED.pg_university,
                        pg_from_date = EXCLUDED.pg_from_date,
                        pg_to_date = EXCLUDED.pg_to_date,
                        ug_course_name = EXCLUDED.ug_course_name,
                        ug_college = EXCLUDED.ug_college,
                        ug_university = EXCLUDED.ug_university,
                        ug_from_date = EXCLUDED.ug_from_date,
                        ug_to_date = EXCLUDED.ug_to_date
                    RETURNING *
                `;
      }

      // 4. Update Experiences Array (if provided)
      if (experiences && experiences.length > 0) {
        // First, delete existing experiences for this contact
        await t`DELETE FROM contact_experience WHERE contact_id = ${contact_id}`;

        // Then, insert the new experiences
        for (const exp of experiences) {
          const [newExp] = await t`
                        INSERT INTO contact_experience (
                            contact_id, job_title, company, department, from_date, to_date, company_skills
                        ) VALUES (
                            ${contact_id}, ${exp.job_title}, ${exp.company}, ${
            exp.department || null
          }, ${exp.from_date}, ${exp.to_date}, ${exp.company_skills || null}
                        ) RETURNING *
                    `;
          updatedExperiences.push(newExp);
        }
      }
            // 5. Update Events Array (if provided)
            if (event_id) {
                console.log(`${event_verified},${contact_status} ${event_name} ${event_role} ${event_held_organization} ${event_location} ${event_id}  ${contact_id}`);
                const [updatedEvent] = await t`
                    UPDATE event SET
                        event_name = ${event_name},
                        event_role = ${event_role},
                        event_date = ${event_date},
                        event_held_organization = ${event_held_organization},
                        event_location = ${event_location},
                        verified = ${isVerified},
                        contact_status=${contact_status}
                    WHERE
                        event_id = ${event_id}
                        AND contact_id = ${contact_id} -- Security check
                    RETURNING *
                `;
        if (updatedEvent) {
          updatedEvents.push(updatedEvent);
        }
      }

      // 6. NEW: Update user_assignments if assignment_id is provided
      if (assignment_id) {
        console.log(assignment_id);
        const [updatedAssignment] = await t`
          UPDATE user_assignments SET
            completed = TRUE
          WHERE id = ${assignment_id}
          RETURNING *
        `;
      }

      return {
        contact: updatedContact,
        address: updatedAddress,
        education: updatedEducation,
        experiences: updatedExperiences,
        events: updatedEvents,
      };
    });

    return res
      .status(200)
      .json({ message: "Contact updated successfully!", data: result });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ message: "Server Error!", error: err.message });
  }
};

// DELETE: A contact and ALL of their associated data (except photos)
export const DeleteContact = async (req, res) => {
  const { id } = req.params;
  const { userType } = req.query;

  try {
    await db.begin(async (t) => {
      // Get contact with status and verified fields
      const [contact] = await t`
                SELECT contact_id, contact_status, verified 
                FROM event 
                WHERE contact_id = ${id}
            `;

      if (!contact) {
        throw new Error("Contact not found");
      }

      // Handle based on user type
      if (userType === "user") {
        // Check if user is allowed to delete based on status and verified
        if (
          (contact.contact_status === "pending" ||
            contact.contact_status === "rejected") &&
          contact.verified === false
        ) {
          // Allow deletion - contact is pending/rejected and not verified
          await performCompleteDeletion(t, id);

          return res.status(200).json({
            message: "Contact and all associated data deleted successfully!",
            action: "deleted",
          });
        } else if (
          contact.contact_status === "approved" &&
          contact.verified === true
        ) {
          // Deny deletion - contact is approved and verified
          return res.status(403).json({
            message:
              "Cannot delete approved and verified contacts. Contact support if needed.",
            action: "denied",
            reason: "Contact is approved and verified",
            contact_status: contact.contact_status,
            verified: contact.verified,
          });
        } else {
          // Handle edge cases (e.g., approved but not verified, etc.)
          return res.status(403).json({
            message:
              "You don't have permission to delete this contact as it is approved.",
            action: "denied",
            reason: "Insufficient permissions for current contact state",
            contact_status: contact.contact_status,
            verified: contact.verified,
          });
        }
      } else if (["cata", "catb", "catc", "admin"].includes(userType)) {
        // Middlemen or Admin - set status as rejected
        await t`
                    UPDATE event 
                    SET contact_status = 'rejected',verified=${true}
                    WHERE contact_id = ${id}
                `;

        return res.status(200).json({
          message: "Contact status updated to rejected successfully!",
          action: "rejected",
          previousStatus: contact.contact_status,
        });
      } else {
        throw new Error("Invalid user type");
      }
    });
  } catch (err) {
    console.error(err);

    if (err.message === "Contact not found") {
      return res.status(404).json({ message: "Contact not found." });
    } else if (err.message === "Invalid user type") {
      return res.status(400).json({ message: "Invalid user type provided." });
    } else {
      return res.status(500).json({
        message: "Server Error!",
        error: err.message,
      });
    }
  }
};

// Helper function for complete deletion
const performCompleteDeletion = async (transaction, contactId) => {
  // Delete from all child tables
  await transaction`DELETE FROM contact_address WHERE contact_id = ${contactId}`;
  await transaction`DELETE FROM contact_education WHERE contact_id = ${contactId}`;
  await transaction`DELETE FROM contact_experience WHERE contact_id = ${contactId}`;
  await transaction`DELETE FROM event WHERE contact_id = ${contactId}`;
  // Finally, delete the parent contact record
  await transaction`DELETE FROM contact WHERE contact_id = ${contactId}`;
};

// ADD EVENT to an existing contact
export const AddEventToExistingContact = async (req, res) => {
  const { contactId } = req.params;
  const {
    eventName,
    eventRole,
    eventDate,
    eventHeldOrganization,
    eventLocation,
    verified,
  } = req.body;

  if (!eventName || !eventRole || !eventDate) {
    return res
      .status(400)
      .json({ message: "Required event fields are missing." });
  }

  try {
    const [newEvent] = await db`
            INSERT INTO event (contact_id, event_name, event_role, event_date, event_held_organization, event_location, verified)
            VALUES (${contactId}, ${eventName}, ${eventRole}, ${eventDate}, ${eventHeldOrganization}, ${eventLocation}, ${
      verified || false
    })
            RETURNING *
        `;
    return res
      .status(201)
      .json({ message: "New event added successfully!", data: newEvent });
  } catch (err) {
    console.error(err);
    if (err.code === "23503")
      return res.status(404).json({ message: "Contact not found." });
    return res
      .status(500)
      .json({ message: "Server Error!", error: err.message });
  }
};

// SEARCH: Find contacts by name, email, phone, or skills
export const SearchContacts = async (req, res) => {
  // The search term is passed as a query parameter, e.g., /search?q=marie
  const { q } = req.query;

  // If no search term is provided, return an empty array.
  if (!q) {
    return res.status(200).json([]);
  }

  // Prepare the search term for a partial, case-insensitive match
  const searchTerm = `%${q}%`;

  try {
    const contacts = await db`
            SELECT
                contact_id,
                name,
                email_address,
                phone_number,
                skills
            FROM
                contact
            WHERE
                name ILIKE ${searchTerm} OR
                email_address ILIKE ${searchTerm} OR
                phone_number ILIKE ${searchTerm} OR
                skills ILIKE ${searchTerm}
            ORDER BY
                name
            LIMIT 10
        `;

    // If no contacts are found, it will correctly return an empty array.
    return res.status(200).json(contacts);
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ message: "Server Error!", error: err.message });
  }
};

export const GetFilteredContacts = async (req, res) => {
  const queryParams = req.query;

  // Convert single values to arrays for consistent handling
  const normalizeParam = (param) => {
    if (!param) return null;
    return Array.isArray(param) ? param : [param];
  };

  const {
    // Basic Contact Filters
    name,
    phone_number,
    email_address,
    created_by,

    // Date Range Filters
    created_from,
    created_to,
    dob_from,
    dob_to,

    // Education Year Filters
    education_from_year,
    education_to_year,

    // Experience Year Filters
    experience_from_year,
    experience_to_year,

    // Event Year Filter
    event_year,

    // Single value filters
    address_zipcode,
    address_street,

    // Pagination
    page = 1,
    limit = 20,

    // Sorting
    sort_by = "name",
    sort_order = "ASC",
  } = queryParams;

  // Normalize array parameters
  const category = normalizeParam(queryParams.category);
  const gender = normalizeParam(queryParams.gender);
  const nationality = normalizeParam(queryParams.nationality);
  const marital_status = normalizeParam(queryParams.marital_status);
  const skills = normalizeParam(queryParams.skills);
  const address_country = normalizeParam(queryParams.address_country);
  const address_state = normalizeParam(queryParams.address_state);
  const address_city = normalizeParam(queryParams.address_city);
  const pg_course_name = normalizeParam(queryParams.pg_course_name);
  const pg_college = normalizeParam(queryParams.pg_college);
  const pg_university = normalizeParam(queryParams.pg_university);
  const ug_course_name = normalizeParam(queryParams.ug_course_name);
  const ug_college = normalizeParam(queryParams.ug_college);
  const ug_university = normalizeParam(queryParams.ug_university);
  const job_title = normalizeParam(queryParams.job_title);
  const company = normalizeParam(queryParams.company);
  const department = normalizeParam(queryParams.department);
  const event_name = normalizeParam(queryParams.event_name);
  const event_role = normalizeParam(queryParams.event_role);
  const event_organization = normalizeParam(queryParams.event_organization);
  const event_location = normalizeParam(queryParams.event_location);

  try {
    // Build dynamic WHERE conditions
    const conditions = [];

    // Basic contact filters
    if (name) conditions.push(`c.name ILIKE '%${name}%'`);
    if (phone_number)
      conditions.push(`c.phone_number ILIKE '%${phone_number}%'`);
    if (email_address)
      conditions.push(`c.email_address ILIKE '%${email_address}%'`);
    if (created_by) conditions.push(`c.created_by = '${created_by}'`);

    // Array-based filters for ENUM fields (exact match)
    if (category) {
      const categoryValues = category.map((cat) => `'${cat}'`).join(",");
      conditions.push(`c.category IN (${categoryValues})`);
    }

    if (gender) {
      const genderValues = gender.map((g) => `'${g}'`).join(",");
      conditions.push(`c.gender IN (${genderValues})`);
    }

    if (marital_status) {
      const maritalValues = marital_status.map((ms) => `'${ms}'`).join(",");
      conditions.push(`c.marital_status IN (${maritalValues})`);
    }

    // Array-based filters for text fields (partial match with OR)
    if (nationality) {
      const nationalityConditions = nationality.map(
        (nat) => `c.nationality ILIKE '%${nat}%'`
      );
      conditions.push(`(${nationalityConditions.join(" OR ")})`);
    }

    if (skills) {
      const skillsConditions = skills.map(
        (skill) => `c.skills ILIKE '%${skill}%'`
      );
      conditions.push(`(${skillsConditions.join(" OR ")})`);
    }

    // Address filters
    if (address_city) {
      const cityConditions = address_city.map(
        (city) => `ca.city ILIKE '%${city}%'`
      );
      conditions.push(`(${cityConditions.join(" OR ")})`);
    }

    if (address_state) {
      const stateConditions = address_state.map(
        (state) => `ca.state ILIKE '%${state}%'`
      );
      conditions.push(`(${stateConditions.join(" OR ")})`);
    }

    if (address_country) {
      const countryConditions = address_country.map(
        (country) => `ca.country ILIKE '%${country}%'`
      );
      conditions.push(`(${countryConditions.join(" OR ")})`);
    }

    if (address_zipcode) conditions.push(`ca.zipcode = '${address_zipcode}'`);
    if (address_street)
      conditions.push(`ca.street ILIKE '%${address_street}%'`);

    // Education filters
    if (pg_course_name) {
      const pgCourseConditions = pg_course_name.map(
        (course) => `ce.pg_course_name ILIKE '%${course}%'`
      );
      conditions.push(`(${pgCourseConditions.join(" OR ")})`);
    }

    if (pg_college) {
      const pgCollegeConditions = pg_college.map(
        (college) => `ce.pg_college ILIKE '%${college}%'`
      );
      conditions.push(`(${pgCollegeConditions.join(" OR ")})`);
    }

    if (pg_university) {
      const pgUniversityConditions = pg_university.map(
        (uni) => `ce.pg_university ILIKE '%${uni}%'`
      );
      conditions.push(`(${pgUniversityConditions.join(" OR ")})`);
    }

    if (ug_course_name) {
      const ugCourseConditions = ug_course_name.map(
        (course) => `ce.ug_course_name ILIKE '%${course}%'`
      );
      conditions.push(`(${ugCourseConditions.join(" OR ")})`);
    }

    if (ug_college) {
      const ugCollegeConditions = ug_college.map(
        (college) => `ce.ug_college ILIKE '%${college}%'`
      );
      conditions.push(`(${ugCollegeConditions.join(" OR ")})`);
    }

    if (ug_university) {
      const ugUniversityConditions = ug_university.map(
        (uni) => `ce.ug_university ILIKE '%${uni}%'`
      );
      conditions.push(`(${ugUniversityConditions.join(" OR ")})`);
    }

    // Experience filters
    if (job_title) {
      const jobTitleConditions = job_title.map(
        (jt) => `exp.job_title ILIKE '%${jt}%'`
      );
      conditions.push(`(${jobTitleConditions.join(" OR ")})`);
    }

    if (company) {
      const companyConditions = company.map(
        (comp) => `exp.company ILIKE '%${comp}%'`
      );
      conditions.push(`(${companyConditions.join(" OR ")})`);
    }

    if (department) {
      const departmentConditions = department.map(
        (dept) => `exp.department ILIKE '%${dept}%'`
      );
      conditions.push(`(${departmentConditions.join(" OR ")})`);
    }

    // Event filters
    if (event_name) {
      const eventNameConditions = event_name.map(
        (name) => `e.event_name ILIKE '%${name}%'`
      );
      conditions.push(`(${eventNameConditions.join(" OR ")})`);
    }

    if (event_role) {
      const eventRoleConditions = event_role.map(
        (role) => `e.event_role ILIKE '%${role}%'`
      );
      conditions.push(`(${eventRoleConditions.join(" OR ")})`);
    }

    if (event_organization) {
      const eventOrgConditions = event_organization.map(
        (org) => `e.event_held_organization ILIKE '%${org}%'`
      );
      conditions.push(`(${eventOrgConditions.join(" OR ")})`);
    }

    if (event_location) {
      const eventLocationConditions = event_location.map(
        (loc) => `e.event_location ILIKE '%${loc}%'`
      );
      conditions.push(`(${eventLocationConditions.join(" OR ")})`);
    }

    // Date filters
    if (created_from) conditions.push(`c.created_at >= '${created_from}'`);
    if (created_to) conditions.push(`c.created_at <= '${created_to}'`);
    if (dob_from) conditions.push(`c.dob >= '${dob_from}'`);
    if (dob_to) conditions.push(`c.dob <= '${dob_to}'`);

    // Year-based filters
    if (education_from_year)
      conditions.push(
        `(EXTRACT(YEAR FROM ce.pg_from_date) >= ${education_from_year} OR EXTRACT(YEAR FROM ce.ug_from_date) >= ${education_from_year})`
      );
    if (education_to_year)
      conditions.push(
        `(EXTRACT(YEAR FROM ce.pg_to_date) <= ${education_to_year} OR EXTRACT(YEAR FROM ce.ug_to_date) <= ${education_to_year})`
      );
    if (experience_from_year)
      conditions.push(
        `EXTRACT(YEAR FROM exp.from_date) >= ${experience_from_year}`
      );
    if (experience_to_year)
      conditions.push(
        `EXTRACT(YEAR FROM exp.to_date) <= ${experience_to_year}`
      );
    if (event_year)
      conditions.push(`EXTRACT(YEAR FROM e.event_date) = ${event_year}`);

    const whereClause =
      conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
    console.log("WHERE clause:", whereClause);

    const offset = (page - 1) * limit;
    const validSortFields = [
      "name",
      "email_address",
      "phone_number",
      "created_at",
      "dob",
    ];
    const sortField = validSortFields.includes(sort_by) ? sort_by : "name";
    const sortDirection = sort_order.toUpperCase() === "DESC" ? "DESC" : "ASC";

    // Main query using postgres.js template literals
    const contacts = await db`
            SELECT DISTINCT 
                c.*,
                ca.street, ca.city, ca.state, ca.country, ca.zipcode,
                ce.pg_course_name, ce.pg_college, ce.pg_university, 
                ce.pg_from_date, ce.pg_to_date,
                ce.ug_course_name, ce.ug_college, ce.ug_university, 
                ce.ug_from_date, ce.ug_to_date
            FROM contact c
            LEFT JOIN contact_address ca ON c.contact_id = ca.contact_id
            LEFT JOIN contact_education ce ON c.contact_id = ce.contact_id
            LEFT JOIN contact_experience exp ON c.contact_id = exp.contact_id
            LEFT JOIN event e ON c.contact_id = e.contact_id
            ${whereClause ? db.unsafe(whereClause) : db``}
            ORDER BY ${db.unsafe(`c.${sortField} ${sortDirection}`)}
            LIMIT ${limit} OFFSET ${offset}
        `;

    // Get total count for pagination
    const [countResult] = await db`
            SELECT COUNT(DISTINCT c.contact_id) as total
            FROM contact c
            LEFT JOIN contact_address ca ON c.contact_id = ca.contact_id
            LEFT JOIN contact_education ce ON c.contact_id = ce.contact_id
            LEFT JOIN contact_experience exp ON c.contact_id = exp.contact_id
            LEFT JOIN event e ON c.contact_id = e.contact_id
            ${whereClause ? db.unsafe(whereClause) : db``}
        `;

    const totalContacts = parseInt(countResult.total);
    const totalPages = Math.ceil(totalContacts / limit);

    // Get detailed data for each contact
    const contactsWithDetails = await Promise.all(
      contacts.map(async (contact) => {
        // Get all experiences for this contact
        const experiences = await db`
                    SELECT * FROM contact_experience 
                    WHERE contact_id = ${contact.contact_id} 
                    ORDER BY from_date DESC
                `;

        // Get all events for this contact
        const events = await db`
                    SELECT * FROM event 
                    WHERE contact_id = ${contact.contact_id} 
                    ORDER BY event_date DESC
                `;

        return {
          ...contact,
          experiences: experiences,
          events: events,
        };
      })
    );

    return res.status(200).json({
      message: "Contacts retrieved successfully!",
      data: {
        contacts: contactsWithDetails,
        pagination: {
          current_page: parseInt(page),
          total_pages: totalPages,
          total_contacts: totalContacts,
          limit: parseInt(limit),
          has_next: page < totalPages,
          has_previous: page > 1,
        },
      },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      message: "Server Error!",
      error: err.message,
    });
  }
};

export const GetFilterOptions = async (req, res) => {
  try {
    const { category } = req.query; // Get category from query params

    // Base WHERE clause for category filtering
    const categoryFilter = category ? `WHERE category = '${category}'` : "";
    const categoryJoinFilter = category ? `AND c.category = '${category}'` : "";

    // Get all filter options with counts filtered by category
    const genders = await db`
            SELECT DISTINCT gender as value, COUNT(*)::text as count     
            FROM contact 
            WHERE gender IS NOT NULL ${
              category ? db` AND category = ${category}` : db``
            }
            GROUP BY gender ORDER BY count DESC
        `;

    const categories = await db`
            SELECT DISTINCT category as value, COUNT(*)::text as count 
            FROM contact WHERE category IS NOT NULL 
            GROUP BY category ORDER BY count DESC
        `;

    const nationalities = await db`
            SELECT DISTINCT nationality as value, COUNT(*)::text as count 
            FROM contact 
            WHERE nationality IS NOT NULL ${
              category ? db` AND category = ${category}` : db``
            }
            GROUP BY nationality ORDER BY count DESC
        `;

    const maritalStatuses = await db`
            SELECT DISTINCT marital_status as value, COUNT(*)::text as count 
            FROM contact 
            WHERE marital_status IS NOT NULL ${
              category ? db` AND category = ${category}` : db``
            }
            GROUP BY marital_status ORDER BY count DESC
        `;

    const countries = await db`
            SELECT DISTINCT ca.country as value, COUNT(DISTINCT c.contact_id)::text as count
            FROM contact c JOIN contact_address ca ON c.contact_id = ca.contact_id
            WHERE ca.country IS NOT NULL ${
              category ? db` AND c.category = ${category}` : db``
            }
            GROUP BY ca.country ORDER BY count DESC
        `;

    const states = await db`
            SELECT DISTINCT ca.state as value, COUNT(DISTINCT c.contact_id)::text as count
            FROM contact c JOIN contact_address ca ON c.contact_id = ca.contact_id
            WHERE ca.state IS NOT NULL ${
              category ? db` AND c.category = ${category}` : db``
            }
            GROUP BY ca.state ORDER BY count DESC
        `;

    const cities = await db`
            SELECT DISTINCT ca.city as value, COUNT(DISTINCT c.contact_id)::text as count
            FROM contact c JOIN contact_address ca ON c.contact_id = ca.contact_id
            WHERE ca.city IS NOT NULL ${
              category ? db` AND c.category = ${category}` : db``
            }
            GROUP BY ca.city ORDER BY count DESC
        `;

    const companies = await db`
            SELECT DISTINCT exp.company as value, COUNT(DISTINCT c.contact_id)::text as count
            FROM contact c JOIN contact_experience exp ON c.contact_id = exp.contact_id
            WHERE exp.company IS NOT NULL ${
              category ? db` AND c.category = ${category}` : db``
            }
            GROUP BY exp.company ORDER BY count DESC
        `;

    const jobTitles = await db`
            SELECT DISTINCT exp.job_title as value, COUNT(DISTINCT c.contact_id)::text as count
            FROM contact c JOIN contact_experience exp ON c.contact_id = exp.contact_id
            WHERE exp.job_title IS NOT NULL ${
              category ? db` AND c.category = ${category}` : db``
            }
            GROUP BY exp.job_title ORDER BY count DESC
        `;

    const pgCourses = await db`
            SELECT DISTINCT ce.pg_course_name as value, COUNT(DISTINCT c.contact_id)::text as count
            FROM contact c JOIN contact_education ce ON c.contact_id = ce.contact_id
            WHERE ce.pg_course_name IS NOT NULL ${
              category ? db` AND c.category = ${category}` : db``
            }
            GROUP BY ce.pg_course_name ORDER BY count DESC
        `;

    const ugCourses = await db`
            SELECT DISTINCT ce.ug_course_name as value, COUNT(DISTINCT c.contact_id)::text as count
            FROM contact c JOIN contact_education ce ON c.contact_id = ce.contact_id
            WHERE ce.ug_course_name IS NOT NULL ${
              category ? db` AND c.category = ${category}` : db``
            }
            GROUP BY ce.ug_course_name ORDER BY count DESC
        `;

    // Parse skills if stored as comma-separated values, filtered by category
    const skillsData = await db`
            SELECT skills FROM contact 
            WHERE skills IS NOT NULL AND skills != '' ${
              category ? db` AND category = ${category}` : db``
            }
        `;

    const skillCounts = {};
    skillsData.forEach((row) => {
      if (row.skills) {
        const skills = row.skills
          .split(",")
          .map((s) => s.trim())
          .filter((s) => s);
        skills.forEach((skill) => {
          skillCounts[skill] = (skillCounts[skill] || 0) + 1;
        });
      }
    });

    const skills = Object.entries(skillCounts)
      .map(([skill, count]) => ({ value: skill, count: count.toString() }))
      .sort((a, b) => parseInt(b.count) - parseInt(a.count));

    return res.json({
      genders,
      categories,
      nationalities,
      marital_statuses: maritalStatuses,
      countries,
      states,
      cities,
      companies,
      job_titles: jobTitles,
      pg_courses: pgCourses,
      ug_courses: ugCourses,
      skills,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
};
