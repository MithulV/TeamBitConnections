import db from "../src/config/db.js";

// CREATE: A contact and their core information (address, education, experiences, events)
export const CreateContact = async (req, res) => {
    const {
        // --- Contact Fields ---
        name,
        phoneNumber,
        emailAddress,
        verified,
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
    if (!name || !phoneNumber || !emailAddress) {
        return res.status(400).json({ message: "Required fields are missing (name, phoneNumber, emailAddress)." });
    }

    try {
        const result = await db.begin(async (t) => {
            // 1. Insert the main contact record
            const [contact] = await t`
                INSERT INTO contact (
                    name, phone_number, email_address, verified, dob, gender, nationality, marital_status, category,
                    secondary_email, secondary_phone_number, created_by, emergency_contact_name,
                    emergency_contact_relationship, emergency_contact_phone_number, skills, logger, linkedin_url
                ) VALUES (
                    ${name}, ${phoneNumber}, ${emailAddress}, ${verified || null}, ${dob || null}, ${gender || null},
                    ${nationality || null}, ${marital_status || null}, ${category || null}, ${secondary_email || null},
                    ${secondary_phone_number || null}, ${created_by || null}, ${emergency_contact_name || null},
                    ${emergency_contact_relationship || null}, ${emergency_contact_phone_number || null}, ${
                skills || null
            },
                    ${logger || null}, ${linkedin_url || null}
                ) RETURNING *
            `;
            const contactId = contact.contact_id;

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
            ${education.pg_course_name || null}, ${education.pg_college || null}, ${education.pg_university || null}, ${
                    education.pg_from_date || null
                }, ${education.pg_to_date || null},
            ${education.ug_course_name || null}, ${education.ug_college || null}, ${education.ug_university || null}, ${
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
                ${contactId}, ${exp.job_title}, ${exp.company}, ${exp.department || null}, ${exp.from_date}, ${
                        exp.to_date
                    }
            ) RETURNING *`;
                    createdExperiences.push(newExp);
                }
            }

            // 5. Insert Events Array (if provided)
            if (events && events.length > 0) {
                for (const event of events) {
                    const [newEvent] =
                        await t`INSERT INTO event (contact_id, event_name, event_role, event_date, event_held_orgranization, event_location, verified) VALUES (${contactId}, ${
                            event.eventName
                        }, ${event.eventRole}, ${event.eventDate}, ${event.eventHeldOrganization}, ${
                            event.eventLocation
                        }, ${event.verified || false}) RETURNING *`;
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

        return res.status(201).json({ message: "Contact created successfully!", data: result });
    } catch (err) {
        console.error(err);
        if (err.code === "23505") {
            return res.status(409).json({ message: "A contact with this email already exists." });
        }
        return res.status(500).json({ message: "Server Error!", error: err.message });
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
        return res.status(500).json({ message: "Server Error!", error: err.message });
    }
};

export const GetUnVerifiedContacts = async (req, res) => {
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
                verified IS NULL
            ORDER BY
                c.contact_id DESC
        `;

        return res.status(200).json(contacts);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Server Error!", error: err.message });
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
        return res.status(400).json({ message: "Contact ID is required in the URL." });
    }
    if (!name || !phone_number || !email_address) {
        return res.status(400).json({ message: "Required fields are missing (name, phone_number, email_address)." });
    }
    if (!events || !Array.isArray(events) || events.length === 0) {
        return res.status(400).json({ message: "The 'events' field must be a non-empty array." });
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
                message: "Each event object must contain all required fields (event_id, event_name, etc.).",
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
                        event_held_orgranization = ${event.event_held_organization},
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
            return res
                .status(404)
                .json({ message: "Contact or one of the specified events not found for the given contact ID." });
        }
        // PostgreSQL unique_violation error code
        if (err.code === "23505") {
            return res.status(409).json({ message: "A contact with this email address already exists." });
        }

        // Generic server error for all other cases
        return res.status(500).json({ message: "Server Error!", error: err.message });
    }
};

// UPDATE: A contact's core details
export const UpdateContact = async (req, res) => {
    const { id } = req.params;
    const { name, phoneNumber, skills, linkedin_url } = req.body;

    if (!name || !phoneNumber) {
        return res.status(400).json({ message: "The required fields 'name' and 'phoneNumber' are missing." });
    }

    try {
        const [updatedContact] = await db`
            UPDATE contact SET
                name = ${name},
                phone_number = ${phoneNumber},
                skills = ${skills},
                linkedin_url = ${linkedin_url || null}
            WHERE contact_id = ${id}
            RETURNING *
        `;

        if (!updatedContact) {
            return res.status(404).json({ message: "Contact not found." });
        }

        return res.status(200).json({ message: "Contact updated successfully!", data: updatedContact });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Server Error!", error: err.message });
    }
};

// DELETE: A contact and ALL of their associated data (except photos)
export const DeleteContact = async (req, res) => {
    const { id } = req.params;

    try {
        await db.begin(async (t) => {
            // First, check if contact exists to provide a clear error message
            const [contact] = await t`SELECT contact_id FROM contact WHERE contact_id = ${id}`;
            if (!contact) {
                throw new Error("Contact not found");
            }

            // Delete from all child tables
            await t`DELETE FROM contact_address WHERE contact_id = ${id}`;
            await t`DELETE FROM contact_education WHERE contact_id = ${id}`;
            await t`DELETE FROM contact_experience WHERE contact_id = ${id}`;
            await t`DELETE FROM event WHERE contact_id = ${id}`;

            // Finally, delete the parent contact record
            await t`DELETE FROM contact WHERE contact_id = ${id}`;
        });

        return res.status(200).json({ message: "Contact and all associated data deleted successfully!" });
    } catch (err) {
        console.error(err);
        return err.message === "Contact not found"
            ? res.status(404).json({ message: "Contact not found." })
            : res.status(500).json({ message: "Server Error!", error: err.message });
    }
};

// ADD EVENT to an existing contact
export const AddEventToExistingContact = async (req, res) => {
    const { contactId } = req.params;
    const { eventName, eventRole, eventDate, eventHeldOrganization, eventLocation, verified } = req.body;

    if (!eventName || !eventRole || !eventDate) {
        return res.status(400).json({ message: "Required event fields are missing." });
    }

    try {
        const [newEvent] = await db`
            INSERT INTO event (contact_id, event_name, event_role, event_date, event_held_orgranization, event_location, verified)
            VALUES (${contactId}, ${eventName}, ${eventRole}, ${eventDate}, ${eventHeldOrganization}, ${eventLocation}, ${
            verified || false
        })
            RETURNING *
        `;
        return res.status(201).json({ message: "New event added successfully!", data: newEvent });
    } catch (err) {
        console.error(err);
        if (err.code === "23503") return res.status(404).json({ message: "Contact not found." });
        return res.status(500).json({ message: "Server Error!", error: err.message });
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
        return res.status(500).json({ message: "Server Error!", error: err.message });
    }
};
