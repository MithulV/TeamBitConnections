import cron from "node-cron";
import db from "../src/config/db.js";
import dotenv from "dotenv";
import nodemailer from "nodemailer";
import { logContactModification } from "./ModificationHistoryControllers.js";


// Schedule updated_at 2 month check daily at 9:00 AM
cron.schedule("* * * * *", async () => {
    console.log("Running 2-month update check at:", new Date());
    try {
        await checkForTwoMonthUpdates();
    } catch (error) {
        console.error("Two month update check failed:", error);
    }
});

// Schedule birthday check daily at 6:00 AM
cron.schedule("0 6 * * *", async () => {
    console.log("Running daily birthday check at:", new Date());
    try {
        await checkBirthdays();
    } catch (error) {
        console.error("Birthday check failed:", error);
    }
});

// Schedule contact check daily at 7:00 AM (checks for 30 day intervals)
cron.schedule("* * * * *", async () => {
    console.log("Running daily contact check at:", new Date());
    try {
        await checkLastContactDate();
    } catch (error) {
        console.error("Contact date check failed:", error);
    }
});

// Updated function to check for contacts needing updates (2 month check)
const checkForTwoMonthUpdates = async () => {
    try {
        console.log("Checking for contacts not updated in the last 2 months...");

        // Query to find contacts where last UPDATE modification was more than 2 months ago
        const contactsNeedingUpdate = await db`
            WITH last_update_dates AS (
                SELECT 
                    c.contact_id,
                    c.name,
                    c.phone_number,
                    c.email_address,
                    c.category,
                    c.created_at as contact_created_at,
                    c.updated_at as contact_updated_at,
                    MAX(CASE 
                        WHEN cmh.modification_type = 'UPDATE' 
                        THEN cmh.created_at 
                        ELSE NULL 
                    END) as last_update_date,
                    COUNT(CASE 
                        WHEN cmh.modification_type = 'UPDATE' 
                        THEN 1 
                        ELSE NULL 
                    END) as total_updates
                FROM contact c
                LEFT JOIN contact_modification_history cmh ON c.contact_id = cmh.contact_id
                WHERE c.contact_id IN (
                    SELECT DISTINCT contact_id 
                    FROM event 
                    WHERE verified = TRUE
                )
                GROUP BY c.contact_id, c.name, c.phone_number, c.email_address, c.category, c.created_at, c.updated_at
            )
            SELECT 
                contact_id,
                name,
                phone_number,
                email_address,
                category,
                contact_created_at,
                contact_updated_at,
                last_update_date,
                total_updates,
                CASE 
                    WHEN last_update_date IS NULL THEN 
                        EXTRACT(DAY FROM (NOW() - COALESCE(contact_updated_at, contact_created_at)))
                    ELSE 
                        EXTRACT(DAY FROM (NOW() - GREATEST(last_update_date, COALESCE(contact_updated_at, contact_created_at))))
                END as days_since_last_update
            FROM last_update_dates
            WHERE 
                -- If no UPDATE traces in cmh, check contact table dates against 2 months
                -- If UPDATE traces exist in cmh, check the most recent one against 2 months
                (
                    (total_updates = 0 AND COALESCE(contact_updated_at, contact_created_at) <= NOW() - INTERVAL '2 months')
                    OR 
                    (total_updates > 0 AND GREATEST(last_update_date, COALESCE(contact_updated_at, contact_created_at)) <= NOW() - INTERVAL '2 months')
                )
            ORDER BY days_since_last_update DESC
        `;

        console.log(`Found ${contactsNeedingUpdate.length} contacts needing detail updates:`,
            contactsNeedingUpdate.map(c => ({
                name: c.name,
                days: Math.floor(c.days_since_last_update),
                totalUpdates: c.total_updates,
                lastUpdateDate: c.last_update_date ? new Date(c.last_update_date).toLocaleDateString() : 'Never',
                contactUpdatedAt: c.contact_updated_at ? new Date(c.contact_updated_at).toLocaleDateString() : 'Never',
                hasUpdateTraces: c.total_updates > 0 ? 'Yes' : 'No'
            })));

        // Create tasks for each contact that needs detail update
        for (const contact of contactsNeedingUpdate) {
            await createContactUpdateTask(contact);
        }

        return {
            total: contactsNeedingUpdate.length,
            contacts: contactsNeedingUpdate
        };

    } catch (error) {
        console.error("Error in checkForTwoMonthUpdates:", error);
        throw error;
    }
};

