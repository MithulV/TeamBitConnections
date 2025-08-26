// controllers/assignmentController.js

import db from "../src/config/db.js"; // Adjust the path if necessary

/**
 * @description Assign an event to a user. An event can only be assigned to one user.
 * @route POST /api/assignments
 * @access Public
 */
export const createAssignment = async (req, res) => {
    const { assigned_by, assigned_to, event_id } = req.body;

    // --- Validation ---
    if (!assigned_by || !assigned_to || !event_id) {
        return res.status(400).json({ message: "Fields assigned_by, assigned_to, and event_id are all required." });
    }

    if (String(assigned_by) === String(assigned_to)) {
        return res.status(400).json({ message: "A user cannot assign an event to themselves." });
    }

    try {
        // --- Check if the event is already assigned to anyone ---
        const [existingAssignment] = await db`
            SELECT * FROM user_assignments 
            WHERE event_id = ${event_id}
        `;

        if (existingAssignment) {
            return res.status(409).json({ message: "This event has already been assigned to another user." });
        }

        // --- Create new assignment ---
        const [newAssignment] = await db`
            INSERT INTO user_assignments (assigned_by, assigned_to, event_id)
            VALUES (${assigned_by}, ${assigned_to}, ${event_id})
            RETURNING *
        `;

        return res.status(201).json({ message: "Event assigned successfully!", data: newAssignment });
    } catch (err) {
        console.error("Error creating assignment:", err.message);

        // Handle unique constraint violation (race condition)
        if (err.code === "23505") {
            return res.status(409).json({ message: "Conflict: This event was just assigned to someone else." });
        }

        // Handle foreign key violation (user or event doesn't exist)
        if (err.code === "23503") {
            return res
                .status(404)
                .json({ message: "The specified user (assigner or assignee) or event does not exist." });
        }

        return res.status(500).json({ message: "Internal Server Error", error: err.message });
    }
};

/**
 * @description Get all events assigned TO a specific user.
 * @route GET /api/assignments/to/:userId
 * @access Public
 */
export const getAssignmentsForUser = async (req, res) => {
    const { userId } = req.params;

    try {
        const assignmentsWithContactDetails = await db`
            SELECT
                ua.id AS assignment_id,
                
                -- Include the full contact record for this assignment's event
                c.*,
                
                -- Also include the specific event that was assigned
                json_build_array(row_to_json(e)) as events,
                
                -- Use subqueries to fetch and nest related contact data as JSON,
                -- just like in GetUnVerifiedContacts.
                (SELECT row_to_json(ca) FROM contact_address ca WHERE ca.contact_id = c.contact_id) as address,
                (SELECT row_to_json(ce) FROM contact_education ce WHERE ce.contact_id = c.contact_id) as education,
                (SELECT json_agg(cx) FROM contact_experience cx WHERE cx.contact_id = c.contact_id) as experiences
                
            FROM
                -- Start with the user's assignments
                user_assignments ua
            
            -- Join to the 'event' table to get event details
            -- NOTE: Corrected the join condition from your original code.
            -- It now correctly joins on the event's primary key.
            INNER JOIN event e ON ua.event_id = e.event_id
            
            -- Join from the event to the 'contact' table to get the main contact info
            INNER JOIN contact c ON e.contact_id = c.contact_id
            
            WHERE
                -- Filter for the specific user
                ua.assigned_to = ${userId}
                
            ORDER BY
                ua.created_at DESC
        `;

        return res.status(200).json(assignmentsWithContactDetails );
    } catch (err) {
        console.error("Error fetching assignments for user:", err.message);
        return res.status(500).json({ message: "Internal Server Error", error: err.message });
    }
};

export const getAssignmentForEvent = async (req, res) => {
    const { eventId } = req.params;

    try {
        const [assignedUser] = await db`
            SELECT 
                ua.id AS assignment_id,
                ua.assigned_by,
                assignee.contact_id AS assigned_to_id,
                assignee.name AS assigned_to_name,
                assignee.email_address AS assigned_to_email
            FROM user_assignments ua
            JOIN contact assignee ON ua.assigned_to = assignee.contact_id
            WHERE ua.event_id = ${eventId}
        `;

        if (!assignedUser) {
            return res.status(404).json({ message: "This event has not been assigned to any user." });
        }

        return res.status(200).json({ data: assignedUser });
    } catch (err) {
        console.error("Error fetching assignment for event:", err.message);
        return res.status(500).json({ message: "Internal Server Error", error: err.message });
    }
};

/**
 * @description Revoke (delete) an event assignment by its ID.
 * @route DELETE /api/assignments/:assignmentId
 * @access Public
 */
export const revokeAssignment = async (req, res) => {
    const { assignmentId } = req.params;

    try {
        const [deletedAssignment] = await db`
            DELETE FROM user_assignments 
            WHERE id = ${assignmentId} 
            RETURNING *
        `;

        if (!deletedAssignment) {
            return res.status(404).json({ message: "Assignment not found." });
        }

        return res.status(200).json({ message: "Assignment revoked successfully." });
    } catch (err) {
        console.error("Error revoking assignment:", err.message);
        return res.status(500).json({ message: "Internal Server Error", error: err.message });
    }
};
