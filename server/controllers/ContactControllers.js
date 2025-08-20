import db from "../src/config/db.js";

// CREATE
export const CreateContact = async (req, res) => {
    const {
        name,
        phoneNumber,
        emailAddress,
        eventName,
        eventRole,
        eventDate,
        eventHeldOrganization,
        eventLocation
    } = req.body;

    if (
        !name ||
        !phoneNumber ||
        !emailAddress ||
        !eventName ||
        !eventRole ||
        !eventDate ||
        !eventHeldOrganization ||
        !eventLocation
    ) {
        return res.status(400).json({ message: "The required fields are missing." });
    }

    try {
        const result = await db.begin(async (t) => {
            const [contact] = await t`
                INSERT INTO contact (name, phone_number, email_address)
                VALUES (${name}, ${phoneNumber}, ${emailAddress})
                RETURNING contact_id, name
            `;

            const [event] = await t`
                INSERT INTO event (
                    contact_id, 
                    event_name, 
                    event_role, 
                    event_date, 
                    event_held_orgranization, 
                    event_location
                )
                VALUES (
                    ${contact.contact_id}, 
                    ${eventName}, 
                    ${eventRole}, 
                    ${eventDate}, 
                    ${eventHeldOrganization}, 
                    ${eventLocation}
                )
                RETURNING event_id, event_name
            `;

            return { contact, event };
        });

        return res.status(200).json({
            message: "Data Successfully Inserted!",
            data: result
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Server Error!", error: err.message });
    }
};

// READ (Get all contacts + events)
export const GetContacts = async (req, res) => {
    try {
        const contacts = await db`
            SELECT c.contact_id, c.name, c.phone_number, c.email_address,
                   e.event_id, e.event_name, e.event_role, e.event_date,
                   e.event_held_orgranization, e.event_location
            FROM contact c
            LEFT JOIN event e ON c.contact_id = e.contact_id
            ORDER BY c.contact_id DESC
        `;

        return res.status(200).json(contacts);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Server Error!", error: err.message });
    }
};

// UPDATE
export const UpdateContact = async (req, res) => {
    const { id } = req.params;
    const {
        name,
        phoneNumber,
        emailAddress,
        eventName,
        eventRole,
        eventDate,
        eventHeldOrganization,
        eventLocation
    } = req.body;

    try {
        const result = await db.begin(async (t) => {
            const [contact] = await t`
                UPDATE contact
                SET name = ${name},
                    phone_number = ${phoneNumber},
                    email_address = ${emailAddress}
                WHERE contact_id = ${id}
                RETURNING contact_id, name
            `;

            const [event] = await t`
                UPDATE event
                SET event_name = ${eventName},
                    event_role = ${eventRole},
                    event_date = ${eventDate},
                    event_held_orgranization = ${eventHeldOrganization},
                    event_location = ${eventLocation}
                WHERE contact_id = ${id}
                RETURNING event_id, event_name
            `;

            return { contact, event };
        });

        return res.status(200).json({
            message: "Data Successfully Updated!",
            data: result
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Server Error!", error: err.message });
    }
};

// DELETE
export const DeleteContact = async (req, res) => {
    const { id } = req.params;

    try {
        await db.begin(async (t) => {
            await t`DELETE FROM event WHERE contact_id = ${id}`;
            await t`DELETE FROM contact WHERE contact_id = ${id}`;
        });

        return res.status(200).json({ message: "Data Successfully Deleted!" });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Server Error!", error: err.message });
    }
};