// Helper function to create contact update tasks
const createContactUpdateTask = async (contact) => {
    try {
        const deadline = new Date();
        deadline.setDate(deadline.getDate() + 5); // 5 days from now
        const formattedDeadline = deadline.toISOString().split("T")[0]; // Format: YYYY-MM-DD

        const daysSince = Math.floor(contact.days_since_last_update);
        
        // Determine which date was used and provide context
        let updateHistory;
        if (contact.total_updates === 0) {
            // No UPDATE traces in modification history - use contact table
            if (contact.contact_updated_at) {
                updateHistory = `No update history found - using contact table date (${new Date(contact.contact_updated_at).toLocaleDateString()}). ${daysSince} days since last update`;
            } else {
                updateHistory = `Never been updated since creation (${daysSince} days since creation)`;
            }
        } else {
            // Has UPDATE traces - compare dates
            if (contact.last_update_date && contact.contact_updated_at) {
                const cmhDate = new Date(contact.last_update_date);
                const contactDate = new Date(contact.contact_updated_at);
                const moreRecentDate = cmhDate > contactDate ? cmhDate : contactDate;
                const sourceInfo = cmhDate > contactDate ? "latest UPDATE activity" : "contact table";
                updateHistory = `Last updated ${daysSince} days ago via ${sourceInfo} (${moreRecentDate.toLocaleDateString()})`;
            } else if (contact.last_update_date) {
                updateHistory = `Last updated ${daysSince} days ago via latest UPDATE activity (${new Date(contact.last_update_date).toLocaleDateString()})`;
            } else if (contact.contact_updated_at) {
                updateHistory = `Last updated ${daysSince} days ago via contact table (${new Date(contact.contact_updated_at).toLocaleDateString()})`;
            } else {
                updateHistory = `Never been updated (${daysSince} days since creation)`;
            }
        }

        const taskDescription = `Update the details of ${contact.name} whose phone number and email is ${contact.phone_number} and ${contact.email_address}. ${updateHistory}. Total previous updates: ${contact.total_updates}. Please verify and update contact information.`;

        // First, check if the task already exists (more specific check)
        const existingTask = await db`
            SELECT 1 FROM tasks 
            WHERE task_assigned_category = ${contact.category}
            AND task_title = ${"Monthly Personal Check of Details"}
            AND task_type = ${"automated"}
            AND contact_id = ${contact.contact_id}
            AND task_completion = false
            LIMIT 1`;

        // Only insert if no existing task found
        if (!existingTask || existingTask.length === 0) {
            const insertResult = await db`
                INSERT INTO tasks (
                    task_assigned_category, 
                    task_title, 
                    task_description, 
                    task_deadline, 
                    task_type, 
                    task_completion,
                    contact_id
                ) 
                VALUES (
                    ${contact.category},
                    ${"Monthly Personal Check of Details"},
                    ${taskDescription},
                    ${formattedDeadline},
                    ${"automated"},
                    false,
                    ${contact.contact_id}
                )`;

            console.log(`Update task created for: ${contact.name} (${daysSince} days since last update) - Update traces: ${contact.total_updates > 0 ? 'Found' : 'Missing'}`);
            return {
                success: true,
                contact: contact.name,
                taskCreated: true,
                daysSince: daysSince,
                hasUpdateTraces: contact.total_updates > 0
            };
        } else {
            console.log(`Update task already exists for: ${contact.name}`);
            return {
                success: true,
                contact: contact.name,
                taskCreated: false,
                reason: "Task already exists"
            };
        }
    } catch (error) {
        console.error(`Error creating update task for contact ${contact.name}:`, error);
        return {
            success: false,
            contact: contact.name,
            error: error.message
        };
    }
};

