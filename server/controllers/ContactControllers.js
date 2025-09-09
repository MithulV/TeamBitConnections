import db from "../src/config/db.js";
import { logContactModification } from "./ModificationHistoryControllers.js";

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
          
          ca.street,
          ca.city,
          ca.state,
          ca.country,
          ca.zipcode,
          
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
          
          STRING_AGG(DISTINCT cex.job_title, '; ') as job_title,
          STRING_AGG(DISTINCT cex.company, '; ') as company_name,
          STRING_AGG(DISTINCT cex.department, '; ') as department_type,
          STRING_AGG(DISTINCT cex.from_date::text, '; ') as from_date,
          STRING_AGG(DISTINCT cex.to_date::text, '; ') as to_date,
          
          STRING_AGG(DISTINCT e.event_name, '; ') as event_name,
          STRING_AGG(DISTINCT e.event_role, '; ') as event_role,
          STRING_AGG(DISTINCT e.event_held_organization, '; ') as event_held_organization,
          STRING_AGG(DISTINCT e.event_location, '; ') as event_location,
          BOOL_OR(e.verified) as verified,
          STRING_AGG(DISTINCT e.contact_status, '; ') as contact_status
          
        FROM contact c
        LEFT JOIN login l ON c.created_by = l.id
        LEFT JOIN contact_address ca ON c.contact_id = ca.contact_id
        LEFT JOIN contact_education ce ON c.contact_id = ce.contact_id
        LEFT JOIN contact_experience cex ON c.contact_id = cex.contact_id
        LEFT JOIN event e ON c.contact_id = e.contact_id
        GROUP BY 
          c.contact_id, c.created_by, l.email, c.created_at, c.name,
          c.phone_number, c.secondary_phone_number, c.email_address,
          c.secondary_email, c.skills, c.linkedin_url,
          c.dob, c.gender, c.nationality, c.marital_status,
          c.category, c.emergency_contact_name, c.emergency_contact_relationship,
          c.logger, ca.street, ca.city, ca.state, ca.country, ca.zipcode
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
          
          ca.street,
          ca.city,
          ca.state,
          ca.country,
          ca.zipcode,
          
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
          
          STRING_AGG(DISTINCT cex.job_title, '; ') as job_title,
          STRING_AGG(DISTINCT cex.company, '; ') as company_name,
          STRING_AGG(DISTINCT cex.department, '; ') as department_type,
          STRING_AGG(DISTINCT cex.from_date::text, '; ') as from_date,
          STRING_AGG(DISTINCT cex.to_date::text, '; ') as to_date,
          
          STRING_AGG(DISTINCT e.event_name, '; ') as event_name,
          STRING_AGG(DISTINCT e.event_role, '; ') as event_role,
          STRING_AGG(DISTINCT e.event_held_organization, '; ') as event_held_organization,
          STRING_AGG(DISTINCT e.event_location, '; ') as event_location,
          BOOL_OR(e.verified) as verified,
          STRING_AGG(DISTINCT e.contact_status, '; ') as contact_status
          
        FROM contact c
        LEFT JOIN login l ON c.created_by = l.id
        LEFT JOIN contact_address ca ON c.contact_id = ca.contact_id
        LEFT JOIN contact_education ce ON c.contact_id = ce.contact_id
        LEFT JOIN contact_experience cex ON c.contact_id = cex.contact_id
        LEFT JOIN event e ON c.contact_id = e.contact_id
        GROUP BY 
          c.contact_id, c.created_by, l.email, c.created_at, c.name,
          c.phone_number, c.secondary_phone_number, c.email_address,
          c.secondary_email, c.skills, c.linkedin_url,
          c.dob, c.gender, c.nationality, c.marital_status,
          c.category, c.emergency_contact_name, c.emergency_contact_relationship,
          c.logger, ca.street, ca.city, ca.state, ca.country, ca.zipcode
        ORDER BY c.created_at DESC
      `;
        }

        const result = await query;

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
            message: "Required fields are missing (name, phone_number, email_address).",
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
          ${name}, ${phone_number}, ${email_address}, ${dob || null}, ${gender || null},
          ${nationality || null}, ${marital_status || null}, ${category || null}, ${secondary_email || null},
          ${secondary_phone_number || null}, ${created_by || null}, ${emergency_contact_name || null},
          ${emergency_contact_relationship || null}, ${emergency_contact_phone_number || null}, ${skills || null},
          ${logger || null}, ${linkedin_url || null}
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
          VALUES (${contactId}, ${address.street || null}, ${address.city || null}, ${address.state || null}, ${
                    address.country || null
                }, ${address.zipcode || null}) 
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
            ${education.pg_course_name || null}, ${education.pg_college || null}, ${education.pg_university || null}, 
            ${education.pg_from_date || null}, ${education.pg_to_date || null},
            ${education.ug_course_name || null}, ${education.ug_college || null}, ${education.ug_university || null}, 
            ${education.ug_from_date || null}, ${education.ug_to_date || null}
          ) RETURNING *
        `;
            }

            if (experiences && experiences.length > 0) {
                for (const exp of experiences) {
                    const [newExp] = await t`
            INSERT INTO contact_experience (
              contact_id, job_title, company, department, from_date, to_date, company_skills
            ) VALUES (
              ${contactId}, ${exp.job_title || null}, ${exp.company || null}, ${exp.department || null}, 
              ${exp.from_date || null}, ${exp.to_date || null}, ${exp.company_skills || null}
            ) RETURNING *
          `;
                    createdExperiences.push(newExp);
                }
            }

            if (events && events.length > 0) {
                for (const event of events) {
                    const [existingEvent] = await t`
            SELECT * FROM event 
            WHERE contact_id = ${contactId} 
              AND event_name = ${event.event_name}
              AND event_held_organization = ${event.event_held_organization || null}
            LIMIT 1
          `;

                    if (!existingEvent) {
                        const [newEvent] = await t`
              INSERT INTO event (
                contact_id, event_name, event_role, event_date, event_held_organization, event_location, verified, created_by
              ) VALUES (
                ${contactId}, ${event.event_name}, ${event.event_role || null}, ${event.event_date || null}, 
                ${event.event_held_organization || null}, ${event.event_location || null}, ${event.verified || false},
                ${created_by || null}
              ) RETURNING *
            `;
                        createdEvents.push(newEvent);
                    } else {
                        console.log(`Event '${event.event_name}' already exists for contact ${contactId}, skipping...`);
                    }
                }
            }

            try {
                logContactModification(db, contactId, created_by, "CREATE", t);
            } catch (err) {
                console.warn("Contact modification logging failed, but continuing operation:", err.message);
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
    e.created_by = 1
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

export const UpdateContactAndEvents = async (req, res) => {
    console.log("here")
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
            message: "Required fields are missing (name, phone_number, email_address).",
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
                message: "Each event object must contain all required fields (event_id, event_name, etc.).",
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
                console.warn("Contact modification logging failed, but continuing operation:", err.message);
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
                message: "Contact or one of the specified events not found for the given contact ID.",
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

    try {
        const result = await db.begin(async (t) => {
            let contactRecord;
            let existingContact = null;
            let wasExistingContact = false;

            if (!contact_id) {
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
              ${created_by || null}, ${name || null}, ${phone_number || null}, ${email_address || null}, ${dob || null},
              ${gender || null}, ${nationality || null}, ${marital_status || null}, ${category || null},
              ${secondary_email || null}, ${secondary_phone_number || null}, ${emergency_contact_name || null}, 
              ${emergency_contact_relationship || null}, ${emergency_contact_phone_number || null},
              ${skills || null}, ${logger || null}, ${linkedin_url || null}
            ) RETURNING *
          `;
                }
            } else {
                console.log("Updating existing contact...");
                [contactRecord] = await t`
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
            emergency_contact_relationship = ${emergency_contact_relationship || null},
            emergency_contact_phone_number = ${emergency_contact_phone_number || null},
            skills = ${skills || null},
            logger = ${logger || null},
            linkedin_url = ${linkedin_url || null},
            updated_at = NOW()
          WHERE contact_id = ${contact_id}
          RETURNING *
        `;
            }

            const activeContactId = contact_id || contactRecord?.contact_id;
            let updatedAddress = null,
                updatedEducation = null;
            let updatedExperiences = [],
                updatedEvents = [];

            if (address && activeContactId) {
                [updatedAddress] = await t`
          INSERT INTO contact_address (contact_id, street, city, state, country, zipcode)
          VALUES (${activeContactId}, ${address.street || null}, ${address.city || null}, ${address.state || null}, ${
                    address.country || null
                }, ${address.zipcode || null})
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
            ${education.pg_course_name || null}, ${education.pg_college || null}, ${education.pg_university || null}, 
            ${education.pg_from_date || null}, ${education.pg_to_date || null},
            ${education.ug_course_name || null}, ${education.ug_college || null}, ${education.ug_university || null}, 
            ${education.ug_from_date || null}, ${education.ug_to_date || null}
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
              ${activeContactId}, ${exp.job_title || null}, ${exp.company || null}, ${exp.department || null}, 
              ${exp.from_date || null}, ${exp.to_date || null}, ${exp.company_skills || null}
            ) RETURNING *
          `;
                    updatedExperiences.push(newExp);
                }
            }

            if (event_id && activeContactId) {
                const [updatedEvent] = await t`
          UPDATE event SET
            event_name = ${event_name || null},
            event_role = ${event_role || null},
            event_date = ${event_date || null},
            event_held_organization = ${event_held_organization || null},
            event_location = ${event_location || null},
            verified = ${isVerified},
            contact_status = ${contact_status || null}
          WHERE event_id = ${event_id} AND contact_id = ${activeContactId}
          RETURNING *
        `;
                if (updatedEvent) updatedEvents.push(updatedEvent);
            }

            if (!event_id && event_name && activeContactId) {
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
              ${activeContactId}, ${event_name}, ${event_role || null}, ${event_date || null}, 
              ${event_held_organization || null}, ${event_location || null}, ${isVerified}, ${contact_status || null}
            ) RETURNING *
          `;
                    if (newEvent) updatedEvents.push(newEvent);
                } else {
                    console.log("Event already exists, updating instead...");
                    const [updatedEvent] = await t`
            UPDATE event SET
              event_role = COALESCE(${event_role}, event_role),
              event_date = COALESCE(${event_date}, event_date),
              event_location = COALESCE(${event_location}, event_location),
              verified = ${isVerified},
              contact_status = ${contact_status || null}
            WHERE event_id = ${existingEvent.event_id}
            RETURNING *
          `;
                    if (updatedEvent) updatedEvents.push(updatedEvent);
                }
            }
            // Check if the event_id has an assignment first
            const [eventAssignment] = await db`
    SELECT * FROM user_assignments 
    WHERE event_id = ${event_id} 
    LIMIT 1
`;
            console.log(eventAssignment)

            if (assignment_id) {
                console.log(`Event ID ${event_id} has an active assignment - updating as assigned user`);
                console.log("Marking assignment as completed:", assignment_id);
                await t`UPDATE user_assignments SET completed = TRUE WHERE id = ${assignment_id}`;

                try {
                    console.log(userId);
                    logContactModification(db, activeContactId, userId, "USER UPDATE", t, null);
                } catch (err) {
                    console.warn("Contact modification logging failed, but continuing operation:", err.message);
                    // Execution continues
                }
            } else {
                if (eventAssignment) {
                    try {
                        console.log(userId);
                        logContactModification(db, activeContactId, userId, "USER VERIFY", t, null);
                    } catch (err) {
                        console.warn("Contact modification logging failed, but continuing operation:", err.message);
                    }
                } else {
                    console.log(`Event ID ${event_id} has no assignment - regular update`);
                    try {
                        console.log(userId);
                        logContactModification(db, activeContactId, userId, "UPDATE", t, null);
                    } catch (err) {
                        console.warn("Contact modification logging failed, but continuing operation:", err.message);
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

        const message = contact_id ? "Contact updated successfully!" : "Contact processed successfully!";
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

export const DeleteContact = async (req, res) => {
    const { id } = req.params;
    const { userType } = req.query;

    try {
        await db.begin(async (t) => {
            const [contact] = await t`
        SELECT contact_id, contact_status, verified 
        FROM event 
        WHERE contact_id = ${id}
      `;

            if (!contact) {
                throw new Error("Contact not found");
            }

            if (userType === "user") {
                if (
                    (contact.contact_status === "pending" || contact.contact_status === "rejected") &&
                    contact.verified === false
                ) {
                    await performCompleteDeletion(t, id);

                    return res.status(200).json({
                        success: true,
                        message: "Contact and all associated data deleted successfully!",
                        action: "deleted",
                    });
                } else if (contact.contact_status === "approved" && contact.verified === true) {
                    return res.status(403).json({
                        success: false,
                        message: "Cannot delete approved and verified contacts. Contact support if needed.",
                        action: "denied",
                        reason: "Contact is approved and verified",
                        contact_status: contact.contact_status,
                        verified: contact.verified,
                    });
                } else {
                    return res.status(403).json({
                        success: false,
                        message: "You don't have permission to delete this contact as it is approved.",
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
          WHERE contact_id = ${id}
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

const performCompleteDeletion = async (transaction, contactId) => {
    await transaction`DELETE FROM contact_address WHERE contact_id = ${contactId}`;
    await transaction`DELETE FROM contact_education WHERE contact_id = ${contactId}`;
    await transaction`DELETE FROM contact_experience WHERE contact_id = ${contactId}`;
    await transaction`DELETE FROM event WHERE contact_id = ${contactId}`;
    await transaction`DELETE FROM contact WHERE contact_id = ${contactId}`;
};

export const AddEventToExistingContact = async (req, res) => {
    const { contactId, userId } = req.params;
    const { eventName, eventRole, eventDate, eventHeldOrganization, eventLocation, verified } = req.body;

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
            logContactModification(db, contactId, userId, "UPDATE");
        } catch (err) {
            console.warn("Contact modification logging failed, but continuing operation:", err.message);
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

export const GetFilteredContacts = async (req, res) => {
    const queryParams = req.query;

    const normalizeParam = (param) => {
        if (!param) return null;
        return Array.isArray(param) ? param : [param];
    };

    const {
        name,
        phone_number,
        email_address,
        created_by,
        created_from,
        created_to,
        dob_from,
        dob_to,
        education_from_year,
        education_to_year,
        experience_from_year,
        experience_to_year,
        event_year,
        address_zipcode,
        address_street,
        page = 1,
        limit = 20,
        sort_by = "name",
        sort_order = "ASC",
    } = queryParams;

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
        const conditions = [];

        if (name) conditions.push(`c.name ILIKE '%${name}%'`);
        if (phone_number) conditions.push(`c.phone_number ILIKE '%${phone_number}%'`);
        if (email_address) conditions.push(`c.email_address ILIKE '%${email_address}%'`);
        if (created_by) conditions.push(`c.created_by = '${created_by}'`);

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

        if (nationality) {
            const nationalityConditions = nationality.map((nat) => `c.nationality ILIKE '%${nat}%'`);
            conditions.push(`(${nationalityConditions.join(" OR ")})`);
        }

        if (skills) {
            const skillsConditions = skills.map((skill) => `c.skills ILIKE '%${skill}%'`);
            conditions.push(`(${skillsConditions.join(" OR ")})`);
        }

        if (address_city) {
            const cityConditions = address_city.map((city) => `ca.city ILIKE '%${city}%'`);
            conditions.push(`(${cityConditions.join(" OR ")})`);
        }

        if (address_state) {
            const stateConditions = address_state.map((state) => `ca.state ILIKE '%${state}%'`);
            conditions.push(`(${stateConditions.join(" OR ")})`);
        }

        if (address_country) {
            const countryConditions = address_country.map((country) => `ca.country ILIKE '%${country}%'`);
            conditions.push(`(${countryConditions.join(" OR ")})`);
        }

        if (address_zipcode) conditions.push(`ca.zipcode = '${address_zipcode}'`);
        if (address_street) conditions.push(`ca.street ILIKE '%${address_street}%'`);

        if (pg_course_name) {
            const pgCourseConditions = pg_course_name.map((course) => `ce.pg_course_name ILIKE '%${course}%'`);
            conditions.push(`(${pgCourseConditions.join(" OR ")})`);
        }

        if (pg_college) {
            const pgCollegeConditions = pg_college.map((college) => `ce.pg_college ILIKE '%${college}%'`);
            conditions.push(`(${pgCollegeConditions.join(" OR ")})`);
        }

        if (pg_university) {
            const pgUniversityConditions = pg_university.map((uni) => `ce.pg_university ILIKE '%${uni}%'`);
            conditions.push(`(${pgUniversityConditions.join(" OR ")})`);
        }

        if (ug_course_name) {
            const ugCourseConditions = ug_course_name.map((course) => `ce.ug_course_name ILIKE '%${course}%'`);
            conditions.push(`(${ugCourseConditions.join(" OR ")})`);
        }

        if (ug_college) {
            const ugCollegeConditions = ug_college.map((college) => `ce.ug_college ILIKE '%${college}%'`);
            conditions.push(`(${ugCollegeConditions.join(" OR ")})`);
        }

        if (ug_university) {
            const ugUniversityConditions = ug_university.map((uni) => `ce.ug_university ILIKE '%${uni}%'`);
            conditions.push(`(${ugUniversityConditions.join(" OR ")})`);
        }

        if (job_title) {
            const jobTitleConditions = job_title.map((jt) => `exp.job_title ILIKE '%${jt}%'`);
            conditions.push(`(${jobTitleConditions.join(" OR ")})`);
        }

        if (company) {
            const companyConditions = company.map((comp) => `exp.company ILIKE '%${comp}%'`);
            conditions.push(`(${companyConditions.join(" OR ")})`);
        }

        if (department) {
            const departmentConditions = department.map((dept) => `exp.department ILIKE '%${dept}%'`);
            conditions.push(`(${departmentConditions.join(" OR ")})`);
        }

        if (event_name) {
            const eventNameConditions = event_name.map((name) => `e.event_name ILIKE '%${name}%'`);
            conditions.push(`(${eventNameConditions.join(" OR ")})`);
        }

        if (event_role) {
            const eventRoleConditions = event_role.map((role) => `e.event_role ILIKE '%${role}%'`);
            conditions.push(`(${eventRoleConditions.join(" OR ")})`);
        }

        if (event_organization) {
            const eventOrgConditions = event_organization.map((org) => `e.event_held_organization ILIKE '%${org}%'`);
            conditions.push(`(${eventOrgConditions.join(" OR ")})`);
        }

        if (event_location) {
            const eventLocationConditions = event_location.map((loc) => `e.event_location ILIKE '%${loc}%'`);
            conditions.push(`(${eventLocationConditions.join(" OR ")})`);
        }

        if (created_from) conditions.push(`c.created_at >= '${created_from}'`);
        if (created_to) conditions.push(`c.created_at <= '${created_to}'`);
        if (dob_from) conditions.push(`c.dob >= '${dob_from}'`);
        if (dob_to) conditions.push(`c.dob <= '${dob_to}'`);

        if (education_from_year)
            conditions.push(
                `(EXTRACT(YEAR FROM ce.pg_from_date) >= ${education_from_year} OR EXTRACT(YEAR FROM ce.ug_from_date) >= ${education_from_year})`
            );
        if (education_to_year)
            conditions.push(
                `(EXTRACT(YEAR FROM ce.pg_to_date) <= ${education_to_year} OR EXTRACT(YEAR FROM ce.ug_to_date) <= ${education_to_year})`
            );
        if (experience_from_year) conditions.push(`EXTRACT(YEAR FROM exp.from_date) >= ${experience_from_year}`);
        if (experience_to_year) conditions.push(`EXTRACT(YEAR FROM exp.to_date) <= ${experience_to_year}`);
        if (event_year) conditions.push(`EXTRACT(YEAR FROM e.event_date) = ${event_year}`);

        const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
        console.log("WHERE clause:", whereClause);

        const offset = (page - 1) * limit;
        const validSortFields = ["name", "email_address", "phone_number", "created_at", "dob"];
        const sortField = validSortFields.includes(sort_by) ? sort_by : "name";
        const sortDirection = sort_order.toUpperCase() === "DESC" ? "DESC" : "ASC";

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

        const contactsWithDetails = await Promise.all(
            contacts.map(async (contact) => {
                const experiences = await db`
          SELECT * FROM contact_experience 
          WHERE contact_id = ${contact.contact_id} 
          ORDER BY from_date DESC
        `;

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
            success: true,
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
        console.error("GetFilteredContacts error:", err);
        return res.status(500).json({
            success: false,
            message: "Server Error!",
            error: err.message,
        });
    }
};

export const GetFilterOptions = async (req, res) => {
    try {
        const genders = await db`
      SELECT DISTINCT gender as value, COUNT(*)::text as count 
      FROM contact WHERE gender IS NOT NULL 
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
      WHERE nationality IS NOT NULL
      GROUP BY nationality ORDER BY count DESC
    `;

        const maritalStatuses = await db`
      SELECT DISTINCT marital_status as value, COUNT(*)::text as count 
      FROM contact 
      WHERE marital_status IS NOT NULL
      GROUP BY marital_status ORDER BY count DESC
    `;

        const countries = await db`
      SELECT DISTINCT ca.country as value, COUNT(DISTINCT c.contact_id)::text as count
      FROM contact c JOIN contact_address ca ON c.contact_id = ca.contact_id
      WHERE ca.country IS NOT NULL
      GROUP BY ca.country ORDER BY count DESC
    `;

        const states = await db`
      SELECT DISTINCT ca.state as value, COUNT(DISTINCT c.contact_id)::text as count
      FROM contact c JOIN contact_address ca ON c.contact_id = ca.contact_id
      WHERE ca.state IS NOT NULL
      GROUP BY ca.state ORDER BY count DESC
    `;

        const cities = await db`
      SELECT DISTINCT ca.city as value, COUNT(DISTINCT c.contact_id)::text as count
      FROM contact c JOIN contact_address ca ON c.contact_id = ca.contact_id
      WHERE ca.city IS NOT NULL
      GROUP BY ca.city ORDER BY count DESC
    `;

        const companies = await db`
      SELECT DISTINCT exp.company as value, COUNT(DISTINCT c.contact_id)::text as count
      FROM contact c JOIN contact_experience exp ON c.contact_id = exp.contact_id
      WHERE exp.company IS NOT NULL
      GROUP BY exp.company ORDER BY count DESC
    `;

        const jobTitles = await db`
      SELECT DISTINCT exp.job_title as value, COUNT(DISTINCT c.contact_id)::text as count
      FROM contact c JOIN contact_experience exp ON c.contact_id = exp.contact_id
      WHERE exp.job_title IS NOT NULL
      GROUP BY exp.job_title ORDER BY count DESC
    `;

        const pgCourses = await db`
      SELECT DISTINCT ce.pg_course_name as value, COUNT(DISTINCT c.contact_id)::text as count
      FROM contact c JOIN contact_education ce ON c.contact_id = ce.contact_id
      WHERE ce.pg_course_name IS NOT NULL
      GROUP BY ce.pg_course_name ORDER BY count DESC
    `;

        const ugCourses = await db`
      SELECT DISTINCT ce.ug_course_name as value, COUNT(DISTINCT c.contact_id)::text as count
      FROM contact c JOIN contact_education ce ON c.contact_id = ce.contact_id
      WHERE ce.ug_course_name IS NOT NULL
      GROUP BY ce.ug_course_name ORDER BY count DESC
    `;

        const skillsData = await db`
      SELECT skills FROM contact 
      WHERE skills IS NOT NULL AND skills != ''
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
            success: true,
            data: {
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
            },
        });
    } catch (err) {
        console.error("GetFilterOptions error:", err);
        return res.status(500).json({
            success: false,
            error: err.message,
        });
    }
};

import { getModificationHistory } from "./ModificationHistoryControllers.js";

// Get contact modification history
export const getContactModificationHistory = async (req, res) => {
    try {
        const { id } = req.params;

        // Validate contact ID
        if (!id || isNaN(parseInt(id))) {
            return res.status(400).json({
                success: false,
                message: "Valid contact ID is required",
            });
        }

        const contactId = parseInt(id);

        // Fetch modification history
        const history = await getModificationHistory(db, contactId);

        if (!history || history.length === 0) {
            return res.status(404).json({
                success: false,
                message: "No modification history found for this contact",
            });
        }

        res.status(200).json({
            success: true,
            message: "Contact modification history retrieved successfully",
            data: history,
            count: history.length,
        });
    } catch (error) {
        console.error("Error in getContactModificationHistory controller:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error while fetching modification history",
            error: process.env.NODE_ENV === "development" ? error.message : undefined,
        });
    }
};
