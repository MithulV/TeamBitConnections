import db from "../src/config/db.js";
import { logContactModification } from "./ModificationHistoryControllers.js";

// Helper function to handle undefined and empty string values
const sanitizeValue = (value) => {
  return value === undefined || value === "" || value === null ? null : value;
};

// In admin
export const GetAllContact = async (req, res) => {
  const { limit } = req.query;
  const limitValue = limit ? parseInt(limit, 10) : null;
  let query;
  try {
    if (limitValue && limitValue > 0) {
      query = db`
        SELECT 
          c.contact_id,
          c.created_by,
          l.email as added_by,
          c.created_at,
          c.name,
          c.phone_number,
          c.secondary_phone_number,
          c.email_address,
          c.secondary_email,
          c.skills,
          c.linkedin_url,
          c.dob,
          c.gender,
          c.nationality,
          c.marital_status,
          c.category,
          c.emergency_contact_name,
          c.emergency_contact_relationship,
          c.logger,
          c.updated_at,

          ca.street,
          ca.city,
          ca.state,
          ca.country,
          ca.zipcode,
          ca.created_at as address_created_at,
          ca.updated_at as address_updated_at,
          
          STRING_AGG(DISTINCT ce.pg_course_name, '; ') as pg_course_name,
          STRING_AGG(DISTINCT ce.pg_college, '; ') as pg_college_name,
          STRING_AGG(DISTINCT ce.pg_university, '; ') as pg_university_type,
          STRING_AGG(DISTINCT ce.pg_from_date::text, '; ') as pg_start_date,
          STRING_AGG(DISTINCT ce.pg_to_date::text, '; ') as pg_end_date,
          STRING_AGG(DISTINCT ce.ug_course_name, '; ') as ug_course_name,
          STRING_AGG(DISTINCT ce.ug_college, '; ') as ug_college_name,
          STRING_AGG(DISTINCT ce.ug_university, '; ') as ug_university_type,
          STRING_AGG(DISTINCT ce.ug_from_date::text, '; ') as ug_start_date,
          STRING_AGG(DISTINCT ce.ug_to_date::text, '; ') as ug_end_date,
          STRING_AGG(DISTINCT ce.created_at::text, '; ') as education_created_at,
          STRING_AGG(DISTINCT ce.updated_at::text, '; ') as education_updated_at,
          
          STRING_AGG(DISTINCT cex.job_title, '; ') as job_title,
          STRING_AGG(DISTINCT cex.company, '; ') as company_name,
          STRING_AGG(DISTINCT cex.department, '; ') as department_type,
          STRING_AGG(DISTINCT cex.from_date::text, '; ') as from_date,
          STRING_AGG(DISTINCT cex.to_date::text, '; ') as to_date,
          STRING_AGG(DISTINCT cex.created_at::text, '; ') as experience_created_at,
          STRING_AGG(DISTINCT cex.updated_at::text, '; ') as experience_updated_at,
          
          STRING_AGG(DISTINCT e.event_name, '; ') as event_name,
          STRING_AGG(DISTINCT e.event_role, '; ') as event_role,
          STRING_AGG(DISTINCT e.event_held_organization, '; ') as event_held_organization,
          STRING_AGG(DISTINCT e.event_location, '; ') as event_location,
          BOOL_OR(e.verified) as verified,
          STRING_AGG(DISTINCT e.contact_status, '; ') as contact_status,
          STRING_AGG(DISTINCT e.created_at::text, '; ') as event_created_at,
          STRING_AGG(DISTINCT e.updated_at::text, '; ') as event_details_updated_at
          
        FROM contact c
        LEFT JOIN contact_address ca ON c.contact_id = ca.contact_id
        LEFT JOIN contact_education ce ON c.contact_id = ce.contact_id
        LEFT JOIN contact_experience cex ON c.contact_id = cex.contact_id
        LEFT JOIN event e ON c.contact_id = e.contact_id
        LEFT JOIN login l ON e.created_by = l.id
        GROUP BY 
          c.contact_id, c.created_by, l.email, c.created_at, c.name,
          c.phone_number, c.secondary_phone_number, c.email_address,
          c.secondary_email, c.skills, c.linkedin_url, c.dob, c.gender, 
          c.nationality, c.marital_status, c.category, c.emergency_contact_name, 
          c.emergency_contact_relationship, c.logger, c.updated_at,
          ca.street, ca.city, ca.state, ca.country, ca.zipcode, 
          ca.created_at, ca.updated_at
        ORDER BY c.created_at DESC
        LIMIT ${limitValue}
      `;
    } else {
      query = db`
        SELECT 
          c.contact_id,
          c.created_by,
          l.email as added_by,
          c.created_at,
          c.name,
          c.phone_number,
          c.secondary_phone_number,
          c.email_address,
          c.secondary_email,
          c.skills,
          c.linkedin_url,
          c.dob,
          c.gender,
          c.nationality,
          c.marital_status,
          c.category,
          c.emergency_contact_name,
          c.emergency_contact_relationship,
          c.logger,
          c.updated_at,
          
          ca.street,
          ca.city,
          ca.state,
          ca.country,
          ca.zipcode,
          ca.created_at as address_created_at,
          ca.updated_at as address_updated_at,
          
          STRING_AGG(DISTINCT ce.pg_course_name, '; ') as pg_course_name,
          STRING_AGG(DISTINCT ce.pg_college, '; ') as pg_college_name,
          STRING_AGG(DISTINCT ce.pg_university, '; ') as pg_university_type,
          STRING_AGG(DISTINCT ce.pg_from_date::text, '; ') as pg_start_date,
          STRING_AGG(DISTINCT ce.pg_to_date::text, '; ') as pg_end_date,
          STRING_AGG(DISTINCT ce.ug_course_name, '; ') as ug_course_name,
          STRING_AGG(DISTINCT ce.ug_college, '; ') as ug_college_name,
          STRING_AGG(DISTINCT ce.ug_university, '; ') as ug_university_type,
          STRING_AGG(DISTINCT ce.ug_from_date::text, '; ') as ug_start_date,
          STRING_AGG(DISTINCT ce.ug_to_date::text, '; ') as ug_end_date,
          STRING_AGG(DISTINCT ce.created_at::text, '; ') as education_created_at,
          STRING_AGG(DISTINCT ce.updated_at::text, '; ') as education_updated_at,
          
          STRING_AGG(DISTINCT cex.job_title, '; ') as job_title,
          STRING_AGG(DISTINCT cex.company, '; ') as company_name,
          STRING_AGG(DISTINCT cex.department, '; ') as department_type,
          STRING_AGG(DISTINCT cex.from_date::text, '; ') as from_date,
          STRING_AGG(DISTINCT cex.to_date::text, '; ') as to_date,
          STRING_AGG(DISTINCT cex.created_at::text, '; ') as experience_created_at,
          STRING_AGG(DISTINCT cex.updated_at::text, '; ') as experience_updated_at,
          
          STRING_AGG(DISTINCT e.event_name, '; ') as event_name,
          STRING_AGG(DISTINCT e.event_role, '; ') as event_role,
          STRING_AGG(DISTINCT e.event_held_organization, '; ') as event_held_organization,
          STRING_AGG(DISTINCT e.event_location, '; ') as event_location,
          BOOL_OR(e.verified) as verified,
          STRING_AGG(DISTINCT e.contact_status, '; ') as contact_status,
          STRING_AGG(DISTINCT e.created_at::text, '; ') as event_created_at,
          STRING_AGG(DISTINCT e.updated_at::text, '; ') as event_details_updated_at
          
        FROM contact c
        LEFT JOIN contact_address ca ON c.contact_id = ca.contact_id
        LEFT JOIN contact_education ce ON c.contact_id = ce.contact_id
        LEFT JOIN contact_experience cex ON c.contact_id = cex.contact_id
        LEFT JOIN event e ON c.contact_id = e.contact_id
        LEFT JOIN login l ON e.created_by = l.id
        GROUP BY 
          c.contact_id, c.created_by, l.email, c.created_at, c.name,
          c.phone_number, c.secondary_phone_number, c.email_address,
          c.secondary_email, c.skills, c.linkedin_url, c.dob, c.gender, 
          c.nationality, c.marital_status, c.category, c.emergency_contact_name, 
          c.emergency_contact_relationship, c.logger, c.updated_at,
          ca.street, ca.city, ca.state, ca.country, ca.zipcode, 
          ca.created_at, ca.updated_at
        ORDER BY c.created_at DESC
      `;
    }

    const result = await query;

    // Log the view operation
    try {
      await logContactModification(
        db,
        null,
        req.user?.id || "system",
        "VIEW ALL"
      );
    } catch (err) {
      console.warn("Contact modification logging failed:", err.message);
    }

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Error in GetAllContact:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// In admin and User
export const CreateContact = async (req, res) => {
  const {
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
    created_by,
    emergency_contact_name,
    emergency_contact_relationship,
    emergency_contact_phone_number,
    skills,
    logger,
    linkedin_url,
    address,
    education,
    experiences,
    events,
  } = req.body;

  console.log("CreateContact request body:", req.body);

  if (!name || !phone_number || !email_address) {
    return res.status(400).json({
      success: false,
      message:
        "Required fields are missing (name, phone_number, email_address).",
    });
  }

  try {
    const result = await db.begin(async (t) => {
      const existingContactsResult = await t`
          SELECT * FROM contact 
          WHERE (email_address = ${email_address} AND email_address IS NOT NULL)
            OR (phone_number = ${phone_number} AND phone_number IS NOT NULL)
          LIMIT 1
        `;

      if (existingContactsResult.length > 0) {
        throw new Error(
          `Contact with this email (${email_address}) or phone (${phone_number}) already exists.`
        );
      }

      const [contact] = await t`
          INSERT INTO contact (
            name, phone_number, email_address, dob, gender, nationality, marital_status, category,
            secondary_email, secondary_phone_number, created_by, emergency_contact_name,
            emergency_contact_relationship, emergency_contact_phone_number, skills, logger, linkedin_url
          ) VALUES (
            ${name}, 
            ${phone_number}, 
            ${email_address}, 
            ${sanitizeValue(dob)}, 
            ${sanitizeValue(gender)},
            ${sanitizeValue(nationality)}, 
            ${sanitizeValue(marital_status)}, 
            ${sanitizeValue(category)}, 
            ${sanitizeValue(secondary_email)},
            ${sanitizeValue(secondary_phone_number)}, 
            ${sanitizeValue(created_by)}, 
            ${sanitizeValue(emergency_contact_name)},
            ${sanitizeValue(emergency_contact_relationship)}, 
            ${sanitizeValue(emergency_contact_phone_number)}, 
            ${sanitizeValue(skills)},
            ${sanitizeValue(logger)}, 
            ${sanitizeValue(linkedin_url)}
          ) RETURNING *
        `;

      const contactId = contact.contact_id;
      console.log("Created new contact with ID:", contactId);

      let createdAddress = null,
        createdEducation = null;
      let createdExperiences = [],
        createdEvents = [];

      if (address) {
        [createdAddress] = await t`
            INSERT INTO contact_address (contact_id, street, city, state, country, zipcode) 
            VALUES (
              ${contactId}, 
              ${sanitizeValue(address.street)}, 
              ${sanitizeValue(address.city)}, 
              ${sanitizeValue(address.state)}, 
              ${sanitizeValue(address.country)}, 
              ${sanitizeValue(address.zipcode)}
            ) 
            RETURNING *
          `;
      }

      if (education) {
        [createdEducation] = await t`
            INSERT INTO contact_education (
              contact_id, 
              pg_course_name, pg_college, pg_university, pg_from_date, pg_to_date,
              ug_course_name, ug_college, ug_university, ug_from_date, ug_to_date
            ) VALUES (
              ${contactId}, 
              ${sanitizeValue(education.pg_course_name)}, 
              ${sanitizeValue(education.pg_college)}, 
              ${sanitizeValue(education.pg_university)}, 
              ${sanitizeValue(education.pg_from_date)}, 
              ${sanitizeValue(education.pg_to_date)},
              ${sanitizeValue(education.ug_course_name)}, 
              ${sanitizeValue(education.ug_college)}, 
              ${sanitizeValue(education.ug_university)}, 
              ${sanitizeValue(education.ug_from_date)}, 
              ${sanitizeValue(education.ug_to_date)}
            ) RETURNING *
          `;
      }

      if (experiences && experiences.length > 0) {
        for (const exp of experiences) {
          const [newExp] = await t`
              INSERT INTO contact_experience (
                contact_id, job_title, company, department, from_date, to_date, company_skills
              ) VALUES (
                ${contactId}, ${sanitizeValue(exp.job_title)}, ${sanitizeValue(
            exp.company
          )}, ${sanitizeValue(exp.department)}, 
                ${sanitizeValue(exp.from_date)}, ${sanitizeValue(
            exp.to_date
          )}, ${sanitizeValue(exp.company_skills)}
              ) RETURNING *
            `;
          createdExperiences.push(newExp);
        }
      }

      if (events && events.length > 0) {
        for (const event of events) {
          // Check if this event already exists (by event_id or photo_id)
          let existingEvent = null;

          if (event.event_id) {
            // If event_id is provided, find the existing event
            [existingEvent] = await t`
                SELECT * FROM event 
                WHERE event_id = ${event.event_id}
                LIMIT 1
              `;
          } else if (event.photo_id) {
            // If photo_id is provided, find event associated with that photo
            [existingEvent] = await t`
                SELECT * FROM event 
                WHERE photo_id = ${event.photo_id} 
                  AND event_name = ${event.event_name}
                LIMIT 1
              `;
          }

          if (existingEvent) {
            // Update the existing event to link it to the new contact
            const [updatedEvent] = await t`
                UPDATE event 
                SET contact_id = ${contactId}, 
                    event_role = ${
                      event.event_role || existingEvent.event_role
                    }, 
                    event_date = ${
                      event.event_date || existingEvent.event_date
                    }, 
                    event_held_organization = ${
                      event.event_held_organization ||
                      existingEvent.event_held_organization
                    }, 
                    event_location = ${
                      event.event_location || existingEvent.event_location
                    },
                    verified = ${
                      event.verified !== undefined
                        ? event.verified
                        : existingEvent.verified
                    },
                    updated_at = NOW()
                WHERE event_id = ${existingEvent.event_id}
                RETURNING *
              `;
            createdEvents.push(updatedEvent);
            console.log(
              `Linked existing event '${event.event_name}' to contact ${contactId}`
            );
          } else {
            // Create a new event if none exists
            const [newEvent] = await t`
                INSERT INTO event (
                  contact_id, photo_id, event_name, event_role, event_date, event_held_organization, event_location, verified, created_by
                ) VALUES (
                  ${contactId}, ${event.photo_id || null}, ${
              event.event_name
            }, ${event.event_role || null}, ${event.event_date || null}, 
                  ${event.event_held_organization || null}, ${
              event.event_location || null
            }, ${event.verified || false},
                  ${created_by || null}
                ) RETURNING *
              `;
            createdEvents.push(newEvent);
            console.log(
              `Created new event '${event.event_name}' for contact ${contactId}`
            );
          }
        }
      }

      try {
        logContactModification(db, contactId, created_by, "CREATE", t);
      } catch (err) {
        console.warn(
          "Contact modification logging failed, but continuing operation:",
          err.message
        );
        // Execution continues
      }

      return {
        contact,
        address: createdAddress,
        education: createdEducation,
        experiences: createdExperiences,
        events: createdEvents,
      };
    });

    return res.status(201).json({
      success: true,
      message: "Contact created successfully!",
      data: result,
    });
  } catch (err) {
    console.error("CreateContact error:", err);
    if (err.code === "23505") {
      return res.status(409).json({
        success: false,
        message: "A contact with this email or phone number already exists.",
      });
    }
    return res.status(500).json({
      success: false,
      message: "Server Error!",
      error: err.message,
    });
  }
};
// In User
export const GetContacts = async (req, res) => {
  try {
    const { userId } = req.params;
    const contacts = await db`
SELECT
    c.*,
    (SELECT row_to_json(ca) FROM contact_address ca WHERE ca.contact_id = c.contact_id LIMIT 1) as address,
    (SELECT row_to_json(ce) FROM contact_education ce WHERE ce.contact_id = c.contact_id LIMIT 1) as education,
    (SELECT json_agg(cx) FROM contact_experience cx WHERE cx.contact_id = c.contact_id) as experiences,
    json_build_array(row_to_json(e)) as events -- Event data as JSON object
FROM
    contact c
INNER JOIN 
    event e ON e.contact_id = c.contact_id
WHERE 
    e.created_by = ${userId}
ORDER BY
    c.contact_id DESC, e.event_id DESC

    `;

    return res.status(200).json({
      success: true,
      data: contacts,
    });
  } catch (err) {
    console.error("GetContacts error:", err);
    return res.status(500).json({
      success: false,
      message: "Server Error!",
      error: err.message,
    });
  }
};
// In MiddleMan
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

    return res.status(200).json({
      success: true,
      data: contacts,
    });
  } catch (err) {
    console.error("GetContactsByCategory error:", err);
    return res.status(500).json({
      success: false,
      message: "Server Error!",
      error: err.message,
    });
  }
};
// In MiddleMan
export const GetUnVerifiedContacts = async (req, res) => {
  try {
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
      ORDER BY c.contact_id DESC, e.event_id DESC
    `;

    return res.status(200).json({
      success: true,
      data: contactsWithEvents,
    });
  } catch (err) {
    console.error("GetUnVerifiedContacts error:", err);
    return res.status(500).json({
      success: false,
      message: "Server Error!",
      error: err.message,
    });
  }
};
// In User
export const UpdateContactAndEvents = async (req, res) => {
  console.log("here");
  const { id, userId } = req.params;
  const { name, phone_number, email_address, events } = req.body;

  if (!id) {
    return res.status(400).json({
      success: false,
      message: "Contact ID is required in the URL.",
    });
  }
  if (!name || !phone_number || !email_address) {
    return res.status(400).json({
      success: false,
      message:
        "Required fields are missing (name, phone_number, email_address).",
    });
  }
  if (!events || !Array.isArray(events) || events.length === 0) {
    return res.status(400).json({
      success: false,
      message: "The 'events' field must be a non-empty array.",
    });
  }

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
        success: false,
        message:
          "Each event object must contain all required fields (event_id, event_name, etc.).",
        invalid_event: event,
      });
    }
  }

  try {
    const result = await db.begin(async (t) => {
      const contactResults = await t`
        UPDATE contact
        SET
          name = ${name},
          phone_number = ${phone_number},
          email_address = ${email_address},
          updated_at = NOW()
        WHERE contact_id = ${id}
        RETURNING *
      `;

      if (contactResults.length === 0) {
        throw new Error("ContactNotFound");
      }
      const updatedContact = contactResults[0];

      const updatedEvents = [];
      for (const event of events) {
        const eventResults = await t`
          UPDATE event
          SET
            event_name = ${event.event_name},
            event_role = ${event.event_role},
            event_date = ${event.event_date},
            event_held_organization = ${event.event_held_organization},
            event_location = ${event.event_location},
            updated_at = NOW()
          WHERE
            event_id = ${event.event_id}
            AND contact_id = ${id}
          RETURNING *
        `;

        if (eventResults.length === 0) {
          throw new Error("EventNotFound");
        }
        updatedEvents.push(eventResults[0]);
      }

      try {
        logContactModification(db, id, userId, "UPDATE", t);
      } catch (err) {
        console.warn(
          "Contact modification logging failed, but continuing operation:",
          err.message
        );
        // Execution continues
      }

      return {
        contact: updatedContact,
        events: updatedEvents,
      };
    });

    return res.status(200).json({
      success: true,
      message: "Contact and events updated successfully!",
      data: result,
    });
  } catch (err) {
    console.error("Update Transaction Failed:", err);

    if (err.message === "ContactNotFound" || err.message === "EventNotFound") {
      return res.status(404).json({
        success: false,
        message:
          "Contact or one of the specified events not found for the given contact ID.",
      });
    }
    if (err.code === "23505") {
      return res.status(409).json({
        success: false,
        message: "A contact with this email address already exists.",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Server Error!",
      error: err.message,
    });
  }
};
// In MiddleMan and Admin
export const UpdateContact = async (req, res) => {
  const { contact_id } = req.params || {};
  const { event_verified, contact_status, userId } = req.query;
  const isVerified = event_verified === "true";

  const {
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
    created_by,
    address,
    education,
    event_id,
    event_name,
    event_role,
    event_date,
    event_held_organization,
    event_location,
    experiences,
  } = req.body;

  // Validate and sanitize ID fields to prevent empty string issues
  const validContactId = contact_id && contact_id !== "" ? contact_id : null;
  const validEventId = event_id && event_id !== "" ? event_id : null;
  const validAssignmentId =
    assignment_id && assignment_id !== "" ? assignment_id : null;

  console.log("UpdateContact received IDs:", {
    contact_id,
    validContactId,
    event_id,
    validEventId,
    assignment_id,
    validAssignmentId,
  });

  try {
    const result = await db.begin(async (t) => {
      let contactRecord;
      let existingContact = null;
      let wasExistingContact = false;

      if (!validContactId) {
        const existingContactsResult = await t`
          SELECT * FROM contact 
          WHERE (email_address = ${email_address} AND email_address IS NOT NULL)
             OR (phone_number = ${phone_number} AND phone_number IS NOT NULL)
          LIMIT 1
        `;

        existingContact = existingContactsResult[0];

        if (existingContact) {
          wasExistingContact = true;
          console.log(
            `Found existing contact: ${existingContact.contact_id}. Updating instead of creating duplicate.`
          );

          [contactRecord] = await t`
            UPDATE contact SET
              name = COALESCE(${name}, name),
              phone_number = COALESCE(${phone_number}, phone_number),
              email_address = COALESCE(${email_address}, email_address),
              dob = COALESCE(${dob}, dob),
              gender = COALESCE(${gender}, gender),
              nationality = COALESCE(${nationality}, nationality),
              marital_status = COALESCE(${marital_status}, marital_status),
              category = COALESCE(${category}, category),
              secondary_email = COALESCE(${secondary_email}, secondary_email),
              secondary_phone_number = COALESCE(${secondary_phone_number}, secondary_phone_number),
              emergency_contact_name = COALESCE(${emergency_contact_name}, emergency_contact_name),
              emergency_contact_relationship = COALESCE(${emergency_contact_relationship}, emergency_contact_relationship),
              emergency_contact_phone_number = COALESCE(${emergency_contact_phone_number}, emergency_contact_phone_number),
              skills = COALESCE(${skills}, skills),
              logger = COALESCE(${logger}, logger),
              linkedin_url = COALESCE(${linkedin_url}, linkedin_url),
              updated_at = NOW()
            WHERE contact_id = ${existingContact.contact_id}
            RETURNING *
          `;
        } else {
          console.log("Creating new contact...");
          [contactRecord] = await t`
            INSERT INTO contact (
              created_by, name, phone_number, email_address, dob, gender, nationality, marital_status, category,
              secondary_email, secondary_phone_number, emergency_contact_name, emergency_contact_relationship, 
              emergency_contact_phone_number, skills, logger, linkedin_url
            ) VALUES (
              ${created_by === undefined ? null : created_by}, 
              ${name === undefined ? null : name}, 
              ${phone_number === undefined ? null : phone_number}, 
              ${email_address === undefined ? null : email_address}, 
              ${dob === undefined ? null : dob},
              ${gender === undefined ? null : gender}, 
              ${nationality === undefined ? null : nationality}, 
              ${marital_status === undefined ? null : marital_status}, 
              ${category === undefined ? null : category},
              ${secondary_email === undefined ? null : secondary_email}, 
              ${
                secondary_phone_number === undefined
                  ? null
                  : secondary_phone_number
              }, 
              ${
                emergency_contact_name === undefined
                  ? null
                  : emergency_contact_name
              }, 
              ${
                emergency_contact_relationship === undefined
                  ? null
                  : emergency_contact_relationship
              }, 
              ${
                emergency_contact_phone_number === undefined
                  ? null
                  : emergency_contact_phone_number
              },
              ${skills === undefined ? null : skills}, 
              ${logger === undefined ? null : logger}, 
              ${linkedin_url === undefined ? null : linkedin_url}
            ) RETURNING *
          `;
        }
      } else {
        console.log("Updating existing contact...");
        [contactRecord] = await t`
          UPDATE contact SET
            name = ${name === undefined ? null : name},
            phone_number = ${phone_number === undefined ? null : phone_number},
            email_address = ${
              email_address === undefined ? null : email_address
            },
            dob = ${dob === undefined ? null : dob},
            gender = ${gender === undefined ? null : gender},
            nationality = ${nationality === undefined ? null : nationality},
            marital_status = ${
              marital_status === undefined ? null : marital_status
            },
            category = ${category === undefined ? null : category},
            secondary_email = ${
              secondary_email === undefined ? null : secondary_email
            },
            secondary_phone_number = ${
              secondary_phone_number === undefined
                ? null
                : secondary_phone_number
            },
            emergency_contact_name = ${
              emergency_contact_name === undefined
                ? null
                : emergency_contact_name
            },
            emergency_contact_relationship = ${
              emergency_contact_relationship === undefined
                ? null
                : emergency_contact_relationship
            },
            emergency_contact_phone_number = ${
              emergency_contact_phone_number === undefined
                ? null
                : emergency_contact_phone_number
            },
            skills = ${skills === undefined ? null : skills},
            logger = ${logger === undefined ? null : logger},
            linkedin_url = ${linkedin_url === undefined ? null : linkedin_url},
            updated_at = NOW()
          WHERE contact_id = ${validContactId}
          RETURNING *
        `;
      }

      const activeContactId = validContactId || contactRecord?.contact_id;
      let updatedAddress = null,
        updatedEducation = null;
      let updatedExperiences = [],
        updatedEvents = [];

      if (address && activeContactId) {
        [updatedAddress] = await t`
          INSERT INTO contact_address (contact_id, street, city, state, country, zipcode)
          VALUES (
            ${activeContactId}, 
            ${address.street === undefined ? null : address.street}, 
            ${address.city === undefined ? null : address.city}, 
            ${address.state === undefined ? null : address.state}, 
            ${address.country === undefined ? null : address.country}, 
            ${address.zipcode === undefined ? null : address.zipcode}
          )
          ON CONFLICT (contact_id) DO UPDATE SET
            street = EXCLUDED.street,
            city = EXCLUDED.city,
            state = EXCLUDED.state,
            country = EXCLUDED.country,
            zipcode = EXCLUDED.zipcode
          RETURNING *
        `;
      }

      if (education && activeContactId) {
        [updatedEducation] = await t`
          INSERT INTO contact_education (
            contact_id, pg_course_name, pg_college, pg_university, pg_from_date, pg_to_date,
            ug_course_name, ug_college, ug_university, ug_from_date, ug_to_date
          ) VALUES (
            ${activeContactId},
            ${
              education.pg_course_name === undefined
                ? null
                : education.pg_course_name
            }, 
            ${
              education.pg_college === undefined ? null : education.pg_college
            }, 
            ${
              education.pg_university === undefined
                ? null
                : education.pg_university
            }, 
            ${
              education.pg_from_date === undefined
                ? null
                : education.pg_from_date
            }, 
            ${education.pg_to_date === undefined ? null : education.pg_to_date},
            ${
              education.ug_course_name === undefined
                ? null
                : education.ug_course_name
            }, 
            ${
              education.ug_college === undefined ? null : education.ug_college
            }, 
            ${
              education.ug_university === undefined
                ? null
                : education.ug_university
            }, 
            ${
              education.ug_from_date === undefined
                ? null
                : education.ug_from_date
            }, 
            ${education.ug_to_date === undefined ? null : education.ug_to_date}
          ) ON CONFLICT (contact_id) DO UPDATE SET
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

      if (experiences && experiences.length > 0 && activeContactId) {
        await t`DELETE FROM contact_experience WHERE contact_id = ${activeContactId}`;
        for (const exp of experiences) {
          const [newExp] = await t`
            INSERT INTO contact_experience (
              contact_id, job_title, company, department, from_date, to_date, company_skills
            ) VALUES (
              ${activeContactId}, 
              ${exp.job_title === undefined ? null : exp.job_title}, 
              ${exp.company === undefined ? null : exp.company}, 
              ${exp.department === undefined ? null : exp.department}, 
              ${exp.from_date === undefined ? null : exp.from_date}, 
              ${exp.to_date === undefined ? null : exp.to_date}, 
              ${exp.company_skills === undefined ? null : exp.company_skills}
            ) RETURNING *
          `;
          updatedExperiences.push(newExp);
        }
      }

      if (validEventId && validEventId !== "" && activeContactId) {
        const eventIdValue = parseInt(validEventId, 10);
        if (!isNaN(eventIdValue)) {
          const [updatedEvent] = await t`
            UPDATE event SET
              event_name = ${event_name === undefined ? null : event_name},
              event_role = ${event_role === undefined ? null : event_role},
              event_date = ${event_date === undefined ? null : event_date},
              event_held_organization = ${
                event_held_organization === undefined
                  ? null
                  : event_held_organization
              },
              event_location = ${
                event_location === undefined ? null : event_location
              },
              verified = ${isVerified},
              contact_status = ${
                contact_status === undefined ? null : contact_status
              }
            WHERE event_id = ${eventIdValue} AND contact_id = ${activeContactId}
            RETURNING *
          `;
          if (updatedEvent) updatedEvents.push(updatedEvent);
        }
      }

      if (!validEventId && event_name && activeContactId) {
        const [existingEvent] = await t`
          SELECT * FROM event 
          WHERE contact_id = ${activeContactId} 
            AND event_name = ${event_name} 
            AND event_held_organization = ${event_held_organization || null}
          LIMIT 1
        `;

        if (!existingEvent) {
          console.log("Creating new event for contact...");
          const [newEvent] = await t`
            INSERT INTO event (
              contact_id, event_name, event_role, event_date, event_held_organization, event_location, verified, contact_status
            ) VALUES (
              ${activeContactId}, 
              ${event_name}, 
              ${event_role === undefined ? null : event_role}, 
              ${event_date === undefined ? null : event_date}, 
              ${
                event_held_organization === undefined
                  ? null
                  : event_held_organization
              }, 
              ${event_location === undefined ? null : event_location}, 
              ${isVerified}, 
              ${contact_status === undefined ? null : contact_status}
            ) RETURNING *
          `;
          if (newEvent) updatedEvents.push(newEvent);
        } else {
          console.log("Event already exists, updating instead...");
          const [updatedEvent] = await t`
            UPDATE event SET
              event_role = COALESCE(${
                event_role === undefined ? null : event_role
              }, event_role),
              event_date = COALESCE(${
                event_date === undefined ? null : event_date
              }, event_date),
              event_location = COALESCE(${
                event_location === undefined ? null : event_location
              }, event_location),
              verified = ${isVerified},
              contact_status = ${
                contact_status === undefined ? null : contact_status
              }
            WHERE event_id = ${existingEvent.event_id}
            RETURNING *
          `;
          if (updatedEvent) updatedEvents.push(updatedEvent);
        }
      }
      // Check if the event_id has an assignment first
      const eventIdValue =
        validEventId && validEventId !== "" ? parseInt(validEventId, 10) : null;
      const [eventAssignment] = await db`
    SELECT * FROM user_assignments 
    WHERE event_id = ${eventIdValue} 
    LIMIT 1
`;
      console.log(eventAssignment);

      if (validAssignmentId && validAssignmentId !== "") {
        const assignmentIdValue = parseInt(validAssignmentId, 10);
        if (!isNaN(assignmentIdValue)) {
          console.log(
            `Event ID ${validEventId} has an active assignment - updating as assigned user`
          );
          console.log("Marking assignment as completed:", assignmentIdValue);
          await t`UPDATE user_assignments SET completed = TRUE WHERE id = ${assignmentIdValue}`;

          try {
            console.log(userId);
            logContactModification(
              db,
              activeContactId,
              userId,
              "USER UPDATE",
              t,
              null
            );
          } catch (err) {
            console.warn(
              "Contact modification logging failed, but continuing operation:",
              err.message
            );
            // Execution continues
          }
        }
      } else {
        if (eventAssignment) {
          try {
            console.log(userId);
            logContactModification(
              db,
              activeContactId,
              userId,
              "USER VERIFY",
              t,
              null
            );
          } catch (err) {
            console.warn(
              "Contact modification logging failed, but continuing operation:",
              err.message
            );
          }
        } else {
          console.log(
            `Event ID ${event_id} has no assignment - regular update`
          );
          try {
            console.log(userId);
            logContactModification(
              db,
              activeContactId,
              userId,
              "UPDATE",
              t,
              null
            );
          } catch (err) {
            console.warn(
              "Contact modification logging failed, but continuing operation:",
              err.message
            );
            // Execution continues
          }
        }
      }

      return {
        contact: contactRecord,
        address: updatedAddress,
        education: updatedEducation,
        experiences: updatedExperiences,
        events: updatedEvents,
        wasExistingContact: wasExistingContact,
      };
    });

    const message = contact_id
      ? "Contact updated successfully!"
      : "Contact processed successfully!";
    return res.status(200).json({
      success: true,
      message,
      data: result,
    });
  } catch (err) {
    console.error("UpdateContact error:", err);
    return res.status(500).json({
      success: false,
      message: "Server Error!",
      error: err.message,
    });
  }
};
// In User delete and in MiddleMan reject
export const DeleteContact = async (req, res) => {
  const { contactId } = req.params;
  const { userType = null, eventId = null } = req.query;
  console.log(contactId, userType, eventId);
  try {
    await db.begin(async (t) => {
      let contact;

      if (eventId && eventId !== "null") {
        [contact] = await t`
          SELECT contact_id, contact_status, verified 
          FROM event 
          WHERE contact_id = ${contactId} AND event_id = ${eventId}
        `;
      } else {
        [contact] = await t`
          SELECT contact_id, contact_status, verified 
          FROM event 
          WHERE contact_id = ${contactId} AND event_id IS NULL
        `;
      }

      if (!contact) {
        throw new Error("Contact not found");
      }

      if (userType === "user") {
        if (
          (contact.contact_status === "pending" &&
            contact.verified === false) ||
          (contact.contact_status === "rejected" && contact.verified === true)
        ) {
          await performCompleteDeletion(t, contactId, eventId);

          return res.status(200).json({
            success: true,
            message: "Contact and all associated data deleted successfully!",
            action: "deleted",
          });
        } else if (
          contact.contact_status === "approved" &&
          contact.verified === true
        ) {
          return res.status(403).json({
            success: false,
            message:
              "Cannot delete approved and verified contacts. Contact support if needed.",
            action: "denied",
            reason: "Contact is approved and verified",
            contact_status: contact.contact_status,
            verified: contact.verified,
          });
        } else {
          return res.status(403).json({
            success: false,
            message:
              "You don't have permission to delete this contact as it is approved.",
            action: "denied",
            reason: "Insufficient permissions for current contact state",
            contact_status: contact.contact_status,
            verified: contact.verified,
          });
        }
      } else if (["cata", "catb", "catc", "admin"].includes(userType)) {
        await t`
          UPDATE event 
          SET contact_status = 'rejected', verified = ${true}
          WHERE contact_id = ${contactId} AND event_id=${eventId}
        `;

        return res.status(200).json({
          success: true,
          message: "Contact status updated to rejected successfully!",
          action: "rejected",
          previousStatus: contact.contact_status,
        });
      } else {
        throw new Error("Invalid user type");
      }
    });
  } catch (err) {
    console.error("DeleteContact error:", err);

    if (err.message === "Contact not found") {
      return res.status(404).json({
        success: false,
        message: "Contact not found.",
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
// In DeleteContact controller as a helper function
const performCompleteDeletion = async (transaction, contactId, eventId) => {
  await transaction`DELETE FROM event WHERE contact_id = ${contactId} AND event_id=${eventId}`;
};
// Separate controller for MiddleManHome verified contact deletion
export const DeleteVerifiedContact = async (req, res) => {
  const { contactId } = req.params;
  const { userType = null, eventId = null } = req.query;

  console.log(
    `MiddleManHome Delete - ContactId: ${contactId}, UserType: ${userType}, EventId: ${eventId}`
  );

  try {
    await db.begin(async (t) => {
      // Check if contact exists in the main contact table
      const [contactExists] = await t`
        SELECT contact_id FROM contact WHERE contact_id = ${contactId}
      `;

      if (!contactExists) {
        throw new Error("Contact not found in contact table");
      }

      // For middleman users (cata, catb, catc, admin), allow direct deletion
      if (["cata", "catb", "catc", "admin"].includes(userType)) {
        // Delete from contact table - foreign key constraints will handle cascading
        const result = await t`
          DELETE FROM contact WHERE contact_id = ${contactId}
        `;

        if (result.count === 0) {
          throw new Error("Failed to delete contact");
        }

        console.log(`Successfully deleted contact ${contactId} by ${userType}`);

        return res.status(200).json({
          success: true,
          message: "Contact and all associated data deleted successfully!",
          action: "deleted",
          deletedContactId: contactId,
          deletedBy: userType,
        });
      } else {
        return res.status(403).json({
          success: false,
          message: "You don't have permission to delete verified contacts.",
          action: "denied",
          reason: "Insufficient permissions - middleman access required",
        });
      }
    });
  } catch (err) {
    console.error("DeleteVerifiedContact error:", err);

    if (err.message === "Contact not found in contact table") {
      return res.status(404).json({
        success: false,
        message: "Contact not found.",
      });
    } else if (err.message === "Failed to delete contact") {
      return res.status(500).json({
        success: false,
        message: "Failed to delete contact from database.",
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
// In User
export const AddEventToExistingContact = async (req, res) => {
  const { contactId, userId } = req.params;
  const {
    eventName,
    eventRole,
    eventDate,
    eventHeldOrganization,
    eventLocation,
    verified,
  } = req.body;

  if (!eventName || !eventRole || !eventDate) {
    return res.status(400).json({
      success: false,
      message: "Required event fields are missing.",
    });
  }

  try {
    const [newEvent] = await db`
      INSERT INTO event (contact_id, event_name, event_role, event_date, event_held_organization, event_location, verified)
      VALUES (${contactId}, ${eventName}, ${eventRole}, ${eventDate}, ${eventHeldOrganization}, ${eventLocation}, ${
      verified || false
    })
      RETURNING *
    `;

    try {
      logContactModification(db, contactId, userId, "UPDATE USER EVENT");
    } catch (err) {
      console.warn(
        "Contact modification logging failed, but continuing operation:",
        err.message
      );
      // Execution continues
    }
    return res.status(201).json({
      success: true,
      message: "New event added successfully!",
      data: newEvent,
    });
  } catch (err) {
    console.error("AddEventToExistingContact error:", err);
    if (err.code === "23503")
      return res.status(404).json({
        success: false,
        message: "Contact not found.",
      });
    return res.status(500).json({
      success: false,
      message: "Server Error!",
      error: err.message,
    });
  }
};
// In User
export const SearchContacts = async (req, res) => {
  const { q } = req.query;

  if (!q) {
    return res.status(200).json({
      success: true,
      data: [],
    });
  }

  const searchTerm = `%${q}%`;

  try {
    const contacts = await db`
  SELECT
    contact_id,
    name,
    email_address,
    phone_number
  FROM
    contact
  WHERE
    (name ILIKE ${searchTerm} OR
     email_address ILIKE ${searchTerm} OR
     phone_number ILIKE ${searchTerm}) AND
    EXISTS (
      SELECT 1 
      FROM event 
      WHERE event.contact_id = contact.contact_id 
        AND event.verified = true
    )
  ORDER BY
    name
  LIMIT 10
`;

    return res.status(200).json({
      success: true,
      data: contacts,
    });
  } catch (err) {
    console.error("SearchContacts error:", err);
    return res.status(500).json({
      success: false,
      message: "Server Error!",
      error: err.message,
    });
  }
};