// Function to check contacts that haven't been contacted in 30 days (1 month)
const checkLastContactDate = async () => {
    try {
        console.log("Checking for contacts not contacted in the last 30 days...");

        // Query to find contacts where last CONTACT modification was more than 30 days ago
        const contactsNeedingContact = await db`
            WITH last_contact_dates AS (
                SELECT 
                    c.contact_id,
                    c.name,
                    c.phone_number,
                    c.email_address,
                    c.category,
                    c.created_at as contact_created_at,
                    MAX(CASE 
                        WHEN cmh.modification_type = 'CONTACT' 
                        THEN cmh.created_at 
                        ELSE NULL 
                    END) as last_contact_date,
                    COUNT(CASE 
                        WHEN cmh.modification_type = 'CONTACT' 
                        THEN 1 
                        ELSE NULL 
                    END) as total_contacts
                FROM contact c
                LEFT JOIN contact_modification_history cmh ON c.contact_id = cmh.contact_id
                WHERE c.contact_id IN (
                    SELECT DISTINCT contact_id 
                    FROM event 
                    WHERE verified = TRUE
                )
                GROUP BY c.contact_id, c.name, c.phone_number, c.email_address, c.category, c.created_at
            )
            SELECT 
                contact_id,
                name,
                phone_number,
                email_address,
                category,
                contact_created_at,
                last_contact_date,
                total_contacts,
                CASE 
                    WHEN last_contact_date IS NULL THEN 
                        EXTRACT(DAY FROM (NOW() - contact_created_at))
                    ELSE 
                        EXTRACT(DAY FROM (NOW() - last_contact_date))
                END as days_since_last_contact
            FROM last_contact_dates
            WHERE 
                -- If no CONTACT traces in cmh, check if contact created more than 30 days ago
                -- If CONTACT traces exist in cmh, check the most recent one against 30 days
                (
                    (total_contacts = 0 AND contact_created_at <= NOW() - INTERVAL '30 days')
                    OR 
                    (total_contacts > 0 AND last_contact_date <= NOW() - INTERVAL '30 days')
                )
            ORDER BY days_since_last_contact DESC
        `;

        console.log(`Found ${contactsNeedingContact.length} contacts needing follow-up contact:`,
            contactsNeedingContact.map(c => ({
                name: c.name,
                days: Math.floor(c.days_since_last_contact),
                totalContacts: c.total_contacts,
                lastContactDate: c.last_contact_date ? new Date(c.last_contact_date).toLocaleDateString() : 'Never',
                hasContactTraces: c.total_contacts > 0 ? 'Yes' : 'No'
            })));

        // Create tasks for each contact that needs follow-up
        for (const contact of contactsNeedingContact) {
            await createContactFollowupTask(contact);
        }

        return {
            total: contactsNeedingContact.length,
            contacts: contactsNeedingContact
        };

    } catch (error) {
        console.error("Error in checkLastContactDate:", error);
        throw error;
    }
};

