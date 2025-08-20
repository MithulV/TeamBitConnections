import db from "../src/config/db.js";

// CREATE: A contact with MULTIPLE experiences and one event
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

        // --- Experience Array ---
        experiences, // This is now an array of objects

        // --- Event Fields ---
        eventName,
        eventRole,
        eventDate,
        eventHeldOrganization,
        eventLocation
    } = req.body;

    // --- Validation ---
    if (!name || !phoneNumber || !emailAddress) {
        return res.status(400).json({ message: "Required contact fields are missing (name, phoneNumber, emailAddress)." });
    }
    // Validate the experiences array
    if (!experiences || !Array.isArray(experiences) || experiences.length === 0) {
        return res.status(400).json({ message: "The 'experiences' field must be a non-empty array." });
    }
     // Validate each experience object in the array
    for (const exp of experiences) {
        if (!exp.job_title || !exp.company || !exp.from_date) {
            return res.status(400).json({ message: "Each experience object must have job_title, company, and from_date." });
        }
    }
    if (!eventName || !eventRole || !eventDate || !eventHeldOrganization || !eventLocation) {
        return res.status(400).json({ message: "All event fields are required." });
    }


    try {
        const result = await db.begin(async (t) => {
            // 1. Insert into 'contact' table
            const [contact] = await t`
                INSERT INTO contact (
                    name, phone_number, email_address, verified, dob, gender,
                    nationality, marital_status, category, secondary_email,
                    secondary_phone_number, created_by
                )
                VALUES (
                    ${name}, ${phoneNumber}, ${emailAddress}, ${verified || null}, ${dob || null}, ${gender || null},
                    ${nationality || null}, ${marital_status || null}, ${category || null}, ${secondary_email || null},
                    ${secondary_phone_number || null}, ${created_by || null}
                )
                RETURNING *
            `;

            // 2. Loop through the experiences array and insert each one
            const createdExperiences = [];
            for (const exp of experiences) {
                const [newExperience] = await t`
                    INSERT INTO contact_experience (
                        contact_id, job_title, company, department, from_date, to_date
                    )
                    VALUES (
                        ${contact.contact_id}, ${exp.job_title}, ${exp.company}, 
                        ${exp.department || null}, ${exp.from_date}, ${exp.to_date || null}
                    )
                    RETURNING *
                `;
                createdExperiences.push(newExperience);
            }

            // 3. Insert into 'event' table
            const [event] = await t`
                INSERT INTO event (
                    contact_id, event_name, event_role, event_date, 
                    event_held_orgranization, event_location
                )
                VALUES (
                    ${contact.contact_id}, ${eventName}, ${eventRole}, ${eventDate}, 
                    ${eventHeldOrganization}, ${eventLocation}
                )
                RETURNING *
            `;

            return { contact, experiences: createdExperiences, event };
        });

        return res.status(201).json({
            message: "Contact, Experiences, and Event created successfully!",
            data: result
        });
    } catch (err)
 {
        console.error(err);
        return res.status(500).json({ message: "Server Error!", error: err.message });
    }
};

/*
================================================================
  NO CHANGES ARE NEEDED FOR GetContacts, UpdateContact, or DeleteContact
================================================================
*/


// READ: Get all contacts with their associated experiences and events nested
export const GetContacts = async (req, res) => {
    try {
        const contacts = await db`
            SELECT
                c.*,
                (
                    SELECT json_agg(ce)
                    FROM contact_experience ce
                    WHERE ce.contact_id = c.contact_id
                ) as experiences,
                (
                    SELECT json_agg(e)
                    FROM event e
                    WHERE e.contact_id = c.contact_id
                ) as events
            FROM
                contact c
            ORDER BY
                c.contact_id DESC
        `;

        return res.status(200).json(contacts);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Server Error!", error: err.message });
    }
};

// UPDATE: A contact and optionally one of their experiences and events
export const UpdateContact = async (req, res) => {
    const { id } = req.params;
    const {
        // Contact fields
        name, phoneNumber, emailAddress, verified, dob, gender, nationality,
        marital_status, category, secondary_email, secondary_phone_number, created_by,

        // Experience fields - MUST include experience_id to update
        experience_id, job_title, company, department, from_date, to_date,

        // Event fields - MUST include event_id to update
        event_id, eventName, eventRole, eventDate, eventHeldOrganization, eventLocation
    } = req.body;

    // Validate mandatory contact fields for an update
    if (!name || !phoneNumber || !emailAddress) {
        return res.status(400).json({ message: "The required fields 'name', 'phoneNumber', and 'emailAddress' are missing." });
    }

    try {
        const result = await db.begin(async (t) => {
            // 1. Update contact
            const [contact] = await t`
                UPDATE contact
                SET name = ${name}, phone_number = ${phoneNumber}, email_address = ${emailAddress},
                    verified = ${verified || null}, dob = ${dob || null}, gender = ${gender || null},
                    nationality = ${nationality || null}, marital_status = ${marital_status || null},
                    category = ${category || null}, secondary_email = ${secondary_email || null},
                    secondary_phone_number = ${secondary_phone_number || null}, created_by = ${created_by || null}
                WHERE contact_id = ${id}
                RETURNING *
            `;

            if (!contact) {
                throw new Error("Contact not found");
            }

            let experience = null;
            if (experience_id) { // Only update if an experience_id is provided
                [experience] = await t`
                    UPDATE contact_experience
                    SET job_title = ${job_title}, company = ${company}, department = ${department || null},
                        from_date = ${from_date}, to_date = ${to_date || null}
                    WHERE id = ${experience_id} AND contact_id = ${id}
                    RETURNING *
                `;
            }

            let event = null;
            if (event_id) { // Only update if an event_id is provided
                [event] = await t`
                    UPDATE event
                    SET event_name = ${eventName}, event_role = ${eventRole}, event_date = ${eventDate},
                        event_held_orgranization = ${eventHeldOrganization}, event_location = ${eventLocation}
                    WHERE event_id = ${event_id} AND contact_id = ${id}
                    RETURNING *
                `;
            }

            return { contact, experience, event };
        });

        return res.status(200).json({
            message: "Data successfully updated!",
            data: result
        });
    } catch (err) {
        console.error(err);
        if (err.message === "Contact not found") {
            return res.status(404).json({ message: "Contact not found." });
        }
        return res.status(500).json({ message: "Server Error!", error: err.message });
    }
};

// DELETE: A contact and all of their associated data
export const DeleteContact = async (req, res) => {
    const { id } = req.params;

    try {
        await db.begin(async (t) => {
            // Order is important due to foreign keys
            await t`DELETE FROM contact_experience WHERE contact_id = ${id}`;
            await t`DELETE FROM event WHERE contact_id = ${id}`;
            
            const result = await t`DELETE FROM contact WHERE contact_id = ${id} RETURNING contact_id`;
            
            if (result.count === 0) {
                throw new Error("Contact not found");
            }
        });

        return res.status(200).json({ message: "Contact and all associated data deleted successfully!" });
    } catch (err) {
        console.error(err);
        if (err.message === "Contact not found") {
            return res.status(404).json({ message: "Contact not found." });
        }
        return res.status(500).json({ message: "Server Error!", error: err.message });
    }
};