// Function to create tasks for contacts needing follow-up contact
const createContactFollowupTask = async (contact) => {
    try {
        const deadline = new Date();
        deadline.setDate(deadline.getDate() + 7); // 7 days from now
        const formattedDeadline = deadline.toISOString().split("T")[0];

        const daysSince = Math.floor(contact.days_since_last_contact);
        
        let contactHistory;
        if (contact.total_contacts === 0) {
            // No CONTACT traces in modification history
            contactHistory = `Never been contacted - no contact history found (${daysSince} days since added)`;
        } else {
            // Has CONTACT traces
            const lastContactDateStr = new Date(contact.last_contact_date).toLocaleDateString();
            contactHistory = `Last contacted ${daysSince} days ago on ${lastContactDateStr} (latest CONTACT activity)`;
        }

        const taskDescription = `Follow-up contact needed for ${contact.name} (Phone: ${contact.phone_number}, Email: ${contact.email_address}). ${contactHistory}. Total previous contacts: ${contact.total_contacts}. Please reach out to maintain relationship.`;

        // Check if similar task already exists (prevent duplicates)
        const existingTask = await db`
            SELECT 1 FROM tasks 
            WHERE task_assigned_category = ${contact.category}
            AND task_title = ${"Contact Follow-up Required"}
            AND task_type = ${"automated"}
            AND contact_id = ${contact.contact_id}
            AND task_completion = false
            LIMIT 1`;

        // Only create task if it doesn't exist
        if (!existingTask || existingTask.length === 0) {
            const insertResult = await db`
                INSERT INTO tasks (
                    task_assigned_category, 
                    task_title, 
                    task_description, 
                    task_deadline, 
                    task_type,
                    task_completion,
                    contact_id
                ) 
                VALUES (
                    ${contact.category},
                    ${"Contact Follow-up Required"},
                    ${taskDescription},
                    ${formattedDeadline},
                    ${"automated"},
                    false,
                    ${contact.contact_id}
                )`;

            console.log(`Contact follow-up task created for: ${contact.name} (${daysSince} days since last contact) - Contact traces: ${contact.total_contacts > 0 ? 'Found' : 'Missing'}`);
            return {
                success: true,
                contact: contact.name,
                taskCreated: true,
                daysSince: daysSince,
                hasContactTraces: contact.total_contacts > 0
            };
        } else {
            console.log(`Contact follow-up task already exists for: ${contact.name}`);
            return {
                success: true,
                contact: contact.name,
                taskCreated: false,
                reason: "Task already exists"
            };
        }

    } catch (error) {
        console.error(`Error creating contact follow-up task for contact ${contact.contact_id}:`, error);
        return {
            success: false,
            contact: contact.name,
            error: error.message
        };
    }
};

// Create manual task
export const CreateTask = async (req, res) => {
    const { task_title, task_description, task_deadline, task_assigned_category, contact_id } = req.body;

    if (!task_title || !task_deadline || !task_assigned_category) {
        return res.status(400).json({
            success: false,
            error: "Missing required fields"
        });
    }

    try {
        const result = await db`
            INSERT INTO tasks (
                task_title, 
                task_description, 
                task_deadline, 
                task_assigned_category, 
                task_type, 
                task_completion,
                contact_id
            ) VALUES (
                ${task_title}, 
                ${task_description}, 
                ${task_deadline}, 
                ${task_assigned_category}, 
                'assigned', 
                FALSE,
                ${contact_id || null}
            )
        `;

        return res.status(201).json({
            success: true,
            message: "Task created successfully"
        });
    } catch (error) {
        console.error("Error creating task:", error);
        return res.status(500).json({
            success: false,
            error: "Internal server error"
        });
    }
};

export const GetTasks = async (req, res) => {
    const { category } = req.query;
    try {
        let tasks;
        let totalCount;
        let completedCount;
        let assignedTotal;
        let assignedCompleted;
        let automatedTotal;
        let automatedCompleted;

        // Admin-specific data with actual records
        let pendingTasks = [];
        let completedTasks = [];
        let totalTasks = [];
        let manualTasks = [];
        let automatedTasks = [];

        if (category === 'admin') {
            // Admin: Get all tasks with their records including contact names

            // Get pending tasks (task_completion = FALSE) with contact names
            pendingTasks = await db`
                SELECT 
                    t.*,
                    c.name as assigned_to_name,
                    c.email_address as assigned_to_email,
                    c.phone_number as assigned_to_phone
                FROM tasks t
                LEFT JOIN contact c ON t.contact_id = c.contact_id
                WHERE t.task_completion = FALSE 
                ORDER BY t.task_deadline ASC
            `;

            // Get completed tasks (task_completion = TRUE) with contact names
            completedTasks = await db`
                SELECT 
                    t.*,
                    c.name as assigned_to_name,
                    c.email_address as assigned_to_email,
                    c.phone_number as assigned_to_phone
                FROM tasks t
                LEFT JOIN contact c ON t.contact_id = c.contact_id
                WHERE t.task_completion = TRUE 
                ORDER BY t.task_deadline DESC
            `;

            // Get all tasks with contact names
            totalTasks = await db`
                SELECT 
                    t.*,
                    c.name as assigned_to_name,
                    c.email_address as assigned_to_email,
                    c.phone_number as assigned_to_phone
                FROM tasks t
                LEFT JOIN contact c ON t.contact_id = c.contact_id
                ORDER BY t.task_deadline ASC
            `;

            // Get manual tasks (task_type = 'assigned') with contact names
            manualTasks = await db`
                SELECT 
                    t.*,
                    c.name as assigned_to_name,
                    c.email_address as assigned_to_email,
                    c.phone_number as assigned_to_phone
                FROM tasks t
                LEFT JOIN contact c ON t.contact_id = c.contact_id
                WHERE t.task_type = 'assigned' 
                ORDER BY t.task_deadline ASC
            `;

            // Get automated tasks (task_type = 'automated') with contact names
            automatedTasks = await db`
                SELECT 
                    t.*,
                    c.name as assigned_to_name,
                    c.email_address as assigned_to_email,
                    c.phone_number as assigned_to_phone
                FROM tasks t
                LEFT JOIN contact c ON t.contact_id = c.contact_id
                WHERE t.task_type = 'automated' 
                ORDER BY t.task_deadline ASC
            `;

            // Get counts for stats
            totalCount = await db`SELECT COUNT(*) as count FROM tasks`;
            completedCount = await db`SELECT COUNT(*) as count FROM tasks WHERE task_completion = TRUE`;
            assignedTotal = await db`SELECT COUNT(*) as count FROM tasks WHERE task_type = 'assigned'`;
            assignedCompleted = await db`SELECT COUNT(*) as count FROM tasks WHERE task_type = 'assigned' AND task_completion = TRUE`;
            automatedTotal = await db`SELECT COUNT(*) as count FROM tasks WHERE task_type = 'automated'`;
            automatedCompleted = await db`SELECT COUNT(*) as count FROM tasks WHERE task_type = 'automated' AND task_completion = TRUE`;

            // Set tasks to pending tasks for backward compatibility
            tasks = pendingTasks;

        } else {
            // Other roles: Get pending tasks for their category ordered by deadline ASC with contact names
            tasks = await db`
                SELECT 
                    t.*,
                    c.name as assigned_to_name,
                    c.email_address as assigned_to_email,
                    c.phone_number as assigned_to_phone
                FROM tasks t
                LEFT JOIN contact c ON t.contact_id = c.contact_id
                WHERE t.task_completion = FALSE 
                AND t.task_assigned_category = ${category}
                ORDER BY t.task_deadline ASC
            `;

            totalCount = await db`SELECT COUNT(*) as count FROM tasks WHERE task_assigned_category = ${category}`;
            completedCount = await db`SELECT COUNT(*) as count FROM tasks WHERE task_assigned_category = ${category} AND task_completion = TRUE`;
            assignedTotal = await db`SELECT COUNT(*) as count FROM tasks WHERE task_assigned_category = ${category} AND task_type = 'assigned'`;
            assignedCompleted = await db`SELECT COUNT(*) as count FROM tasks WHERE task_assigned_category = ${category} AND task_type = 'assigned' AND task_completion = TRUE`;
            automatedTotal = await db`SELECT COUNT(*) as count FROM tasks WHERE task_assigned_category = ${category} AND task_type = 'automated'`;
            automatedCompleted = await db`SELECT COUNT(*) as count FROM tasks WHERE task_assigned_category = ${category} AND task_type = 'automated' AND task_completion = TRUE`;
        }

        const stats = {
            total: parseInt(totalCount[0].count),
            completed: parseInt(completedCount[0].count),
            pending: category === 'admin' ? pendingTasks.length : tasks.length,
            breakdown: {
                assigned: {
                    total: parseInt(assignedTotal[0].count),
                    completed: parseInt(assignedCompleted[0].count),
                    pending: category === 'admin'
                        ? pendingTasks.filter(task => task.task_type === "assigned").length
                        : tasks.filter(task => task.task_type === "assigned").length,
                },
                automated: {
                    total: parseInt(automatedTotal[0].count),
                    completed: parseInt(automatedCompleted[0].count),
                    pending: category === 'admin'
                        ? pendingTasks.filter(task => task.task_type === "automated").length
                        : tasks.filter(task => task.task_type === "automated").length,
                },
            },
        };

        // Build response object
        const response = {
            success: true,
            data: tasks, // This will be pending tasks with contact info
            stats: stats,
        };

        // Add admin-specific records if admin
        if (category === 'admin') {
            response.adminData = {
                pendingTasks: pendingTasks,
                completedTasks: completedTasks,
                totalTasks: totalTasks,
                manualTasks: manualTasks,
                automatedTasks: automatedTasks
            };
        }

        return res.status(200).json(response);

    } catch (error) {
        console.error("Error fetching tasks:", error);
        return res.status(500).json({
            success: false,
            error: "An internal server error occurred."
        });
    }
};


export const CompleteTask = async (req, res) => {
    const { id } = req.params;
    console.log(id)
    const { modified_by } = req.body;

    try {
        // Get task details including contact_id
        const taskDetails = await db`SELECT * FROM tasks WHERE id=${id} LIMIT 1`;

        if (taskDetails.length === 0) {
            return res.status(404).json({
                success: false,
                error: "Task not found"
            });
        }

        const task = taskDetails[0];

        // Update task as completed
        await db`UPDATE tasks SET task_completion = TRUE WHERE id=${id}`;

        // Log contact modification if contact_id exists
        console.log(task.contact_id, modified_by)
        if (task.contact_id && modified_by) {
            await logContactModification(db, task.contact_id, modified_by, "CONTACT");
        }

        return res.status(200).json({ success: true });

    } catch (error) {
        console.error("Error completing task:", error);
        return res.status(500).json({
            success: false,
            error: "An internal server error occurred."
        });
    }
};
export const UpdateTask = async (req, res) => {
    const { id } = req.params;
    const { task_title, task_description, task_deadline, task_assigned_category, contact_id } = req.body;
    if (!task_title || !task_deadline || !task_assigned_category) {
        return res.status(400).json({
            success: false,
            error: "Missing required fields"
        });
    }

    if (!id) {
        return res.status(400).json({
            success: false,
            error: "Task ID is required"
        });
    }

    try {
        // Check if task exists and is not completed
        const existingTask = await db`
            SELECT id, task_completion FROM tasks 
            WHERE id = ${id}
        `;

        if (existingTask.length === 0) {
            return res.status(404).json({
                success: false,
                error: "Task not found"
            });
        }

        if (existingTask[0].task_completion) {
            return res.status(400).json({
                success: false,
                error: "Cannot update completed task"
            });
        }

        // Update the task including contact_id
        const result = await db`
            UPDATE tasks SET
                task_title = ${task_title},
                task_description = ${task_description},
                task_deadline = ${task_deadline},
                task_assigned_category = ${task_assigned_category},
                contact_id = ${contact_id || null},
                updated_at = NOW()
            WHERE id = ${id} AND task_completion = FALSE
        `;

        if (result.count === 0) {
            return res.status(400).json({
                success: false,
                error: "Task not found or already completed"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Task updated successfully"
        });
    } catch (error) {
        console.error("Error updating task:", error);
        return res.status(500).json({
            success: false,
            error: "Internal server error"
        });
    }
};

// NEW: Delete task
export const DeleteTask = async (req, res) => {
    const { id } = req.params;

    if (!id) {
        return res.status(400).json({
            success: false,
            error: "Task ID is required"
        });
    }

    try {
        // Check if task exists and is not completed
        const existingTask = await db`
            SELECT id, task_completion, task_title FROM tasks 
            WHERE id = ${id}
        `;

        if (existingTask.length === 0) {
            return res.status(404).json({
                success: false,
                error: "Task not found"
            });
        }

        if (existingTask[0].task_completion) {
            return res.status(400).json({
                success: false,
                error: "Cannot delete completed task"
            });
        }

        // Delete the task
        const result = await db`
            DELETE FROM tasks 
            WHERE id = ${id} AND task_completion = FALSE
        `;

        if (result.count === 0) {
            return res.status(400).json({
                success: false,
                error: "Task not found or already completed"
            });
        }

        return res.status(200).json({
            success: true,
            message: `Task "${existingTask[0].task_title}" deleted successfully`
        });
    } catch (error) {
        console.error("Error deleting task:", error);
        return res.status(500).json({
            success: false,
            error: "Internal server error"
        });
    }
};

// NEW: Get single task (optional - for verification)
export const GetTaskById = async (req, res) => {
    const { id } = req.params;

    if (!id) {
        return res.status(400).json({
            success: false,
            error: "Task ID is required"
        });
    }

    try {
        const task = await db`
            SELECT * FROM tasks WHERE id = ${id}
        `;

        if (task.length === 0) {
            return res.status(404).json({
                success: false,
                error: "Task not found"
            });
        }

        return res.status(200).json({
            success: true,
            data: task[0]
        });
    } catch (error) {
        console.error("Error fetching task:", error);
        return res.status(500).json({
            success: false,
            error: "Internal server error"
        });
    }
};



dotenv.config();
// Configure email transporter
const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false, // true for 465, false for other ports
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});


// Birthday email template
const createBirthdayEmail = (name) => {
    return {
        subject: `🎉 Happy Birthday, ${name}! 🎂`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
                <div style="background-color: #4CAF50; color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0;">
                    <h1>🎉 Happy Birthday! 🎉</h1>
                </div>
                <div style="background-color: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                    <h2 style="color: #333;">Dear ${name},</h2>
                    <p style="font-size: 16px; line-height: 1.6; color: #666;">
                        🎂 Wishing you a very Happy Birthday! 🎂
                    </p>
                    <p style="font-size: 16px; line-height: 1.6; color: #666;">
                        May this special day bring you joy, happiness, and all the wonderful things you deserve. 
                        We hope your birthday is as amazing as you are!
                    </p>
                    <div style="text-align: center; margin: 30px 0;">
                        <div style="background-color: #FFE4B5; padding: 20px; border-radius: 10px; display: inline-block;">
                            🎈🎊 Have a fantastic day! 🎊🎈
                        </div>
                    </div>
                    <p style="font-size: 14px; color: #888; text-align: center;">
                        Best wishes,<br>
                        Bannari Amman Institute of Technology,Sathyamangalam
                    </p>
                </div>
            </div>
        `,
        text: `Happy Birthday, ${name}! Wishing you a wonderful day filled with joy and happiness. Best wishes from all of us!`,
    };
};


// Function to send birthday email
const sendBirthdayEmail = async (user) => {
    try {
        const emailContent = createBirthdayEmail(user.name);

        const mailOptions = {
            from: `"Bannari Amman Well Wishers" <${process.env.EMAIL_USER}>`,
            to: user.email_address,
            subject: emailContent.subject,
            html: emailContent.html,
            text: emailContent.text,
        };

        const info = await transporter.sendMail(mailOptions);
        console.log(
            `Birthday email sent to ${user.name} (${user.email}): ${info.messageId}`
        );

        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error(`Failed to send birthday email to ${user.name}:`, error);
        return { success: false, error: error.message };
    }
};


// Function to check and send birthday emails
const checkBirthdays = async () => {
    try {
        console.log("Checking for birthdays...", new Date());

        // Query to find users whose birthday is today
        const birthdayUsers = await db`
            SELECT * 
            FROM contact 
            WHERE EXTRACT(MONTH FROM dob) = EXTRACT(MONTH FROM CURRENT_DATE)
            AND EXTRACT(DAY FROM dob) = EXTRACT(DAY FROM CURRENT_DATE)
            AND email_address IS NOT NULL
        `;

        console.log(`Found ${birthdayUsers.length} birthday(s) today`);

        if (birthdayUsers.length > 0) {
            // Send emails to all birthday users
            const emailPromises = birthdayUsers.map((user) =>
                sendBirthdayEmail(user)
            );
            const results = await Promise.allSettled(emailPromises);

            const successful = results.filter(
                (r) => r.status === "fulfilled" && r.value.success
            ).length;
            const failed = results.length - successful;

            console.log(
                `Birthday emails sent: ${successful} successful, ${failed} failed`
            );

            return {
                total: birthdayUsers.length,
                successful,
                failed,
                users: birthdayUsers.map((u) => ({ name: u.name, email: u.email })),
            };
        }

        return { total: 0, successful: 0, failed: 0, users: [] };
    } catch (error) {
        console.error("Error checking birthdays:", error);
        throw error;
    }
};
